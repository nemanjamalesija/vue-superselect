import {
  computed,
  effectScope,
  onBeforeUnmount,
  readonly,
  ref,
  toValue,
  watch,
  type EffectScope,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

const DEFAULT_PLACEMENT = 'bottom-start'
const DEFAULT_COLLISION_STRATEGY = 'flip'
const FALLBACK_STYLES: Record<string, string> = {
  position: 'absolute',
  top: '100%',
  left: '0',
  width: '100%',
}

export type FloatingCollisionStrategy = 'flip' | 'none'

interface FloatingMiddlewareState {
  rects: {
    reference: {
      width: number
    }
  }
  elements: {
    floating: HTMLElement
  }
  availableHeight: number
}

interface FloatingMiddleware {
  name: string
  options?: unknown
}

interface FloatingUseFloatingOptions {
  placement: MaybeRefOrGetter<string>
  whileElementsMounted?: (
    reference: Element,
    floating: HTMLElement,
    update: () => void,
  ) => (() => void) | void
  middleware?: FloatingMiddleware[]
}

interface FloatingUseFloatingReturn {
  floatingStyles: Readonly<Ref<Record<string, string | number>>>
  placement: Readonly<Ref<string>>
  isPositioned: Readonly<Ref<boolean>>
  update?: () => void
}

interface FloatingModule {
  useFloating: (
    reference: Ref<HTMLElement | null>,
    floating: Ref<HTMLElement | null>,
    options: FloatingUseFloatingOptions,
  ) => FloatingUseFloatingReturn
  autoUpdate: (
    reference: Element,
    floating: HTMLElement,
    update: () => void,
  ) => (() => void) | void
  offset: (value: number) => FloatingMiddleware
  flip: () => FloatingMiddleware
  shift: (options: { padding: number }) => FloatingMiddleware
  size: (options: { apply: (state: FloatingMiddlewareState) => void }) => FloatingMiddleware
}

let _module: FloatingModule | null = null
let _promise: Promise<FloatingModule | null> | null = null

const getTestOverride = (): FloatingModule | null | undefined => {
  const mode = (import.meta as { env?: { MODE?: string } }).env?.MODE
  if (mode !== 'test') return undefined

  const host = globalThis as {
    __VUE_SUPERSELECT_FLOATING_UI_MODULE__?: unknown
  }
  const override = host.__VUE_SUPERSELECT_FLOATING_UI_MODULE__

  if (override === undefined) return undefined
  if (override === null) return null
  return override as FloatingModule
}

const toStringStyles = (styles: Record<string, string | number>): Record<string, string> => {
  const normalized: Record<string, string> = {}

  for (const [key, value] of Object.entries(styles)) {
    normalized[key] = String(value)
  }

  return normalized
}

const resolvePlacement = (value: MaybeRefOrGetter<string> | undefined) =>
  toValue(value) || DEFAULT_PLACEMENT

const resolveCollisionStrategy = (
  value: MaybeRefOrGetter<FloatingCollisionStrategy> | undefined,
): FloatingCollisionStrategy => {
  const strategy = toValue(value)
  return strategy === 'none' ? 'none' : DEFAULT_COLLISION_STRATEGY
}

async function loadFloatingUI(): Promise<FloatingModule | null> {
  const override = getTestOverride()

  if (override !== undefined) {
    _module = override
    _promise = Promise.resolve(override)
    return _promise
  }

  if (_module !== null) return _module
  if (_promise !== null) return _promise

  /* v8 ignore start -- async import resolution is runtime-only */
  _promise = import('@floating-ui/vue')
    .then((mod) => {
      _module = mod as unknown as FloatingModule
      return _module
    })
    .catch(() => {
      _module = null
      return null
    })
  /* v8 ignore stop */

  return _promise
}

/**
 * Splits a placement string (for example `bottom-start`) into side/align
 * values used by `data-side` and `data-align`.
 */
export function parsePlacement(placement: string): { side: string; align: string } {
  const [side = 'bottom', align = 'center'] = placement.split('-')

  return {
    side: side || 'bottom',
    align: align || 'center',
  }
}

/**
 * Options for the `useFloating` positioning abstraction.
 */
export interface UseFloatingOptions {
  reference: Ref<HTMLElement | null>
  floating: Ref<HTMLElement | null>
  placement?: MaybeRefOrGetter<string>
  enabled?: MaybeRefOrGetter<boolean>
  /**
   * Collision behavior for Floating UI mode.
   * - `flip` (default): allow flip/shift to keep content visible.
   * - `none`: keep requested placement fixed (for example always below).
   */
  collisionStrategy?: MaybeRefOrGetter<FloatingCollisionStrategy>
}

/**
 * Reactive positioning state returned by `useFloating`.
 */
export interface UseFloatingReturn {
  floatingStyles: Readonly<Ref<Record<string, string>>>
  placement: Readonly<Ref<string>>
  isPositioned: Readonly<Ref<boolean>>
  side: Readonly<Ref<string>>
  align: Readonly<Ref<string>>
  referenceWidth: Readonly<Ref<number>>
  availableHeight: Readonly<Ref<number>>
  isUsingFloatingUI: Readonly<Ref<boolean>>
}

/**
 * Provides dropdown positioning with an optional Floating UI integration.
 *
 * When `@floating-ui/vue` is available, it uses `offset`, `size`,
 * `autoUpdate`, and optional collision middleware (`flip` + `shift`).
 * If the optional peer dependency is missing, fallback CSS absolute
 * positioning is returned.
 */
export function useFloating(options: UseFloatingOptions): UseFloatingReturn {
  const {
    reference,
    floating,
    placement = DEFAULT_PLACEMENT,
    enabled = true,
    collisionStrategy = DEFAULT_COLLISION_STRATEGY,
  } = options

  const floatingStyles = ref<Record<string, string>>({
    ...FALLBACK_STYLES,
  })
  const resolvedPlacement = ref(resolvePlacement(placement))
  const isPositioned = ref(true)
  const isUsingFloatingUI = ref(false)
  const referenceWidth = ref(0)
  const availableHeight = ref(0)

  const side = computed(() => parsePlacement(resolvedPlacement.value).side)
  const align = computed(() => parsePlacement(resolvedPlacement.value).align)

  let bridgeScope: EffectScope | null = null
  let loadToken = 0
  let disposed = false

  const applyFallbackState = () => {
    stopBridgeScope()
    isUsingFloatingUI.value = false
    isPositioned.value = true
    floatingStyles.value = {
      ...FALLBACK_STYLES,
    }
    resolvedPlacement.value = resolvePlacement(placement)
    referenceWidth.value = 0
    availableHeight.value = 0
  }

  const startFloatingBridge = (floatingModule: FloatingModule) => {
    stopBridgeScope()
    isUsingFloatingUI.value = true

    const scope = effectScope()
    bridgeScope = scope

    scope.run(() => {
      const state = floatingModule.useFloating(reference, floating, {
        placement: () => resolvePlacement(placement),
        whileElementsMounted: floatingModule.autoUpdate,
        middleware: (() => {
          const strategy = resolveCollisionStrategy(collisionStrategy)
          const middleware: FloatingMiddleware[] = [
            floatingModule.offset(4),
          ]

          if (strategy === 'flip') {
            middleware.push(
              floatingModule.flip(),
              floatingModule.shift({ padding: 8 }),
            )
          }

          middleware.push(
            floatingModule.size({
              apply({ rects, elements, availableHeight: nextAvailableHeight }) {
                const width = rects.reference.width
                const height = Math.max(0, nextAvailableHeight)
                const floatingElement = elements.floating

                floatingElement.style.minWidth = `${width}px`
                floatingElement.style.setProperty('--superselect-trigger-width', `${width}px`)
                floatingElement.style.setProperty(
                  '--superselect-content-available-height',
                  `${height}px`,
                )

                referenceWidth.value = width
                availableHeight.value = height
              },
            }),
          )

          return middleware
        })(),
      })

      watch(
        [state.floatingStyles, state.placement, state.isPositioned],
        ([nextStyles, nextPlacement, nextPositioned]) => {
          floatingStyles.value = toStringStyles(nextStyles)
          resolvedPlacement.value = nextPlacement
          isPositioned.value = nextPositioned
        },
        { immediate: true, deep: true },
      )

      // Recalculate after element/placement changes (including teleport target switches).
      watch(
        [reference, floating, () => resolvePlacement(placement), () => resolveCollisionStrategy(collisionStrategy)],
        () => {
          state.update?.()
        },
        { flush: 'post', immediate: true },
      )
    })
  }

  function stopBridgeScope() {
    bridgeScope?.stop()
    bridgeScope = null
  }

  watch(
    () => resolvePlacement(placement),
    (nextPlacement) => {
      if (!isUsingFloatingUI.value) {
        resolvedPlacement.value = nextPlacement
      }
    },
    { immediate: true },
  )

  watch(
    () => [toValue(enabled), resolveCollisionStrategy(collisionStrategy)] as const,
    ([isEnabled]) => {
      loadToken += 1

      if (!isEnabled) {
        applyFallbackState()
        return
      }

      const override = getTestOverride()
      if (override !== undefined) {
        if (override === null) {
          applyFallbackState()
          return
        }

        startFloatingBridge(override)
        return
      }

      if (_module !== null) {
        startFloatingBridge(_module)
        return
      }

      applyFallbackState()
      /* v8 ignore start -- async import resolution is runtime-only */
      const currentToken = loadToken

      void loadFloatingUI().then((floatingModule) => {
        if (disposed || currentToken !== loadToken) return
        if (!toValue(enabled) || floatingModule === null) {
          applyFallbackState()
          return
        }

        startFloatingBridge(floatingModule)
      })
      /* v8 ignore stop */
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    disposed = true
    stopBridgeScope()
  })

  return {
    floatingStyles: readonly(floatingStyles),
    placement: readonly(resolvedPlacement),
    isPositioned: readonly(isPositioned),
    side,
    align,
    referenceWidth: readonly(referenceWidth),
    availableHeight: readonly(availableHeight),
    isUsingFloatingUI: readonly(isUsingFloatingUI),
  }
}

void loadFloatingUI()
