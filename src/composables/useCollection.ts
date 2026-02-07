import { computed, shallowRef, type Ref } from 'vue'

export interface CollectionItem<T = unknown> {
  id: string
  value: T
  label: string
  disabled: boolean
  element?: HTMLElement | null
}

export interface UseCollectionReturn<T> {
  items: Readonly<Ref<readonly CollectionItem<T>[]>>
  orderedItems: Readonly<Ref<CollectionItem<T>[]>>
  registerItem: (item: CollectionItem<T>) => void
  unregisterItem: (id: string) => void
  updateItem: (id: string, patch: Partial<CollectionItem<T>>) => void
  getItemById: (id: string) => CollectionItem<T> | undefined
}

const hasElement = <T>(item: CollectionItem<T>) => item.element != null

export function useCollection<T = unknown>(): UseCollectionReturn<T> {
  const items = shallowRef<CollectionItem<T>[]>([])

  const orderedItems = computed<CollectionItem<T>[]>(() => {
    const list = items.value
    if (list.length === 0) return []
    if (!list.every(hasElement)) return list

    return [...list].sort((a, b) => {
      if (a.element === b.element) return 0
      const position = a.element!.compareDocumentPosition(b.element!)
      if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1
      if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1
      return 0
    })
  })

  function registerItem(item: CollectionItem<T>) {
    const index = items.value.findIndex((existing) => existing.id === item.id)
    if (index === -1) {
      items.value = [...items.value, item]
      return
    }

    const next = [...items.value]
    next[index] = item
    items.value = next
  }

  function unregisterItem(id: string) {
    items.value = items.value.filter((item) => item.id !== id)
  }

  function updateItem(id: string, patch: Partial<CollectionItem<T>>) {
    const index = items.value.findIndex((item) => item.id === id)
    if (index === -1) return

    const next = [...items.value]
    const current = next[index]
    if (!current) return

    next[index] = { ...current, ...patch }
    items.value = next
  }

  function getItemById(id: string) {
    return items.value.find((item) => item.id === id)
  }

  return {
    items: items as Readonly<Ref<readonly CollectionItem<T>[]>>,
    orderedItems,
    registerItem,
    unregisterItem,
    updateItem,
    getItemById,
  }
}
