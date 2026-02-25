import { isRef, ref, type Ref } from 'vue'
import { useSelectState, type SelectValue, type UseSelectStateOptions } from './useSelectState'
import { mergeProps } from '../utils/mergeProps'
import { useId } from '../utils/useId'
import type { CollectionItem } from './useCollection'
import type { SelectDataAttributes } from '../components/select/selectTypes'

/**
 * Resolves a user-facing label for a selected value when option metadata
 * is not currently mounted (for example when list content is closed).
 */
export type SelectLabelResolver<T> = (value: T) => string | undefined

export interface UseSelectOptions<T> extends Omit<UseSelectStateOptions<T>, 'baseId'> {
  id?: string
  resolveLabel?: SelectLabelResolver<T>
}

export interface UseSelectReturn<T> {
  getRootProps: (userProps?: Record<string, unknown>) => Record<string, unknown>
  getInputProps: (userProps?: Record<string, unknown>) => Record<string, unknown>
  getListboxProps: (userProps?: Record<string, unknown>) => Record<string, unknown>
  getOptionProps: (
    item: CollectionItem<T>,
    userProps?: Record<string, unknown>,
  ) => Record<string, unknown>
  items: Readonly<Ref<readonly CollectionItem<T>[]>>
  orderedItems: Ref<CollectionItem<T>[]>
  filteredItems: Ref<CollectionItem<T>[]>
  visibleItems: Ref<CollectionItem<T>[]>
  activeId: Ref<string | null>
  activeIndex: Ref<number>
  value: Ref<SelectValue<T>>
  isOpen: Ref<boolean>
  query: Ref<string>
  multiple: boolean
  isAtMax: Ref<boolean>
  disabled: Ref<boolean>
  placeholder: Ref<string | undefined>
  isSelected: (item: CollectionItem<T>) => boolean
  dismiss: () => void
  open: () => void
  close: () => void
  toggle: () => void
  clear: () => void
  focus: () => void
  removeLast: () => void
  registerItem: (item: CollectionItem<T>) => void
  unregisterItem: (id: string) => void
  updateItem: (id: string, patch: Partial<CollectionItem<T>>) => void
  resolveLabel: (value: unknown) => string | undefined
  getItemLabel: (item: T) => string
  getItemValue: (item: T) => unknown
  controlRef: Ref<HTMLElement | null>
  inputRef: Ref<HTMLElement | null>
}

export function useSelect<T>(options: UseSelectOptions<T> = {}): UseSelectReturn<T> {
  const { id, resolveLabel: resolveLabelProp, ...stateOptions } = options
  const baseId = id ?? useId()

  const state = useSelectState<T>({
    ...stateOptions,
    baseId,
  })

  const {
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
  } = state
  const controlRef = ref<HTMLElement | null>(null)
  const inputRef = ref<HTMLElement | null>(null)

  const isWithinSelect = (target: EventTarget | null) => {
    if (!(target instanceof Node)) return false

    const rootEl = document.getElementById(baseId)
    if (rootEl?.contains(target)) return true

    const listboxEl = document.getElementById(a11y.listboxId)
    if (listboxEl?.contains(target)) return true

    return false
  }

  const handleFocusoutDismiss = (event: FocusEvent) => {
    requestAnimationFrame(() => {
      if (isWithinSelect(event.relatedTarget)) return
      if (isOpen.value) dismiss()
    })
  }

  const getRootProps = (userProps: Record<string, unknown> = {}) => {
    const dataAttrs: SelectDataAttributes = {
      'data-state': isOpen.value ? 'open' : 'closed',
      'data-disabled': disabled.value ? 'true' : undefined,
    }

    return mergeProps({ id: baseId, ...dataAttrs, onFocusout: handleFocusoutDismiss }, userProps)
  }

  const getInputProps = (userProps: Record<string, unknown> = {}) => {
    const focusWithoutScroll = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) return
      if (document.activeElement === target) return

      try {
        target.focus({ preventScroll: true })
      } catch {
        target.focus()
      }
    }

    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null
      if (!target) return
      query.value = target.value
      if (!isOpen.value) open()
    }

    const onMousedown = (event: Event) => {
      if (disabled.value) return
      focusWithoutScroll(event.currentTarget)
      if (!isOpen.value) open()
    }

    const internal = mergeProps(a11y.comboboxAttrs.value, {
      value: query.value,
      disabled: disabled.value || undefined,
      placeholder: placeholder.value,
      onInput,
      onMousedown,
      onFocusout: handleFocusoutDismiss,
      onKeydown: keyboard.onKeyDown,
      onCompositionstart: filterState.onCompositionStart,
      onCompositionend: filterState.onCompositionEnd,
    })

    return mergeProps(internal, userProps)
  }

  const getListboxProps = (userProps: Record<string, unknown> = {}) =>
    mergeProps(a11y.listboxAttrs.value, userProps)

  const resolveLabel = (val: unknown): string | undefined => {
    if (resolveLabelProp) return resolveLabelProp(val as T)

    const itemsArray = isRef(options.items) ? options.items.value : options.items
    if (!itemsArray) return undefined

    const match = itemsArray.find((item) => {
      const extracted = state.getItemValue(item as T)
      return Object.is(extracted, val)
    })
    if (!match) return undefined
    return state.getItemLabel(match as T)
  }

  const getOptionProps = (item: CollectionItem<T>, userProps: Record<string, unknown> = {}) => {
    const isSelectedValue = isSelected(item)
    const disabledByMax = isAtMax.value && !isSelectedValue
    const disabled = item.disabled || disabledByMax
    const isHighlighted = keyboard.activeId.value === item.id
    const dataAttrs: SelectDataAttributes = {
      'data-selected': String(isSelectedValue) as 'true' | 'false',
      'data-highlighted': String(isHighlighted) as 'true' | 'false',
      'data-disabled': String(disabled) as 'true' | 'false',
    }

    const internal = mergeProps(
      a11y.getOptionAttrs({
        id: item.id,
        selected: isSelectedValue,
        disabled,
      }),
      {
        onMousedown: (event: Event) => {
          const mouseEvent = event as { preventDefault?: () => void }
          mouseEvent.preventDefault?.()
        },
        onMousemove: () => {
          if (!disabled) keyboard.setActiveById(item.id)
        },
        onClick: () => {
          if (disabled) return
          selectItem(item)
          keyboard.setActiveById(item.id)
        },
        ...dataAttrs,
      },
    )

    return mergeProps(internal, userProps)
  }

  const clear = () => {
    if (multiple) {
      value.value = [] as unknown as SelectValue<T>
    } else {
      value.value = null
    }
    query.value = ''
  }

  const focus = () => {
    inputRef.value?.focus()
  }

  return {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    items: collection.items,
    orderedItems: collection.orderedItems,
    filteredItems: filterState.filteredItems,
    visibleItems,
    activeId: keyboard.activeId,
    activeIndex: keyboard.activeIndex,
    value,
    isOpen,
    query,
    multiple,
    isAtMax,
    disabled,
    placeholder,
    isSelected,
    dismiss,
    open,
    close,
    toggle,
    clear,
    focus,
    removeLast,
    registerItem: collection.registerItem,
    unregisterItem: collection.unregisterItem,
    updateItem: collection.updateItem,
    resolveLabel,
    getItemLabel: state.getItemLabel,
    getItemValue: state.getItemValue,
    controlRef,
    inputRef,
  }
}
