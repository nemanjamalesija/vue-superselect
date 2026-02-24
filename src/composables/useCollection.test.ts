import { afterEach, describe, expect, it, vi } from 'vitest'
import { useCollection, type CollectionItem } from './useCollection'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('useCollection', () => {
  it('registers and unregisters items', () => {
    const { items, registerItem, unregisterItem } = useCollection<string>()

    registerItem({ id: 'a', value: 'Apple', label: 'Apple', disabled: false })
    registerItem({ id: 'b', value: 'Banana', label: 'Banana', disabled: false })

    expect(items.value.map((item) => item.id)).toEqual(['a', 'b'])

    unregisterItem('a')

    expect(items.value.map((item) => item.id)).toEqual(['b'])
  })

  it('updates items by id', () => {
    const { items, registerItem, updateItem } = useCollection<string>()

    registerItem({ id: 'a', value: 'Apple', label: 'Apple', disabled: false })
    updateItem('a', { label: 'Apricot' })

    expect(items.value[0]?.label).toBe('Apricot')
  })

  it('returns items in DOM order when elements are present', () => {
    const { orderedItems, registerItem } = useCollection<string>()

    const container = document.createElement('div')
    const elA = document.createElement('div')
    const elB = document.createElement('div')
    const elC = document.createElement('div')

    container.append(elA, elB, elC)
    document.body.appendChild(container)

    const items: CollectionItem<string>[] = [
      { id: 'c', value: 'Cherry', label: 'Cherry', disabled: false, element: elC },
      { id: 'a', value: 'Apple', label: 'Apple', disabled: false, element: elA },
      { id: 'b', value: 'Banana', label: 'Banana', disabled: false, element: elB },
    ]

    items.forEach(registerItem)

    expect(orderedItems.value.map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })

  it('falls back to insertion order when elements are missing', () => {
    const { orderedItems, registerItem } = useCollection<string>()

    registerItem({ id: 'c', value: 'Cherry', label: 'Cherry', disabled: false })
    registerItem({ id: 'a', value: 'Apple', label: 'Apple', disabled: false })
    registerItem({ id: 'b', value: 'Banana', label: 'Banana', disabled: false })

    expect(orderedItems.value.map((item) => item.id)).toEqual(['c', 'a', 'b'])
  })

  describe('duplicate value warnings', () => {
    it('warns on duplicate option values in dev mode', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { registerItem } = useCollection<string>()

      registerItem({ id: 'a', value: 'Apple', label: 'Apple', disabled: false })
      registerItem({ id: 'b', value: 'Apple', label: 'Apple Copy', disabled: false })

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Duplicate option value'),
      )

      warnSpy.mockRestore()
    })

    it('does not warn when same item id re-registers', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { registerItem } = useCollection<string>()

      registerItem({ id: 'a', value: 'Apple', label: 'Apple', disabled: false })
      registerItem({ id: 'a', value: 'Apple', label: 'Apple Updated', disabled: false })

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('does not warn for items with different values', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      const { registerItem } = useCollection<string>()

      registerItem({ id: 'a', value: 'Apple', label: 'Apple', disabled: false })
      registerItem({ id: 'b', value: 'Banana', label: 'Banana', disabled: false })

      expect(warnSpy).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })
  })
})
