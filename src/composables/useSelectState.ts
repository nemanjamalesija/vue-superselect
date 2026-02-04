import { ref, type Ref } from 'vue'
import { useCollection } from './useCollection'
import { useFilter, type FilterFn } from './useFilter'
import { useKeyboard } from './useKeyboard'
import { useA11y } from './useA11y'
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

export function useSelectState<T>(options: UseSelectStateOptions<T>) {
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
    prop: valueProp ?? ref<T | null | undefined>(undefined),
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

  const keyboard = useKeyboard({ items: filterState.filteredItems, loop })

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
    open,
    close,
    toggle,
  }
}
