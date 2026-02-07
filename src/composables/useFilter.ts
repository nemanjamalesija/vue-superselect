import { computed, ref, watch, type Ref } from 'vue'
import type { CollectionItem } from './useCollection'

export type FilterFn<T> = (item: CollectionItem<T>, query: string) => boolean

export interface UseFilterOptions<T> {
  items: Readonly<Ref<CollectionItem<T>[]>>
  query: Ref<string>
  debounce?: number
  filter?: FilterFn<T>
}

export interface UseFilterReturn<T> {
  filteredItems: Readonly<Ref<CollectionItem<T>[]>>
  isComposing: Ref<boolean>
  onCompositionStart: () => void
  onCompositionEnd: () => void
}

const defaultFilter = <T>(item: CollectionItem<T>, query: string) => {
  if (query === '') return true
  return item.label.toLowerCase().includes(query.toLowerCase())
}

export function useFilter<T>(options: UseFilterOptions<T>): UseFilterReturn<T> {
  const { items, query, debounce = 0, filter } = options
  const isComposing = ref(false)
  const debouncedQuery = ref(query.value)

  let timer: ReturnType<typeof setTimeout> | null = null

  const scheduleUpdate = (nextQuery: string) => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    if (debounce <= 0) {
      debouncedQuery.value = nextQuery
      return
    }

    timer = setTimeout(() => {
      debouncedQuery.value = nextQuery
    }, debounce)
  }

  watch(query, (nextQuery) => {
    if (isComposing.value) return
    scheduleUpdate(nextQuery)
  })

  const filteredItems = computed(() => {
    const currentQuery = debouncedQuery.value
    const list = items.value

    if (!filter) {
      if (currentQuery === '') return list
      return list.filter((item) => defaultFilter(item, currentQuery))
    }

    return list.filter((item) => filter(item, currentQuery))
  })

  const onCompositionStart = () => {
    isComposing.value = true
  }

  const onCompositionEnd = () => {
    isComposing.value = false
    scheduleUpdate(query.value)
  }

  return {
    filteredItems,
    isComposing,
    onCompositionStart,
    onCompositionEnd,
  }
}
