import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, nextTick, ref } from 'vue'
import { useControllable } from './useControllable'

describe('useControllable', () => {
  beforeEach(() => {
    vi.stubGlobal('__DEV__', false)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('uses defaultValue and updates internally in uncontrolled mode', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const value = useControllable({
            prop: ref<string | undefined>(undefined),
            defaultValue: 'initial',
          })

          const setValue = (next: string) => {
            value.value = next
          }

          return { value, setValue }
        },
        template: '<div>{{ value }}</div>',
      }),
    )

    expect(wrapper.vm.value).toBe('initial')
    wrapper.vm.setValue('next')
    await nextTick()
    expect(wrapper.vm.value).toBe('next')
  })

  it('returns controlled value and calls onChange when set', async () => {
    const onChange = vi.fn()

    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref<string | undefined>('controlled')
          const value = useControllable({
            prop: model,
            onChange,
          })

          const setValue = (next: string) => {
            value.value = next
          }

          return { model, value, setValue }
        },
        template: '<div>{{ value }}</div>',
      }),
    )

    expect(wrapper.vm.value).toBe('controlled')
    wrapper.vm.setValue('next')
    await nextTick()

    expect(onChange).toHaveBeenCalledWith('next')
    expect(wrapper.vm.value).toBe('controlled')
  })

  it('reflects external prop changes in controlled mode', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref<string | undefined>('first')
          const value = useControllable({
            prop: model,
          })

          return { model, value }
        },
        template: '<div>{{ value }}</div>',
      }),
    )

    expect(wrapper.vm.value).toBe('first')
    wrapper.vm.model = 'second'
    await nextTick()
    expect(wrapper.vm.value).toBe('second')
  })

  it('calls onChange in uncontrolled mode', async () => {
    const onChange = vi.fn()

    const wrapper = mount(
      defineComponent({
        setup() {
          const value = useControllable({
            prop: ref<string | undefined>(undefined),
            defaultValue: 'initial',
            onChange,
          })

          const setValue = (next: string) => {
            value.value = next
          }

          return { value, setValue }
        },
        template: '<div>{{ value }}</div>',
      }),
    )

    wrapper.vm.setValue('updated')
    await nextTick()

    expect(onChange).toHaveBeenCalledWith('updated')
  })

  it('warns when switching from controlled to uncontrolled', async () => {
    vi.stubGlobal('__DEV__', true)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref<string | undefined>('value')
          const value = useControllable({
            prop: model,
          })

          return { model, value }
        },
        template: '<div>{{ value }}</div>',
      }),
    )

    wrapper.vm.model = undefined
    await nextTick()

    expect(warnSpy).toHaveBeenCalled()
  })

  it('warns when switching from uncontrolled to controlled', async () => {
    vi.stubGlobal('__DEV__', true)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(
      defineComponent({
        setup() {
          const model = ref<string | undefined>(undefined)
          const value = useControllable({
            prop: model,
            defaultValue: 'initial',
          })

          return { model, value }
        },
        template: '<div>{{ value }}</div>',
      }),
    )

    wrapper.vm.model = 'now-controlled'
    await nextTick()

    expect(warnSpy).toHaveBeenCalled()
  })
})
