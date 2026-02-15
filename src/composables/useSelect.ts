import type { Ref } from 'vue'
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
  isSelected: (item: CollectionItem<T>) => boolean
  open: () => void
  close: () => void
  toggle: () => void
  registerItem: (item: CollectionItem<T>) => void
  unregisterItem: (id: string) => void
  updateItem: (id: string, patch: Partial<CollectionItem<T>>) => void
  resolveLabel: (value: unknown) => string | undefined
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
    isSelected,
    selectItem,
    open,
    close,
    toggle,
  } = state

  const getRootProps = (userProps: Record<string, unknown> = {}) => {
    const dataAttrs: SelectDataAttributes = {
      'data-state': isOpen.value ? 'open' : 'closed',
    }

    return mergeProps({ id: baseId, ...dataAttrs }, userProps)
  }

  const getInputProps = (userProps: Record<string, unknown> = {}) => {
    const onInput = (event: Event) => {
      const target = event.target as HTMLInputElement | null
      if (!target) return
      query.value = target.value
      if (!isOpen.value) open()
    }

    const onMousedown = () => {
      if (!isOpen.value) open()
    }

    const internal = mergeProps(a11y.comboboxAttrs.value, {
      value: query.value,
      onInput,
      onMousedown,
      onKeydown: keyboard.onKeyDown,
      onCompositionstart: filterState.onCompositionStart,
      onCompositionend: filterState.onCompositionEnd,
    })

    return mergeProps(internal, userProps)
  }

  const getListboxProps = (userProps: Record<string, unknown> = {}) =>
    mergeProps(a11y.listboxAttrs.value, userProps)

  const resolveLabel = (value: unknown) => resolveLabelProp?.(value as T)

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
    isSelected,
    open,
    close,
    toggle,
    registerItem: collection.registerItem,
    unregisterItem: collection.unregisterItem,
    updateItem: collection.updateItem,
    resolveLabel,
  }
}
