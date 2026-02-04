import { describe, expect, it } from 'vitest'
import { ref } from 'vue'
import { useA11y } from './useA11y'

describe('useA11y', () => {
  it('provides combobox attrs with active descendant when active', () => {
    const isOpen = ref(true)
    const activeId = ref<string | null>('a')

    const { comboboxAttrs } = useA11y({ baseId: 'select', isOpen, activeId })

    expect(comboboxAttrs.value.role).toBe('combobox')
    expect(comboboxAttrs.value['aria-expanded']).toBe(true)
    expect(comboboxAttrs.value['aria-controls']).toBe('select-listbox')
    expect(comboboxAttrs.value['aria-activedescendant']).toBe('select-option-a')
    expect(comboboxAttrs.value['aria-autocomplete']).toBe('list')
  })

  it('omits aria-activedescendant when inactive', () => {
    const isOpen = ref(false)
    const activeId = ref<string | null>(null)

    const { comboboxAttrs } = useA11y({ baseId: 'select', isOpen, activeId })

    expect(comboboxAttrs.value['aria-activedescendant']).toBeUndefined()
  })

  it('provides listbox and option attrs', () => {
    const isOpen = ref(false)
    const activeId = ref<string | null>(null)

    const { listboxAttrs, getOptionAttrs } = useA11y({
      baseId: 'select',
      isOpen,
      activeId,
    })

    expect(listboxAttrs.value.id).toBe('select-listbox')
    expect(listboxAttrs.value.role).toBe('listbox')

    const attrs = getOptionAttrs({ id: 'a', selected: true, disabled: false })
    expect(attrs.id).toBe('select-option-a')
    expect(attrs.role).toBe('option')
    expect(attrs['aria-selected']).toBe(true)
    expect(attrs['aria-disabled']).toBeUndefined()
  })

  it('marks disabled option as aria-disabled', () => {
    const isOpen = ref(false)
    const activeId = ref<string | null>(null)

    const { getOptionAttrs } = useA11y({ baseId: 'select', isOpen, activeId })
    const attrs = getOptionAttrs({ id: 'b', selected: false, disabled: true })

    expect(attrs['aria-disabled']).toBe(true)
  })
})
