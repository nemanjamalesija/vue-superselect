import { ref, shallowRef, watch, type Ref } from 'vue'
import { useCollection, type CollectionItem, type UseCollectionReturn } from './useCollection'
import { useFilter, type FilterFn, type UseFilterReturn } from './useFilter'
import { useKeyboard, type UseKeyboardReturn } from './useKeyboard'
import { useA11y, type UseA11yReturn } from './useA11y'
import { useControllable } from '../utils/useControllable'

export interface UseSelectStateOptions<T> {
  value?: Ref<T | null | undefined>
  defaultValue?: T | null
  onValueChange?: (value: T | null) => void
  open?: Ref<boolean | undefined>
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  filter?: FilterFn<T>
  debounce?: number
  loop?: boolean
  baseId: string
}

export interface UseSelectStateReturn<T> {
  value: Ref<T | null>
  isOpen: Ref<boolean>
  query: Ref<string>
  collection: UseCollectionReturn<T>
  filterState: UseFilterReturn<T>
  keyboard: UseKeyboardReturn
  a11y: UseA11yReturn
  selectItem: (item: CollectionItem<T>) => void
  open: () => void
  close: () => void
  toggle: () => void
}

export function useSelectState<T>(options: UseSelectStateOptions<T>): UseSelectStateReturn<T> {
  const {
    value: valueProp,
    defaultValue = null,
    onValueChange,
    open: openProp,
    defaultOpen = false,
    onOpenChange,
    filter,
    debounce,
    loop,
    baseId,
  } = options

  const value = useControllable<T | null>({
    prop: valueProp ?? shallowRef<T | null | undefined>(undefined),
    defaultValue,
    onChange: onValueChange,
  })

  const isOpen = useControllable<boolean>({
    prop: openProp ?? ref<boolean | undefined>(undefined),
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  })

  const query = ref('')

  const collection = useCollection<T>()
  const filterState = useFilter({
    items: collection.orderedItems,
    query,
    debounce,
    filter,
  })

  const selectItem = (item: CollectionItem<T>) => {
    value.value = item.value
    query.value = item.label
    isOpen.value = false
  }

  const keyboard = useKeyboard({
    items: filterState.filteredItems,
    loop,
    onSelect: selectItem,
    onEscape: () => {
      isOpen.value = false
    },
  })

  watch(filterState.filteredItems, () => {
    if (isOpen.value) keyboard.moveFirst()
  })

  const a11y = useA11y({
    baseId,
    isOpen,
    activeId: keyboard.activeId,
  })

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  const toggle = () => {
    isOpen.value = !isOpen.value
  }

  return {
    value,
    isOpen,
    query,
    collection,
    filterState,
    keyboard,
    a11y,
    selectItem,
    open,
    close,
    toggle,
  }
}
