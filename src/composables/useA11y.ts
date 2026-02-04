import { computed, type Ref } from 'vue'

export interface UseA11yOptions {
  baseId: string
  isOpen: Ref<boolean>
  activeId: Ref<string | null>
}

export interface OptionA11yInput {
  id: string
  selected: boolean
  disabled: boolean
}

interface UseA11yReturn {
  listboxId: string
  getOptionId: (itemId: string) => string
  comboboxAttrs: Ref<Record<string, unknown>>
  listboxAttrs: Ref<Record<string, unknown>>
  getOptionAttrs: (input: OptionA11yInput) => Record<string, unknown>
}

export function useA11y(options: UseA11yOptions): UseA11yReturn {
  const { baseId, isOpen, activeId } = options
  const listboxId = `${baseId}-listbox`

  const getOptionId = (itemId: string) => `${baseId}-option-${itemId}`

  const comboboxAttrs = computed(() => {
    const activeDescendant = activeId.value ? getOptionId(activeId.value) : undefined

    return {
      role: 'combobox',
      'aria-expanded': isOpen.value,
      'aria-controls': listboxId,
      'aria-activedescendant': activeDescendant,
      'aria-autocomplete': 'list',
    }
  })

  const listboxAttrs = computed(() => ({
    id: listboxId,
    role: 'listbox',
  }))

  const getOptionAttrs = (input: OptionA11yInput) => ({
    id: getOptionId(input.id),
    role: 'option',
    'aria-selected': input.selected,
    'aria-disabled': input.disabled || undefined,
  })

  return {
    listboxId,
    getOptionId,
    comboboxAttrs,
    listboxAttrs,
    getOptionAttrs,
  }
}
