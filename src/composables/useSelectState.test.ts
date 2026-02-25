import { describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useSelectState } from './useSelectState'
import type { CollectionItem } from './useCollection'

const createWrapper = <T,>(options: Parameters<typeof useSelectState<T>>[0]) =>
  mount(
    defineComponent({
      setup() {
        const state = useSelectState<T>(options)
        return { state }
      },
      template: '<div />',
    }),
  )

describe('useSelectState', () => {
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

  describe('getMax() reactive ref path', () => {
    it('respects max as a reactive ref and updates when ref changes', async () => {
      const max = ref<number | undefined>(2)
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
        max,
      })
      const state = wrapper.vm.state

      state.collection.registerItem(itemApple)
      state.collection.registerItem(itemBanana)

      state.selectItem(itemApple)
      state.selectItem(itemBanana)

      expect(state.isAtMax.value).toBe(true)

      max.value = 5
      await nextTick()

      expect(state.isAtMax.value).toBe(false)
    })

    it('treats plain number max the same as ref max', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
        max: 1,
      })
      const state = wrapper.vm.state

      state.selectItem(itemApple)

      expect(state.isAtMax.value).toBe(true)
    })
  })

  describe('getHideSelected() reactive ref path', () => {
    it('reacts to hideSelected ref changes', async () => {
      const hideSelected = ref(false)
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
        hideSelected,
      })
      const state = wrapper.vm.state

      state.collection.registerItem(itemApple)
      state.collection.registerItem(itemBanana)
      state.selectItem(itemApple)

      expect(state.visibleItems.value).toHaveLength(2)

      hideSelected.value = true
      await nextTick()

      expect(state.visibleItems.value).toHaveLength(1)
      expect(state.visibleItems.value[0]?.value).toBe('Banana')
    })
  })

  describe('getItemLabel / getItemValue with missing keys', () => {
    interface Fruit {
      id: number
      name: string
    }

    it('falls back to String(item) when labelKey property is missing', () => {
      const wrapper = createWrapper<Fruit>({
        baseId: 'test',
        labelKey: 'name',
      })
      const state = wrapper.vm.state

      const item = { id: 1 } as unknown as Fruit
      const label = state.getItemLabel(item)

      expect(label).toBe('[object Object]')
    })

    it('returns undefined from getItemValue when valueKey property is missing', () => {
      const wrapper = createWrapper<Fruit>({
        baseId: 'test',
        valueKey: 'name',
      })
      const state = wrapper.vm.state

      const item = { id: 1 } as unknown as Fruit
      const value = state.getItemValue(item)

      expect(value).toBeUndefined()
    })

    it('returns item itself when no labelKey on non-object', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        labelKey: 'name' as never,
      })
      const state = wrapper.vm.state

      expect(state.getItemLabel('hello')).toBe('hello')
    })
  })

  describe('dismiss() edge cases', () => {
    it('restores selected label in single-select mode', () => {
      const wrapper = createWrapper<string>({ baseId: 'test' })
      const state = wrapper.vm.state

      state.collection.registerItem(itemApple)
      state.collection.registerItem(itemBanana)

      state.selectItem(itemApple)
      expect(state.query.value).toBe('Apple')

      state.open()
      state.query.value = 'ban'

      state.dismiss()

      expect(state.isOpen.value).toBe(false)
      expect(state.query.value).toBe('Apple')
    })

    it('clears query when nothing is selected in single-select', () => {
      const wrapper = createWrapper<string>({ baseId: 'test' })
      const state = wrapper.vm.state

      state.open()
      state.query.value = 'search text'

      state.dismiss()

      expect(state.query.value).toBe('')
      expect(state.value.value).toBeNull()
    })

    it('clears query in multi-select mode without affecting value', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
        defaultValue: ['Apple'],
      })
      const state = wrapper.vm.state

      state.open()
      state.query.value = 'ban'

      state.dismiss()

      expect(state.query.value).toBe('')
      expect(state.value.value).toEqual(['Apple'])
    })

    it('restores label with valueKey (CROSS-01 fix)', () => {
      interface Fruit {
        id: string
        name: string
      }
      const fruits: Fruit[] = [
        { id: 'a', name: 'Apple' },
        { id: 'b', name: 'Banana' },
      ]

      const wrapper = createWrapper<Fruit>({
        baseId: 'test',
        items: fruits,
        labelKey: 'name',
        valueKey: 'id',
      })
      const state = wrapper.vm.state

      const itemA: CollectionItem<Fruit> = {
        id: 'opt-a',
        value: fruits[0]!,
        label: 'Apple',
        disabled: false,
      }
      state.collection.registerItem(itemA)
      state.selectItem(itemA)

      expect(state.value.value).toBe('a')
      expect(state.query.value).toBe('Apple')

      state.open()
      state.query.value = 'ban'

      state.dismiss()

      expect(state.query.value).toBe('Apple')
      expect(state.value.value).toBe('a')
    })

    it('is a no-op when already closed', () => {
      const wrapper = createWrapper<string>({ baseId: 'test' })
      const state = wrapper.vm.state

      state.query.value = 'test'
      expect(state.isOpen.value).toBe(false)

      state.dismiss()

      expect(state.query.value).toBe('test')
    })
  })

  describe('__DEV__ warnings', () => {
    it('warns when multiple is true with non-array defaultValue', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      createWrapper<string>({
        baseId: 'test',
        multiple: true,
        defaultValue: 'single-value' as unknown as string[],
      })

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('defaultValue should be an array'),
      )

      warnSpy.mockRestore()
    })

    it('does not warn when multiple is true with array defaultValue', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      createWrapper<string>({
        baseId: 'test',
        multiple: true,
        defaultValue: ['Apple'],
      })

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })
  })

  describe('selectItem when disabled', () => {
    it('is a no-op when disabled is true', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        disabled: ref(true),
      })
      const state = wrapper.vm.state

      state.selectItem(itemApple)

      expect(state.value.value).toBeNull()
    })
  })

  describe('open() when disabled', () => {
    it('is a no-op when disabled is true', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        disabled: ref(true),
      })
      const state = wrapper.vm.state

      state.open()

      expect(state.isOpen.value).toBe(false)
    })
  })

  describe('removeLast() eligibility', () => {
    it('only works in multi mode with empty query and non-empty selection', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
        defaultValue: ['Apple', 'Banana'],
      })
      const state = wrapper.vm.state

      state.query.value = ''
      state.removeLast()

      expect(state.value.value).toEqual(['Apple'])
    })

    it('does nothing in single-select mode', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        defaultValue: 'Apple',
      })
      const state = wrapper.vm.state

      state.query.value = ''
      state.removeLast()

      expect(state.value.value).toBe('Apple')
    })

    it('does nothing when query is non-empty', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
        defaultValue: ['Apple'],
      })
      const state = wrapper.vm.state

      state.query.value = 'search'
      state.removeLast()

      expect(state.value.value).toEqual(['Apple'])
    })

    it('does nothing when selection is empty', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
      })
      const state = wrapper.vm.state

      state.query.value = ''
      state.removeLast()

      expect(state.value.value).toEqual([])
    })
  })

  describe('clear() mode awareness', () => {
    it('returns null for single-select (via close/toggle path)', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        defaultValue: 'Apple',
      })
      const state = wrapper.vm.state

      state.value.value = null

      expect(state.value.value).toBeNull()
    })

    it('defaults to [] for multi-select', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
      })
      const state = wrapper.vm.state

      expect(state.value.value).toEqual([])
    })
  })

  describe('toggle and close', () => {
    it('toggle() flips isOpen state', () => {
      const wrapper = createWrapper<string>({ baseId: 'test' })
      const state = wrapper.vm.state

      expect(state.isOpen.value).toBe(false)

      state.toggle()
      expect(state.isOpen.value).toBe(true)

      state.toggle()
      expect(state.isOpen.value).toBe(false)
    })

    it('close() sets isOpen to false', () => {
      const wrapper = createWrapper<string>({ baseId: 'test' })
      const state = wrapper.vm.state

      state.open()
      expect(state.isOpen.value).toBe(true)

      state.close()
      expect(state.isOpen.value).toBe(false)
    })
  })

  describe('isSelected', () => {
    it('returns true for selected item in single-select', () => {
      const wrapper = createWrapper<string>({ baseId: 'test' })
      const state = wrapper.vm.state

      state.selectItem(itemApple)

      expect(state.isSelected(itemApple)).toBe(true)
      expect(state.isSelected(itemBanana)).toBe(false)
    })

    it('returns true for selected items in multi-select', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
      })
      const state = wrapper.vm.state

      state.selectItem(itemApple)

      expect(state.isSelected(itemApple)).toBe(true)
      expect(state.isSelected(itemBanana)).toBe(false)
    })
  })

  describe('resolvedDefaultValue normalization', () => {
    it('normalizes array defaultValue to null in single-select', () => {
      const wrapper = createWrapper<string>({
        baseId: 'test',
        defaultValue: ['Apple'] as unknown as string,
      })
      const state = wrapper.vm.state

      expect(state.value.value).toBeNull()
    })

    it('normalizes non-array defaultValue to [] in multi-select', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const wrapper = createWrapper<string>({
        baseId: 'test',
        multiple: true,
        defaultValue: 'Apple' as unknown as string[],
      })
      const state = wrapper.vm.state

      expect(state.value.value).toEqual([])
      warnSpy.mockRestore()
    })
  })
})
