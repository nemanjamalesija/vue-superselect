import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useFilter } from './useFilter'
import type { CollectionItem } from './useCollection'

describe('useFilter', () => {
  it('returns empty array for empty items list', () => {
    const items = ref<CollectionItem<string>[]>([])
    const query = ref('search')

    const { filteredItems } = useFilter({ items, query })

    expect(filteredItems.value).toEqual([])
  })

  it('clears debounce timer on rapid typing (no stale results)', async () => {
    vi.useFakeTimers()

    const items = ref<CollectionItem<string>[]>([
      { id: 'a', value: 'Apple', label: 'Apple', disabled: false },
      { id: 'b', value: 'Banana', label: 'Banana', disabled: false },
      { id: 'c', value: 'Cherry', label: 'Cherry', disabled: false },
    ])
    const query = ref('')

    const { filteredItems } = useFilter({ items, query, debounce: 200 })

    query.value = 'a'
    await nextTick()

    vi.advanceTimersByTime(100)
    query.value = 'ch'
    await nextTick()

    vi.advanceTimersByTime(200)
    await nextTick()

    expect(filteredItems.value.map((item) => item.id)).toEqual(['c'])

    vi.useRealTimers()
  })

  it('returns all items when query is empty (no custom filter)', () => {
    const items = ref<CollectionItem<string>[]>([
      { id: 'a', value: 'Apple', label: 'Apple', disabled: false },
      { id: 'b', value: 'Banana', label: 'Banana', disabled: false },
    ])
    const query = ref('')

    const { filteredItems } = useFilter({ items, query })

    expect(filteredItems.value).toHaveLength(2)
  })

  it('filters case-insensitively by default', () => {
    const items = ref<CollectionItem<string>[]>([
      { id: 'a', value: 'Apple', label: 'Apple', disabled: false },
      { id: 'b', value: 'banana', label: 'banana', disabled: false },
    ])
    const query = ref('AP')

    const { filteredItems } = useFilter({ items, query })

    expect(filteredItems.value.map((item) => item.id)).toEqual(['a'])
  })

  it('uses a custom filter when provided', () => {
    const items = ref<CollectionItem<string>[]>([
      { id: 'a', value: 'Apple', label: 'Apple', disabled: false },
      { id: 'b', value: 'banana', label: 'banana', disabled: false },
    ])
    const query = ref('a')

    const { filteredItems } = useFilter({
      items,
      query,
      filter: (item, value) => item.label.endsWith(value),
    })

    expect(filteredItems.value.map((item) => item.id)).toEqual(['b'])
  })

  it('debounces query updates', async () => {
    vi.useFakeTimers()

    const items = ref<CollectionItem<string>[]>([
      { id: 'a', value: 'Apple', label: 'Apple', disabled: false },
      { id: 'b', value: 'Banana', label: 'Banana', disabled: false },
    ])
    const query = ref('')

    const { filteredItems } = useFilter({ items, query, debounce: 100 })

    query.value = 'ap'
    await nextTick()

    expect(filteredItems.value.length).toBe(2)

    vi.advanceTimersByTime(100)
    await nextTick()

    expect(filteredItems.value.map((item) => item.id)).toEqual(['a'])

    vi.useRealTimers()
  })

  it('defers filtering during IME composition', async () => {
    const items = ref<CollectionItem<string>[]>([
      { id: 'a', value: 'Apple', label: 'Apple', disabled: false },
      { id: 'b', value: 'Banana', label: 'Banana', disabled: false },
    ])
    const query = ref('')

    const { filteredItems, onCompositionStart, onCompositionEnd, isComposing } = useFilter({
      items,
      query,
    })

    onCompositionStart()
    query.value = 'app'
    await nextTick()

    expect(isComposing.value).toBe(true)
    expect(filteredItems.value.length).toBe(2)

    onCompositionEnd()
    await nextTick()

    expect(isComposing.value).toBe(false)
    expect(filteredItems.value.map((item) => item.id)).toEqual(['a'])
  })
})
