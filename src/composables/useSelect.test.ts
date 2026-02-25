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

  describe('dismiss behavior', () => {
    it('dismiss() closes dropdown', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.open()
      expect(api.isOpen.value).toBe(true)

      api.dismiss()
      expect(api.isOpen.value).toBe(false)
    })

    it('dismiss() clears query in multi-select', () => {
      const wrapper = createWrapper<string>({ multiple: true })
      const api = wrapper.vm.api

      api.open()
      api.query.value = 'test'
      api.value.value = ['Apple']

      api.dismiss()

      expect(api.isOpen.value).toBe(false)
      expect(api.query.value).toBe('')
      expect(api.value.value).toEqual(['Apple'])
    })

    it('dismiss() restores selected label in single-select', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.registerItem(itemApple)
      api.registerItem(itemBanana)

      invoke(api.getOptionProps(itemApple).onClick, {})
      expect(api.value.value).toBe('Apple')
      expect(api.query.value).toBe('Apple')

      api.open()
      api.query.value = 'ban'

      api.dismiss()

      expect(api.isOpen.value).toBe(false)
      expect(api.query.value).toBe('Apple')
      expect(api.value.value).toBe('Apple')
    })

    it('dismiss() restores selected label when valueKey is set', () => {
      interface Fruit { id: string; name: string }
      const fruits: Fruit[] = [
        { id: 'a', name: 'Apple' },
        { id: 'b', name: 'Banana' },
      ]
      const wrapper = createWrapper<Fruit>({
        items: fruits,
        labelKey: 'name',
        valueKey: 'id',
      })
      const api = wrapper.vm.api

      const itemA: CollectionItem<Fruit> = {
        id: 'opt-a',
        value: fruits[0],
        label: 'Apple',
        disabled: false,
      }
      const itemB: CollectionItem<Fruit> = {
        id: 'opt-b',
        value: fruits[1],
        label: 'Banana',
        disabled: false,
      }

      api.registerItem(itemA)
      api.registerItem(itemB)

      // Select Apple (value becomes 'a' due to valueKey)
      invoke(api.getOptionProps(itemA).onClick, {})
      expect(api.value.value).toBe('a')
      expect(api.query.value).toBe('Apple')

      // Open and type a partial search
      api.open()
      api.query.value = 'ban'

      // Dismiss should restore label to 'Apple'
      api.dismiss()

      expect(api.isOpen.value).toBe(false)
      expect(api.query.value).toBe('Apple')
      expect(api.value.value).toBe('a')
    })

    it('dismiss() clears query when nothing selected in single-select', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.open()
      api.query.value = 'some search'

      api.dismiss()

      expect(api.query.value).toBe('')
      expect(api.value.value).toBeNull()
    })

    it('dismiss() does not auto-select highlighted option', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.registerItem(itemApple)
      api.registerItem(itemBanana)

      api.open()

      const inputProps = api.getInputProps()
      invoke(inputProps.onKeydown, { key: 'ArrowDown', preventDefault: vi.fn() })

      expect(api.activeId.value).not.toBeNull()

      api.dismiss()

      expect(api.value.value).toBeNull()
      expect(api.isOpen.value).toBe(false)
    })

    it('dismiss() is a no-op when already closed', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.query.value = 'test'
      expect(api.isOpen.value).toBe(false)

      api.dismiss()

      expect(api.isOpen.value).toBe(false)
      expect(api.query.value).toBe('test')
    })
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

  describe('items/key pipeline', () => {
    interface Fruit {
      id: number
      name: string
    }

    const fruits: Fruit[] = [
      { id: 1, name: 'Apple' },
      { id: 2, name: 'Banana' },
      { id: 3, name: 'Cherry' },
    ]

    const fruitItem = (fruit: Fruit): CollectionItem<Fruit> => ({
      id: `fruit-${fruit.id}`,
      value: fruit,
      label: fruit.name,
      disabled: false,
    })

    it('object options with labelKey extract display labels', () => {
      const wrapper = createWrapper<Fruit>({
        items: ref([...fruits]),
        labelKey: 'name',
        valueKey: 'id',
      })
      const api = wrapper.vm.api

      expect(api.getItemLabel(fruits[0]!)).toBe('Apple')
      expect(api.getItemLabel(fruits[1]!)).toBe('Banana')
    })

    it('object options with valueKey set v-model to extracted field', () => {
      const wrapper = createWrapper<Fruit>({
        items: ref([...fruits]),
        labelKey: 'name',
        valueKey: 'id',
      })
      const api = wrapper.vm.api

      const item = fruitItem(fruits[0]!)
      api.registerItem(item)

      invoke(api.getOptionProps(item).onClick, {})

      expect(api.value.value).toBe(1)
    })

    it('without valueKey, v-model binds to whole object', () => {
      const wrapper = createWrapper<Fruit>({
        items: ref([...fruits]),
        labelKey: 'name',
      })
      const api = wrapper.vm.api

      const item = fruitItem(fruits[0]!)
      api.registerItem(item)

      invoke(api.getOptionProps(item).onClick, {})

      expect(api.value.value).toEqual({ id: 1, name: 'Apple' })
    })

    it('primitive arrays work with zero config', () => {
      const wrapper = createWrapper<string>({
        items: ref(['Red', 'Green', 'Blue']),
      })
      const api = wrapper.vm.api

      const item: CollectionItem<string> = {
        id: 'red',
        value: 'Red',
        label: 'Red',
        disabled: false,
      }
      api.registerItem(item)

      invoke(api.getOptionProps(item).onClick, {})

      expect(api.value.value).toBe('Red')
    })

    it('resolveLabel auto-resolves from root items', () => {
      const wrapper = createWrapper<Fruit>({
        items: ref([...fruits]),
        labelKey: 'name',
        valueKey: 'id',
      })
      const api = wrapper.vm.api

      expect(api.resolveLabel(1)).toBe('Apple')
      expect(api.resolveLabel(2)).toBe('Banana')
      expect(api.resolveLabel(999)).toBeUndefined()
    })

    it('resolveLabel falls back to user-provided resolver', () => {
      const wrapper = createWrapper<Fruit>({
        items: ref([...fruits]),
        labelKey: 'name',
        valueKey: 'id',
        resolveLabel: () => 'Custom',
      })
      const api = wrapper.vm.api

      expect(api.resolveLabel(1)).toBe('Custom')
    })

    it('multi-select with valueKey stores array of extracted values', () => {
      const wrapper = createWrapper<Fruit>({
        multiple: true,
        items: ref([...fruits]),
        labelKey: 'name',
        valueKey: 'id',
      })
      const api = wrapper.vm.api

      const itemA = fruitItem(fruits[0]!)
      const itemB = fruitItem(fruits[1]!)
      api.registerItem(itemA)
      api.registerItem(itemB)

      invoke(api.getOptionProps(itemA).onClick, {})
      invoke(api.getOptionProps(itemB).onClick, {})

      expect(api.value.value).toEqual([1, 2])
    })

    it('isSelected matches extracted values in multi-select with valueKey', () => {
      const wrapper = createWrapper<Fruit>({
        multiple: true,
        items: ref([...fruits]),
        labelKey: 'name',
        valueKey: 'id',
      })
      const api = wrapper.vm.api

      const item = fruitItem(fruits[0]!)
      api.registerItem(item)

      invoke(api.getOptionProps(item).onClick, {})

      expect(api.isSelected(item)).toBe(true)
    })

    it('hideSelected filters correctly with valueKey', () => {
      const wrapper = createWrapper<Fruit>({
        multiple: true,
        hideSelected: true,
        items: ref([...fruits]),
        labelKey: 'name',
        valueKey: 'id',
      })
      const api = wrapper.vm.api

      const itemA = fruitItem(fruits[0]!)
      const itemB = fruitItem(fruits[1]!)
      const itemC = fruitItem(fruits[2]!)
      api.registerItem(itemA)
      api.registerItem(itemB)
      api.registerItem(itemC)

      invoke(api.getOptionProps(itemA).onClick, {})

      const visibleValues = api.visibleItems.value.map((item) => item.value)
      expect(visibleValues).toEqual([fruits[1], fruits[2]])
    })
  })

  describe('Tab key behavior', () => {
    it('Tab with selectOnTab=true selects highlighted option and closes', () => {
      const wrapper = createWrapper<string>({ selectOnTab: true })
      const api = wrapper.vm.api

      api.registerItem(itemApple)
      api.registerItem(itemBanana)

      api.open()
      const inputProps = api.getInputProps()
      invoke(inputProps.onKeydown, { key: 'ArrowDown', preventDefault: vi.fn() })
      invoke(inputProps.onKeydown, { key: 'Tab', preventDefault: vi.fn() })

      expect(api.value.value).toBe('Apple')
      expect(api.isOpen.value).toBe(false)
    })

    it('Tab with selectOnTab=false closes without selecting', () => {
      const wrapper = createWrapper<string>({ selectOnTab: false })
      const api = wrapper.vm.api

      api.registerItem(itemApple)
      api.registerItem(itemBanana)

      api.open()
      const inputProps = api.getInputProps()
      invoke(inputProps.onKeydown, { key: 'ArrowDown', preventDefault: vi.fn() })
      invoke(inputProps.onKeydown, { key: 'Tab', preventDefault: vi.fn() })

      expect(api.value.value).toBeNull()
      expect(api.isOpen.value).toBe(false)
    })

    it('Tab key does not call preventDefault', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.open()
      const inputProps = api.getInputProps()
      const preventDefault = vi.fn()
      invoke(inputProps.onKeydown, { key: 'Tab', preventDefault })

      expect(preventDefault).not.toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('disabled prevents open()', () => {
      const wrapper = createWrapper<string>({ disabled: ref(true) })
      const api = wrapper.vm.api

      api.open()
      expect(api.isOpen.value).toBe(false)
    })

    it('disabled prevents selectItem', () => {
      const wrapper = createWrapper<string>({ disabled: ref(true) })
      const api = wrapper.vm.api

      api.registerItem(itemApple)
      invoke(api.getOptionProps(itemApple).onClick, {})

      expect(api.value.value).toBeNull()
    })
  })

  describe('second Escape clears query', () => {
    it('second Escape clears query when dropdown is already closed', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.open()
      api.query.value = 'app'

      const inputProps = api.getInputProps()
      invoke(inputProps.onKeydown, { key: 'Escape', preventDefault: vi.fn() })
      expect(api.isOpen.value).toBe(false)
      expect(api.query.value).toBe('app')

      invoke(inputProps.onKeydown, { key: 'Escape', preventDefault: vi.fn() })
      expect(api.query.value).toBe('')
    })
  })

  describe('clear and focus methods', () => {
    it('clear() resets value and query in single mode', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.registerItem(itemApple)
      invoke(api.getOptionProps(itemApple).onClick, {})
      expect(api.value.value).toBe('Apple')
      expect(api.query.value).toBe('Apple')

      api.clear()

      expect(api.value.value).toBeNull()
      expect(api.query.value).toBe('')
    })

    it('clear() resets value and query in multi mode', () => {
      const wrapper = createWrapper<string>({ multiple: true })
      const api = wrapper.vm.api

      api.registerItem(itemApple)
      api.registerItem(itemBanana)
      invoke(api.getOptionProps(itemApple).onClick, {})
      invoke(api.getOptionProps(itemBanana).onClick, {})
      expect(api.value.value).toEqual(['Apple', 'Banana'])

      api.clear()

      expect(api.value.value).toEqual([])
      expect(api.query.value).toBe('')
    })

    it('focus() focuses the input element', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      const mockEl = { focus: vi.fn() } as unknown as HTMLElement
      api.inputRef.value = mockEl

      api.focus()

      expect(mockEl.focus).toHaveBeenCalledOnce()
    })

    it('removeLast is exposed on UseSelectReturn', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      expect(typeof api.removeLast).toBe('function')
    })
  })

  describe('getInputProps edge cases', () => {
    it('handles null event target in onInput gracefully', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      const props = api.getInputProps()
      const inputEvent = { target: null }

      expect(() => invoke(props.onInput, inputEvent)).not.toThrow()
      expect(api.query.value).toBe('')
    })

    it('onMousedown when disabled does not open', () => {
      const wrapper = createWrapper<string>({ disabled: ref(true) })
      const api = wrapper.vm.api

      const props = api.getInputProps()
      invoke(props.onMousedown, {})

      expect(api.isOpen.value).toBe(false)
    })

    it('onMousedown focuses the clicked input without scrolling', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api
      const props = api.getInputProps()

      const input = document.createElement('input')
      const focusSpy = vi.spyOn(input, 'focus')
      document.body.appendChild(input)

      try {
        invoke(props.onMousedown, { currentTarget: input })
        expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true })
        expect(api.isOpen.value).toBe(true)
      } finally {
        input.remove()
      }
    })

    it('onMousedown when already open does not toggle', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.open()
      expect(api.isOpen.value).toBe(true)

      const props = api.getInputProps()
      invoke(props.onMousedown, {})

      expect(api.isOpen.value).toBe(true)
    })

    it('onInput opens dropdown when closed', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      expect(api.isOpen.value).toBe(false)

      const props = api.getInputProps()
      invoke(props.onInput, { target: { value: 'a' } })

      expect(api.isOpen.value).toBe(true)
      expect(api.query.value).toBe('a')
    })

    it('onInput when already open just updates query', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.open()
      const props = api.getInputProps()
      invoke(props.onInput, { target: { value: 'hello' } })

      expect(api.query.value).toBe('hello')
      expect(api.isOpen.value).toBe(true)
    })
  })

  describe('getOptionProps edge cases', () => {
    it('onMousemove for disabled items does not change highlight', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      api.registerItem(itemApple)
      api.registerItem(itemBanana)

      const disabledItem: CollectionItem<string> = {
        id: 'd',
        value: 'Disabled',
        label: 'Disabled',
        disabled: true,
      }
      api.registerItem(disabledItem)

      api.open()
      const inputProps = api.getInputProps()
      invoke(inputProps.onKeydown, { key: 'ArrowDown', preventDefault: vi.fn() })
      const currentActiveId = api.activeId.value

      const disabledProps = api.getOptionProps(disabledItem)
      invoke(disabledProps.onMousemove, {})

      expect(api.activeId.value).toBe(currentActiveId)
    })

    it('onClick for disabled items does not select', () => {
      const wrapper = createWrapper<string>()
      const api = wrapper.vm.api

      const disabledItem: CollectionItem<string> = {
        id: 'd',
        value: 'Disabled',
        label: 'Disabled',
        disabled: true,
      }
      api.registerItem(disabledItem)

      const props = api.getOptionProps(disabledItem)
      invoke(props.onClick, {})

      expect(api.value.value).toBeNull()
    })
  })
})
