import { computed, isRef, onBeforeUnmount, ref, shallowRef, watch, type Ref } from 'vue'
import { useCollection, type CollectionItem, type UseCollectionReturn } from './useCollection'
import { useFilter, type FilterFn, type UseFilterReturn } from './useFilter'
import { useKeyboard, type UseKeyboardReturn } from './useKeyboard'
import { useA11y, type UseA11yReturn } from './useA11y'
import { useControllable } from '../utils/useControllable'

export type SelectValue<T> = T | T[] | null

export interface UseSelectStateOptions<T> {
  value?: Ref<SelectValue<T> | undefined>
  defaultValue?: SelectValue<T>
  onValueChange?: (value: SelectValue<T>) => void
  open?: Ref<boolean | undefined>
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  filter?: FilterFn<T>
  debounce?: number
  loop?: boolean
  multiple?: boolean
  max?: number | Ref<number | undefined>
  hideSelected?: boolean | Ref<boolean>
  disabled?: Ref<boolean>
  selectOnTab?: boolean
  placeholder?: Ref<string | undefined>
  baseId: string
  items?: Ref<T[] | undefined> | T[]
  labelKey?: keyof T
  valueKey?: keyof T
}

export interface UseSelectStateReturn<T> {
  value: Ref<SelectValue<T>>
  isOpen: Ref<boolean>
  query: Ref<string>
  collection: UseCollectionReturn<T>
  filterState: UseFilterReturn<T>
  visibleItems: Ref<CollectionItem<T>[]>
  keyboard: UseKeyboardReturn
  a11y: UseA11yReturn
  multiple: boolean
  isAtMax: Ref<boolean>
  disabled: Ref<boolean>
  placeholder: Ref<string | undefined>
  isSelected: (item: CollectionItem<T>) => boolean
  selectItem: (item: CollectionItem<T>) => void
  removeLast: () => void
  dismiss: () => void
  open: () => void
  close: () => void
  toggle: () => void
  getItemLabel: (item: T) => string
  getItemValue: (item: T) => unknown
}

interface OpenSelectOwner {
  id: string
  close: () => void
}

let openSelectOwner: OpenSelectOwner | null = null

const claimOpenSelectOwner = (nextOwner: OpenSelectOwner) => {
  if (openSelectOwner && openSelectOwner.id !== nextOwner.id) {
    openSelectOwner.close()
  }

  openSelectOwner = nextOwner
}

const releaseOpenSelectOwner = (id: string) => {
  if (openSelectOwner?.id === id) {
    openSelectOwner = null
  }
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
    multiple = false,
    max,
    hideSelected = false,
    disabled: disabledProp,
    selectOnTab = false,
    placeholder: placeholderProp,
    baseId,
    labelKey,
    valueKey,
  } = options

  const disabled = disabledProp ?? ref(false)
  const placeholder = placeholderProp ?? ref<string | undefined>(undefined)

  const getMax = () => (isRef(max) ? max.value : max)
  const getHideSelected = () => (isRef(hideSelected) ? hideSelected.value : hideSelected)

  const getItemLabel = (item: T): string => {
    if (labelKey && typeof item === 'object' && item !== null) {
      return String((item as Record<string, unknown>)[labelKey as string] ?? item)
    }
    return String(item)
  }

  const getItemValue = (item: T): unknown => {
    if (valueKey && typeof item === 'object' && item !== null) {
      return (item as Record<string, unknown>)[valueKey as string]
    }
    return item
  }

  if (__DEV__ && multiple && defaultValue !== null && defaultValue !== undefined && !Array.isArray(defaultValue)) {
    console.warn('[useSelectState] When multiple is true, defaultValue should be an array')
  }

  const resolvedDefaultValue: SelectValue<T> = multiple
    ? Array.isArray(defaultValue) ? defaultValue : []
    : Array.isArray(defaultValue) ? null : defaultValue

  const value = useControllable<SelectValue<T>>({
    prop: valueProp ?? shallowRef<SelectValue<T> | undefined>(undefined),
    defaultValue: resolvedDefaultValue,
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

  const isAtMax = computed(() => {
    const maxValue = getMax()
    if (!multiple || maxValue === undefined || !Array.isArray(value.value)) return false
    return value.value.length >= maxValue
  })

  const visibleItems = computed(() => {
    if (!multiple || !getHideSelected()) {
      return filterState.filteredItems.value
    }

    const selectedValues = Array.isArray(value.value) ? value.value : []
    return filterState.filteredItems.value.filter((item) =>
      !selectedValues.some((selected) => Object.is(selected, getItemValue(item.value))),
    )
  })

  const resolveSelectedLabel = (selectedValue: unknown): string | undefined => {
    const mountedItem = collection.orderedItems.value.find((item) =>
      Object.is(getItemValue(item.value), selectedValue),
    )
    if (mountedItem) return mountedItem.label

    const sourceItems = isRef(options.items) ? options.items.value : options.items
    if (!sourceItems) return undefined

    const sourceMatch = sourceItems.find((item) =>
      Object.is(getItemValue(item), selectedValue),
    )
    if (!sourceMatch) return undefined

    return getItemLabel(sourceMatch)
  }

  const syncQueryFromValue = () => {
    if (multiple || isOpen.value) return

    const nextValue = value.value
    if (nextValue === null || nextValue === undefined) {
      query.value = ''
      return
    }

    if (Array.isArray(nextValue)) return

    const resolvedLabel = resolveSelectedLabel(nextValue)
    query.value = resolvedLabel ?? String(nextValue)
  }

  watch(value, () => {
    syncQueryFromValue()
  })

  const selectItem = (item: CollectionItem<T>) => {
    if (disabled.value) return
    const extracted = getItemValue(item.value) as T

    if (multiple) {
      const selectedValues = Array.isArray(value.value) ? value.value : []
      const selectedIndex = selectedValues.findIndex((entry) => Object.is(entry, extracted))

      if (selectedIndex === -1 && isAtMax.value) return

      value.value =
        selectedIndex === -1
          ? [...selectedValues, extracted]
          : selectedValues.filter((_, index) => index !== selectedIndex)

      query.value = ''
      return
    }

    value.value = extracted
    query.value = item.label
    isOpen.value = false
  }

  const isSelected = (item: CollectionItem<T>) => {
    const extracted = getItemValue(item.value)

    if (multiple) {
      const selectedValues = Array.isArray(value.value) ? value.value : []
      return selectedValues.some((entry) => Object.is(entry, extracted))
    }

    return value.value !== null && !Array.isArray(value.value) && Object.is(value.value, extracted)
  }

  const removeLast = () => {
    if (!multiple || query.value !== '') return
    if (!Array.isArray(value.value) || value.value.length === 0) return
    value.value = value.value.slice(0, -1)
  }

  const keyboard = useKeyboard({
    items: visibleItems,
    loop,
    isOpen,
    onSelect: selectItem,
    onEscape: () => {
      isOpen.value = false
    },
    onEscapeSecond: () => {
      query.value = ''
    },
    onTab: () => {
      if (selectOnTab && isOpen.value) {
        const activeIdx = keyboard.activeIndex.value
        if (activeIdx !== -1) {
          const item = visibleItems.value[activeIdx]
          if (item) selectItem(item)
        }
      }
      if (isOpen.value) close()
    },
    onRemoveLast: multiple ? removeLast : undefined,
  })

  watch(visibleItems, () => {
    if (isOpen.value) keyboard.moveFirst()
  })

  const a11y = useA11y({
    baseId,
    isOpen,
    activeId: keyboard.activeId,
    multiple,
    disabled,
  })

  const dismiss = () => {
    if (!isOpen.value) return

    isOpen.value = false

    if (multiple) {
      query.value = ''
    } else {
      if (value.value !== null && value.value !== undefined) {
        const selectedItem = collection.orderedItems.value.find(
          (item) => Object.is(getItemValue(item.value), value.value),
        )
        query.value = selectedItem?.label ?? ''
      } else {
        query.value = ''
      }
    }
  }

  const close = () => {
    releaseOpenSelectOwner(baseId)
    isOpen.value = false
  }

  const open = () => {
    if (disabled.value) return
    claimOpenSelectOwner({ id: baseId, close })
    isOpen.value = true
  }

  const toggle = () => {
    if (isOpen.value) {
      close()
      return
    }

    open()
  }

  watch(
    isOpen,
    (openState) => {
      if (openState) {
        claimOpenSelectOwner({ id: baseId, close })
      } else {
        releaseOpenSelectOwner(baseId)
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    releaseOpenSelectOwner(baseId)
  })

  return {
    value,
    isOpen,
    query,
    collection,
    filterState,
    visibleItems,
    keyboard,
    a11y,
    multiple,
    isAtMax,
    disabled,
    placeholder,
    isSelected,
    selectItem,
    removeLast,
    dismiss,
    open,
    close,
    toggle,
    getItemLabel,
    getItemValue,
  }
}
