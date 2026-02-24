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
  const itemApple: CollectionItem<string> = {
    id: 'a',
    value: 'Apple',
    label: 'Apple',
    disabled: false,
  }
  const itemBanana: CollectionItem<string> = {
    id: 'b',
    value: 'Banana',
    label: 'Banana',
    disabled: false,
  }
  const itemCherry: CollectionItem<string> = {
    id: 'c',
    value: 'Cherry',
    label: 'Cherry',
    disabled: false,
  }

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

  it('prevents default on option mousedown to preserve input focus', () => {
    const wrapper = createWrapper<string>()
    const api = wrapper.vm.api

    const item: CollectionItem<string> = {
      id: 'm',
      value: 'Mango',
      label: 'Mango',
      disabled: false,
    }

    const props = api.getOptionProps(item)
    const preventDefault = vi.fn()
    invoke(props.onMousedown, { preventDefault })

    expect(preventDefault).toHaveBeenCalledTimes(1)
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

  it('exposes controlRef as a reactive ref', () => {
    const wrapper = createWrapper<string>()
    const api = wrapper.vm.api

    expect(api.controlRef.value).toBeNull()
  })

  it('exposes a resolveLabel helper from options', () => {
    const wrapper = createWrapper<string>({
      resolveLabel: (value) => (value === 'a' ? 'Apple' : undefined),
    })
    const api = wrapper.vm.api

    expect(api.resolveLabel('a')).toBe('Apple')
    expect(api.resolveLabel('b')).toBeUndefined()
  })

  describe('multi-select mode', () => {
    it('initializes with an empty array when multiple is true', () => {
      const wrapper = createWrapper<string>({ multiple: true })
      const api = wrapper.vm.api

      expect(api.multiple).toBe(true)
      expect(api.value.value).toEqual([])
    })

    it('toggles items in the selected array', () => {
      const wrapper = createWrapper<string>({ multiple: true })
      const api = wrapper.vm.api
      const item: CollectionItem<string> = {
        id: 'a',
        value: 'Apple',
        label: 'Apple',
        disabled: false,
      }

      const firstClickProps = api.getOptionProps(item)
      invoke(firstClickProps.onClick, {})
      expect(api.value.value).toEqual(['Apple'])

      const secondClickProps = api.getOptionProps(item)
      invoke(secondClickProps.onClick, {})
      expect(api.value.value).toEqual([])
    })

    it('keeps dropdown open after selection', () => {
      const wrapper = createWrapper<string>({ multiple: true })
      const api = wrapper.vm.api
      const item: CollectionItem<string> = {
        id: 'b',
        value: 'Banana',
        label: 'Banana',
        disabled: false,
      }

      api.open()
      const props = api.getOptionProps(item)
      invoke(props.onClick, {})

      expect(api.isOpen.value).toBe(true)
    })

    it('clears the query after each selection', () => {
      const wrapper = createWrapper<string>({ multiple: true })
      const api = wrapper.vm.api
      const item: CollectionItem<string> = {
        id: 'c',
        value: 'Cherry',
        label: 'Cherry',
        disabled: false,
      }

      api.query.value = 'ch'
      const props = api.getOptionProps(item)
      invoke(props.onClick, {})

      expect(api.query.value).toBe('')
    })

    it('keeps single-select behavior unchanged', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api
      const item: CollectionItem<string> = {
        id: 'd',
        value: 'Date',
        label: 'Date',
        disabled: false,
      }

      api.open()
      api.query.value = 'da'

      const props = api.getOptionProps(item)
      invoke(props.onClick, {})

      expect(api.value.value).toBe('Date')
      expect(api.query.value).toBe('Date')
      expect(api.isOpen.value).toBe(false)
    })

    describe('Backspace removal', () => {
      it('removes last selected item when Backspace is pressed with empty query', () => {
        const wrapper = createWrapper<string>({
          multiple: true,
          defaultValue: ['Apple', 'Banana'],
        })
        const api = wrapper.vm.api

        api.query.value = ''
        const inputProps = api.getInputProps()
        const event = { key: 'Backspace', preventDefault: vi.fn() }
        invoke(inputProps.onKeydown, event)

        expect(api.value.value).toEqual(['Apple'])
        expect(event.preventDefault).not.toHaveBeenCalled()
      })

      it('does not remove selected items when query has text', () => {
        const wrapper = createWrapper<string>({
          multiple: true,
          defaultValue: ['Apple', 'Banana'],
        })
        const api = wrapper.vm.api

        api.query.value = 'ap'
        const inputProps = api.getInputProps()
        invoke(inputProps.onKeydown, { key: 'Backspace', preventDefault: vi.fn() })

        expect(api.value.value).toEqual(['Apple', 'Banana'])
      })

      it('has no Backspace side effect in single-select mode', () => {
        const wrapper = createWrapper<string>({ defaultValue: 'Apple' })
        const api = wrapper.vm.api

        api.query.value = ''
        const inputProps = api.getInputProps()
        invoke(inputProps.onKeydown, { key: 'Backspace', preventDefault: vi.fn() })

        expect(api.value.value).toBe('Apple')
      })
    })

    describe('max selections', () => {
      it('prevents selecting beyond max limit', () => {
        const wrapper = createWrapper<string>({ multiple: true, max: 2 })
        const api = wrapper.vm.api

        invoke(api.getOptionProps(itemApple).onClick, {})
        invoke(api.getOptionProps(itemBanana).onClick, {})
        invoke(api.getOptionProps(itemCherry).onClick, {})

        expect(api.value.value).toEqual(['Apple', 'Banana'])
      })

      it('allows deselecting selected items at max', () => {
        const wrapper = createWrapper<string>({ multiple: true, max: 2 })
        const api = wrapper.vm.api

        invoke(api.getOptionProps(itemApple).onClick, {})
        invoke(api.getOptionProps(itemBanana).onClick, {})
        invoke(api.getOptionProps(itemApple).onClick, {})

        expect(api.value.value).toEqual(['Banana'])
        expect(api.isAtMax.value).toBe(false)
      })

      it('disables unselected options at max while keeping selected enabled', () => {
        const wrapper = createWrapper<string>({ multiple: true, max: 2 })
        const api = wrapper.vm.api

        invoke(api.getOptionProps(itemApple).onClick, {})
        invoke(api.getOptionProps(itemBanana).onClick, {})

        const selectedProps = api.getOptionProps(itemApple)
        const blockedProps = api.getOptionProps(itemCherry)

        expect(api.isAtMax.value).toBe(true)
        expect(selectedProps['aria-disabled']).toBeUndefined()
        expect(selectedProps['data-disabled']).toBe('false')
        expect(blockedProps['aria-disabled']).toBe(true)
        expect(blockedProps['data-disabled']).toBe('true')
      })
    })

    describe('hideSelected', () => {
      it('filters selected options out of visibleItems when enabled', () => {
        const wrapper = createWrapper<string>({ multiple: true, hideSelected: true })
        const api = wrapper.vm.api

        api.registerItem(itemApple)
        api.registerItem(itemBanana)
        api.registerItem(itemCherry)

        api.value.value = ['Apple']

        expect(api.visibleItems.value.map((item) => item.value)).toEqual(['Banana', 'Cherry'])
      })

      it('keeps selected options in visibleItems when disabled', () => {
        const wrapper = createWrapper<string>({ multiple: true, hideSelected: false })
        const api = wrapper.vm.api

        api.registerItem(itemApple)
        api.registerItem(itemBanana)
        api.value.value = ['Apple']

        expect(api.visibleItems.value.map((item) => item.value)).toEqual(['Apple', 'Banana'])
      })

      it('has no effect in single-select mode', () => {
        const wrapper = createWrapper<string>({ hideSelected: true, defaultValue: 'Apple' })
        const api = wrapper.vm.api

        api.registerItem(itemApple)
        api.registerItem(itemBanana)

        expect(api.visibleItems.value.map((item) => item.value)).toEqual(['Apple', 'Banana'])
      })
    })
  })
})
