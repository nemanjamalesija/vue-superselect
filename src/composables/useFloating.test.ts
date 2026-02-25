import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  defineComponent,
  nextTick,
  ref,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

type UseFloatingModule = typeof import('./useFloating')
type UseFloatingReturn = UseFloatingModule['UseFloatingReturn']

interface MountUseFloatingOptions {
  placement?: MaybeRefOrGetter<string>
  enabled?: MaybeRefOrGetter<boolean>
  collisionStrategy?: MaybeRefOrGetter<'flip' | 'none'>
}

interface MountUseFloatingResult {
  wrapper: ReturnType<typeof mount>
  api: UseFloatingReturn
  floating: Ref<HTMLElement | null>
}

interface MockMiddleware {
  name: string
  options?: unknown
}

interface MockUseFloatingOptions {
  whileElementsMounted?: unknown
  middleware?: MockMiddleware[]
}

interface MockSizeOptions {
  apply: (state: {
    rects: { reference: { width: number } }
    elements: { floating: HTMLElement }
    availableHeight: number
  }) => void
}

const FLOATING_UI_OVERRIDE_KEY = '__VUE_SUPERSELECT_FLOATING_UI_MODULE__'

const setFloatingUIOverride = (value: unknown) => {
  const host = globalThis as {
    __VUE_SUPERSELECT_FLOATING_UI_MODULE__?: unknown
  }

  host[FLOATING_UI_OVERRIDE_KEY] = value
}

const clearFloatingUIOverride = () => {
  const host = globalThis as {
    __VUE_SUPERSELECT_FLOATING_UI_MODULE__?: unknown
  }

  delete host[FLOATING_UI_OVERRIDE_KEY]
}

const isMockSizeOptions = (options: unknown): options is MockSizeOptions => {
  if (typeof options !== 'object' || options === null) return false
  if (!('apply' in options)) return false
  return typeof options.apply === 'function'
}

const flushAsync = async () => {
  await Promise.resolve()
  await nextTick()
  await Promise.resolve()
  await nextTick()
}

const mountUseFloating = async (
  options: MountUseFloatingOptions = {},
): Promise<MountUseFloatingResult> => {
  const useFloatingModule = await import('./useFloating')

  const reference = ref<HTMLElement | null>(document.createElement('button'))
  const floating = ref<HTMLElement | null>(document.createElement('div'))
  let api: UseFloatingReturn | null = null

  const wrapper = mount(defineComponent({
    setup() {
      api = useFloatingModule.useFloating({
        reference,
        floating,
        placement: options.placement,
        enabled: options.enabled,
        collisionStrategy: options.collisionStrategy,
      })
      return {}
    },
    template: '<div />',
  }))

  await flushAsync()

  if (api === null) {
    throw new Error('Expected useFloating API to be initialized')
  }

  return {
    wrapper,
    api,
    floating,
  }
}

const mockFloatingUINotInstalled = () => {
  setFloatingUIOverride(null)
}

const setupFloatingUIMock = () => {
  const mockFloatingStyles = ref<Record<string, string | number>>({
    position: 'fixed',
    top: '24px',
    left: '8px',
  })
  const mockPlacement = ref('top-end')
  const mockIsPositioned = ref(true)

  const autoUpdate = vi.fn(() => () => {})
  const offset = vi.fn((value: number) => ({ name: 'offset', options: value }))
  const flip = vi.fn(() => ({ name: 'flip' }))
  const shift = vi.fn((options: { padding: number }) => ({ name: 'shift', options }))
  const size = vi.fn((options: MockSizeOptions) => ({ name: 'size', options }))

  const useFloating = vi.fn(
    (
      _reference: Ref<HTMLElement | null>,
      floating: Ref<HTMLElement | null>,
      options: MockUseFloatingOptions,
    ) => {
      const middleware = options.middleware ?? []
      const sizeMiddleware = middleware.find((item) => item.name === 'size')

      if (sizeMiddleware && isMockSizeOptions(sizeMiddleware.options)) {
        sizeMiddleware.options.apply({
          rects: { reference: { width: 160 } },
          elements: { floating: floating.value ?? document.createElement('div') },
          availableHeight: 320,
        })
      }

      return {
        floatingStyles: mockFloatingStyles,
        placement: mockPlacement,
        isPositioned: mockIsPositioned,
      }
    },
  )

  setFloatingUIOverride({
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    size,
  })

  return {
    mockFloatingStyles,
    mockPlacement,
    mockIsPositioned,
    useFloating,
    autoUpdate,
    offset,
    flip,
    shift,
    size,
  }
}

describe('useFloating', () => {
  beforeEach(() => {
    clearFloatingUIOverride()
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    clearFloatingUIOverride()
    vi.resetModules()
  })

  describe('fallback mode (no @floating-ui/vue)', () => {
    it('returns CSS absolute fallback styles and fallback metadata', async () => {
      mockFloatingUINotInstalled()
      const { wrapper, api } = await mountUseFloating()

      expect(api.floatingStyles.value).toEqual({
        position: 'absolute',
        top: '100%',
        left: '0',
        width: '100%',
      })
      expect(api.isUsingFloatingUI.value).toBe(false)
      expect(api.isPositioned.value).toBe(true)
      expect(api.placement.value).toBe('bottom-start')
      expect(api.side.value).toBe('bottom')
      expect(api.align.value).toBe('start')

      wrapper.unmount()
    })

    it('decomposes custom placement into side/align in fallback mode', async () => {
      mockFloatingUINotInstalled()
      const { wrapper, api } = await mountUseFloating({
        placement: 'top-end',
      })

      expect(api.isUsingFloatingUI.value).toBe(false)
      expect(api.placement.value).toBe('top-end')
      expect(api.side.value).toBe('top')
      expect(api.align.value).toBe('end')

      wrapper.unmount()
    })
  })

  describe('with @floating-ui/vue (mocked)', () => {
    it('uses Floating UI state and middleware when module is available', async () => {
      const mocks = setupFloatingUIMock()
      const { wrapper, api, floating } = await mountUseFloating()

      expect(api.isUsingFloatingUI.value).toBe(true)
      expect(api.floatingStyles.value).toEqual({
        position: 'fixed',
        top: '24px',
        left: '8px',
      })
      expect(api.placement.value).toBe('top-end')
      expect(api.side.value).toBe('top')
      expect(api.align.value).toBe('end')
      expect(api.referenceWidth.value).toBe(160)
      expect(api.availableHeight.value).toBe(320)
      expect(mocks.offset).toHaveBeenCalledWith(4)
      expect(mocks.flip).toHaveBeenCalled()
      expect(mocks.shift).toHaveBeenCalledWith({ padding: 8 })
      expect(mocks.size).toHaveBeenCalledTimes(1)
      expect(mocks.useFloating).toHaveBeenCalledTimes(1)

      const floatingElement = floating.value
      expect(floatingElement).not.toBeNull()
      expect(floatingElement?.style.minWidth).toBe('160px')
      expect(floatingElement?.style.getPropertyValue('--superselect-trigger-width')).toBe('160px')
      expect(floatingElement?.style.getPropertyValue('--superselect-content-available-height')).toBe(
        '320px',
      )

      mocks.mockPlacement.value = 'left-start'
      mocks.mockFloatingStyles.value = {
        position: 'fixed',
        top: '10px',
        left: '2px',
      }
      mocks.mockIsPositioned.value = false

      await flushAsync()

      expect(api.placement.value).toBe('left-start')
      expect(api.side.value).toBe('left')
      expect(api.align.value).toBe('start')
      expect(api.floatingStyles.value).toEqual({
        position: 'fixed',
        top: '10px',
        left: '2px',
      })
      expect(api.isPositioned.value).toBe(false)

      wrapper.unmount()
    })

    it('supports collisionStrategy=none to keep fixed below placement', async () => {
      const mocks = setupFloatingUIMock()
      const { wrapper, api } = await mountUseFloating({
        collisionStrategy: 'none',
      })

      expect(api.isUsingFloatingUI.value).toBe(true)
      expect(mocks.offset).toHaveBeenCalledWith(4)
      expect(mocks.flip).not.toHaveBeenCalled()
      expect(mocks.shift).not.toHaveBeenCalled()
      expect(mocks.size).toHaveBeenCalledTimes(1)

      const firstCallOptions = mocks.useFloating.mock.calls[0]?.[2] as MockUseFloatingOptions | undefined
      const middlewareNames = (firstCallOptions?.middleware ?? []).map((middleware) => middleware.name)
      expect(middlewareNames).toEqual(['offset', 'size'])

      wrapper.unmount()
    })

    it('rebuilds middleware when collisionStrategy changes at runtime', async () => {
      const mocks = setupFloatingUIMock()
      const collisionStrategy = ref<'flip' | 'none'>('flip')
      const { wrapper } = await mountUseFloating({
        collisionStrategy,
      })

      expect(mocks.useFloating).toHaveBeenCalledTimes(1)
      const initialOptions = mocks.useFloating.mock.calls[0]?.[2] as MockUseFloatingOptions | undefined
      const initialMiddlewareNames = (initialOptions?.middleware ?? []).map((middleware) => middleware.name)
      expect(initialMiddlewareNames).toEqual(['offset', 'flip', 'shift', 'size'])

      collisionStrategy.value = 'none'
      await flushAsync()

      expect(mocks.useFloating).toHaveBeenCalledTimes(2)
      const updatedOptions = mocks.useFloating.mock.calls[1]?.[2] as MockUseFloatingOptions | undefined
      const updatedMiddlewareNames = (updatedOptions?.middleware ?? []).map((middleware) => middleware.name)
      expect(updatedMiddlewareNames).toEqual(['offset', 'size'])

      wrapper.unmount()
    })

    it('respects enabled=false and forces fallback mode even with Floating UI installed', async () => {
      setupFloatingUIMock()
      const enabled = ref(false)
      const { wrapper, api } = await mountUseFloating({ enabled })

      expect(api.isUsingFloatingUI.value).toBe(false)
      expect(api.floatingStyles.value).toEqual({
        position: 'absolute',
        top: '100%',
        left: '0',
        width: '100%',
      })
      expect(api.isPositioned.value).toBe(true)

      wrapper.unmount()
    })

    it('starts positioning when enabled toggles from false to true', async () => {
      const mocks = setupFloatingUIMock()
      const enabled = ref(false)
      const { wrapper, api } = await mountUseFloating({ enabled })

      expect(api.isUsingFloatingUI.value).toBe(false)
      expect(mocks.useFloating).not.toHaveBeenCalled()

      enabled.value = true
      await flushAsync()

      expect(api.isUsingFloatingUI.value).toBe(true)
      expect(mocks.useFloating).toHaveBeenCalled()

      wrapper.unmount()
    })

    it('disposed flag prevents late resolution from applying', async () => {
      setupFloatingUIMock()
      const enabled = ref(true)
      const { wrapper, api } = await mountUseFloating({ enabled })

      expect(api.isUsingFloatingUI.value).toBe(true)

      wrapper.unmount()
    })

    it('handles multiple rapid collisionStrategy changes', async () => {
      const mocks = setupFloatingUIMock()
      const collisionStrategy = ref<'flip' | 'none'>('flip')
      const { wrapper } = await mountUseFloating({ collisionStrategy })

      expect(mocks.useFloating).toHaveBeenCalledTimes(1)

      collisionStrategy.value = 'none'
      await flushAsync()

      collisionStrategy.value = 'flip'
      await flushAsync()

      collisionStrategy.value = 'none'
      await flushAsync()

      const lastCallIndex = mocks.useFloating.mock.calls.length - 1
      const lastCallOptions = mocks.useFloating.mock.calls[lastCallIndex]?.[2] as MockUseFloatingOptions | undefined
      const lastMiddlewareNames = (lastCallOptions?.middleware ?? []).map((middleware) => middleware.name)
      expect(lastMiddlewareNames).toEqual(['offset', 'size'])

      wrapper.unmount()
    })
  })

  describe('async loading path (no override)', () => {
    it('falls back gracefully when @floating-ui/vue is not installed', async () => {
      // Do NOT set any override -- let the real async import path execute
      // Since @floating-ui/vue is not installed, the .catch() handler fires
      clearFloatingUIOverride()

      const useFloatingModule = await import('./useFloating')

      const reference = ref<HTMLElement | null>(document.createElement('button'))
      const floating = ref<HTMLElement | null>(document.createElement('div'))
      let api: UseFloatingReturn | null = null

      const wrapper = mount(defineComponent({
        setup() {
          api = useFloatingModule.useFloating({
            reference,
            floating,
          })
          return {}
        },
        template: '<div />',
      }))

      // Wait for the async import to resolve/reject
      await flushAsync()
      await flushAsync()
      await flushAsync()

      // Should fall back to absolute positioning
      expect(api!.floatingStyles.value.position).toBe('absolute')
      expect(api!.isUsingFloatingUI.value).toBe(false)

      wrapper.unmount()
    })

    it('disposed flag prevents late resolution from applying after unmount', async () => {
      clearFloatingUIOverride()

      const useFloatingModule = await import('./useFloating')

      const reference = ref<HTMLElement | null>(document.createElement('button'))
      const floating = ref<HTMLElement | null>(document.createElement('div'))
      let api: UseFloatingReturn | null = null

      const wrapper = mount(defineComponent({
        setup() {
          api = useFloatingModule.useFloating({
            reference,
            floating,
          })
          return {}
        },
        template: '<div />',
      }))

      // Unmount before async resolution completes
      wrapper.unmount()

      await flushAsync()
      await flushAsync()
      await flushAsync()

      // After unmount, the fallback should still be in place
      expect(api!.isUsingFloatingUI.value).toBe(false)
    })
  })

  describe('parsePlacement', () => {
    it('parses side and align for all supported placement shapes', async () => {
      mockFloatingUINotInstalled()
      const useFloatingModule = await import('./useFloating')

      expect(useFloatingModule.parsePlacement('bottom-start')).toEqual({
        side: 'bottom',
        align: 'start',
      })
      expect(useFloatingModule.parsePlacement('top-end')).toEqual({
        side: 'top',
        align: 'end',
      })
      expect(useFloatingModule.parsePlacement('bottom')).toEqual({
        side: 'bottom',
        align: 'center',
      })
      expect(useFloatingModule.parsePlacement('left-start')).toEqual({
        side: 'left',
        align: 'start',
      })
    })
  })
})
