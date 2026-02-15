import { computed, ref, type Ref } from 'vue'
import type { CollectionItem } from './useCollection'

export interface UseKeyboardOptions<T> {
  items: Readonly<Ref<CollectionItem<T>[]>>
  loop?: boolean
  activeId?: Ref<string | null>
  onSelect?: (item: CollectionItem<T>) => void
  onEscape?: () => void
  onRemoveLast?: () => void
}

export interface UseKeyboardReturn {
  activeId: Ref<string | null>
  activeIndex: Ref<number>
  setActiveById: (id: string | null) => void
  moveNext: () => void
  movePrev: () => void
  moveFirst: () => void
  moveLast: () => void
  onKeyDown: (event: { key: string; preventDefault: () => void }) => void
}

const isEnabled = <T>(item: CollectionItem<T>) => !item.disabled

export function useKeyboard<T>(options: UseKeyboardOptions<T>): UseKeyboardReturn {
  const { items, loop = true, onSelect, onEscape, onRemoveLast } = options
  const internalActiveId = ref<string | null>(null)
  const activeId = options.activeId ?? internalActiveId

  const activeIndex = computed(() => items.value.findIndex((item) => item.id === activeId.value))

  const setActiveByIndex = (index: number) => {
    const item = items.value[index]
    activeId.value = item ? item.id : null
  }

  const findNextEnabledIndex = (startIndex: number, step: number) => {
    const list = items.value
    if (list.length === 0) return -1

    let index = startIndex

    for (let i = 0; i < list.length; i += 1) {
      index += step

      if (loop) {
        if (index >= list.length) index = 0
        if (index < 0) index = list.length - 1
      } else if (index < 0 || index >= list.length) {
        return -1
      }

      const candidate = list[index]
      if (candidate && isEnabled(candidate)) return index
    }

    return -1
  }

  const moveNext = () => {
    const startIndex = activeIndex.value === -1 ? -1 : activeIndex.value
    const nextIndex = findNextEnabledIndex(startIndex, 1)
    if (nextIndex !== -1) setActiveByIndex(nextIndex)
  }

  const movePrev = () => {
    const startIndex = activeIndex.value === -1 ? items.value.length : activeIndex.value
    const nextIndex = findNextEnabledIndex(startIndex, -1)
    if (nextIndex !== -1) setActiveByIndex(nextIndex)
  }

  const moveFirst = () => {
    const nextIndex = findNextEnabledIndex(-1, 1)
    if (nextIndex !== -1) setActiveByIndex(nextIndex)
  }

  const moveLast = () => {
    const nextIndex = findNextEnabledIndex(items.value.length, -1)
    if (nextIndex !== -1) setActiveByIndex(nextIndex)
  }

  const setActiveById = (id: string | null) => {
    if (id === null) {
      activeId.value = null
      return
    }

    const exists = items.value.some((item) => item.id === id)
    activeId.value = exists ? id : null
  }

  const onKeyDown = (event: { key: string; preventDefault: () => void }) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        moveNext()
        break
      case 'ArrowUp':
        event.preventDefault()
        movePrev()
        break
      case 'Home':
        event.preventDefault()
        moveFirst()
        break
      case 'End':
        event.preventDefault()
        moveLast()
        break
      case 'Escape':
        event.preventDefault()
        onEscape?.()
        break
      case 'Backspace':
        onRemoveLast?.()
        break
      case 'Enter': {
        const index = activeIndex.value
        if (index !== -1) {
          event.preventDefault()
          const item = items.value[index]
          if (item && isEnabled(item)) onSelect?.(item)
        }
        break
      }
      default:
        break
    }
  }

  return {
    activeId,
    activeIndex,
    setActiveById,
    moveNext,
    movePrev,
    moveFirst,
    moveLast,
    onKeyDown,
  }
}
