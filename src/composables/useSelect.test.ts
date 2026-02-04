import { describe, expect, it, vi } from 'vitest'
import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useSelect } from './useSelect'
import type { CollectionItem } from './useCollection'

const invoke = (handler: unknown, event: unknown) => {
  if (Array.isArray(handler)) {
    handler.forEach((fn) => {
      if (typeof fn === 'function') fn(event)
    })
    return
  }

  if (typeof handler === 'function') handler(event)
}

const createWrapper = <T,>(options?: Parameters<typeof useSelect<T>>[0]) =>
  mount(
    defineComponent({
      setup() {
        const api = useSelect<T>(options ?? {})
        return { api }
      },
      template: '<div />',
    }),
  )

describe('useSelect', () => {
  it('merges input handlers and updates query', () => {
    const wrapper = createWrapper<string>()
    const api = wrapper.vm.api

    const userInput = vi.fn()
    const userKeydown = vi.fn()

    const props = api.getInputProps({
      onInput: userInput,
      onKeydown: userKeydown,
    })

    const inputEvent = { target: { value: 'ap' } }
    invoke(props.onInput, inputEvent)

    expect(userInput).toHaveBeenCalled()
    expect(api.query.value).toBe('ap')

    const keyEvent = { key: 'ArrowDown', preventDefault: vi.fn() }
    invoke(props.onKeydown, keyEvent)

    expect(userKeydown).toHaveBeenCalled()
  })

  it('sets option ARIA attributes based on selection and disabled state', () => {
    const wrapper = createWrapper<string>()
    const api = wrapper.vm.api

    const item: CollectionItem<string> = {
      id: 'a',
      value: 'Apple',
      label: 'Apple',
      disabled: true,
    }

    api.value.value = 'Apple'

    const props = api.getOptionProps(item)

    expect(props.role).toBe('option')
    expect(props['aria-selected']).toBe(true)
    expect(props['aria-disabled']).toBe(true)
  })

  it('updates uncontrolled value on option click', () => {
    const wrapper = createWrapper<string>({ defaultValue: null })
    const api = wrapper.vm.api

    const item: CollectionItem<string> = {
      id: 'b',
      value: 'Banana',
      label: 'Banana',
      disabled: false,
    }

    const props = api.getOptionProps(item)
    invoke(props.onClick, {})

    expect(api.value.value).toBe('Banana')
  })

  it('calls onValueChange for controlled value without mutating prop', () => {
    const value = ref<string | null>('Apple')
    const onValueChange = vi.fn()
    const wrapper = createWrapper<string>({ value, onValueChange })
    const api = wrapper.vm.api

    const item: CollectionItem<string> = {
      id: 'c',
      value: 'Cherry',
      label: 'Cherry',
      disabled: false,
    }

    const props = api.getOptionProps(item)
    invoke(props.onClick, {})

    expect(onValueChange).toHaveBeenCalledWith('Cherry')
    expect(value.value).toBe('Apple')
  })

  it('opens, closes, and toggles open state', () => {
    const wrapper = createWrapper<string>()
    const api = wrapper.vm.api

    expect(api.isOpen.value).toBe(false)

    api.open()
    expect(api.isOpen.value).toBe(true)

    api.toggle()
    expect(api.isOpen.value).toBe(false)

    api.close()
    expect(api.isOpen.value).toBe(false)
  })
})
