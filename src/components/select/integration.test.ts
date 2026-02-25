import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectInput } from './SelectInput'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'
import { SelectControl } from './SelectControl'
import { SelectTag } from './SelectTag'
import { SelectClear } from './SelectClear'
import { SelectEmpty } from './SelectEmpty'
import { SelectTrigger } from './SelectTrigger'

const FLOATING_UI_OVERRIDE_KEY = '__VUE_SUPERSELECT_FLOATING_UI_MODULE__'

const setFloatingUIOverride = (value: unknown) => {
  const host = globalThis as {
    __VUE_SUPERSELECT_FLOATING_UI_MODULE__?: unknown
  }
  host[FLOATING_UI_OVERRIDE_KEY] = value
}

const clearFloatingUIOverride = () => {
  const host = globalThis as {
    __VUE_SUPERSELECT_FLOATING_UI_MODULE__?: unknown
  }
  delete host[FLOATING_UI_OVERRIDE_KEY]
}

const fruitOptions = [
  { id: 'apple', value: 'Apple', label: 'Apple' },
  { id: 'banana', value: 'Banana', label: 'Banana' },
  { id: 'cherry', value: 'Cherry', label: 'Cherry' },
  { id: 'date', value: 'Date', label: 'Date' },
]

beforeEach(() => {
  setFloatingUIOverride(null)
})

afterEach(() => {
  clearFloatingUIOverride()
  document.body.innerHTML = ''
})

describe('Integration: Cross-feature scenarios', () => {
  describe('1. Multi-select + filtering + keyboard navigation', () => {
    it('filters, navigates with keyboard, selects, and verifies multi-select behavior', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string[]>([])
          return { value, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" multiple id="multi-filter" aria-label="Select fruits">
            <SelectInput aria-label="Search fruits" />
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')

      // Type to filter
      await input.setValue('an')
      await wrapper.vm.$nextTick()

      // Should show Banana only (contains "an")
      const filteredOptions = wrapper.findAll('[role="option"]')
      expect(filteredOptions.length).toBe(1)
      expect(filteredOptions[0].text()).toContain('Banana')

      // ArrowDown to highlight, Enter to select
      await input.trigger('keydown', { key: 'ArrowDown' })
      await input.trigger('keydown', { key: 'Enter' })

      // Dropdown should stay open (multi-select mode)
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
      expect(wrapper.vm.value).toEqual(['Banana'])

      // Clear filter to show all options
      await input.setValue('')
      await wrapper.vm.$nextTick()

      const allOptions = wrapper.findAll('[role="option"]')
      expect(allOptions.length).toBe(4)

      // Select another item
      const appleOption = wrapper.find('#multi-filter-option-apple')
      await appleOption.trigger('click')

      expect(wrapper.vm.value).toEqual(['Banana', 'Apple'])
    })
  })

  describe('2. Multi-select + hideSelected + keyboard', () => {
    it('hides selected options and adjusts keyboard navigation', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectEmpty },
        setup() {
          const value = ref<string[]>([])
          return { value, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" multiple hideSelected :defaultOpen="true" id="hide-sel">
            <SelectInput aria-label="Select" />
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
              <SelectEmpty>All selected</SelectEmpty>
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // All 4 options visible initially
      expect(wrapper.findAll('[role="option"]')).toHaveLength(4)

      // Select Apple
      await wrapper.find('#hide-sel-option-apple').trigger('click')
      await wrapper.vm.$nextTick()

      // Apple should be hidden
      expect(wrapper.find('#hide-sel-option-apple').exists()).toBe(false)
      expect(wrapper.findAll('[role="option"]')).toHaveLength(3)

      // Keyboard navigate remaining options
      const input = wrapper.find('input')
      await input.trigger('keydown', { key: 'ArrowDown' })

      const activeId = input.attributes('aria-activedescendant')
      // Should navigate among remaining visible options (not Apple)
      expect(activeId).toBeDefined()
      expect(activeId).not.toContain('apple')

      // Select remaining options one by one
      await wrapper.find('#hide-sel-option-banana').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('[role="option"]')).toHaveLength(2)

      await wrapper.find('#hide-sel-option-cherry').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('[role="option"]')).toHaveLength(1)

      await wrapper.find('#hide-sel-option-date').trigger('click')
      await wrapper.vm.$nextTick()

      // All selected: no visible options remain
      expect(wrapper.findAll('[role="option"]')).toHaveLength(0)
      expect(wrapper.vm.value).toEqual(['Apple', 'Banana', 'Cherry', 'Date'])
    })
  })

  describe('3. Multi-select + max + keyboard', () => {
    it('enforces max limit and disables remaining options', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string[]>([])
          return { value, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" multiple :max="2" :defaultOpen="true" id="max-test">
            <SelectInput aria-label="Select" />
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Select 2 items
      await wrapper.find('#max-test-option-apple').trigger('click')
      await wrapper.find('#max-test-option-banana').trigger('click')

      expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])

      // Remaining unselected options should be disabled
      const cherryOption = wrapper.find('#max-test-option-cherry')
      expect(cherryOption.attributes('aria-disabled')).toBe('true')

      const dateOption = wrapper.find('#max-test-option-date')
      expect(dateOption.attributes('aria-disabled')).toBe('true')

      // Attempt to click disabled-by-max option -- should not add it
      await cherryOption.trigger('click')
      expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])

      // Remove one item by clicking the already-selected item (toggle deselect)
      await wrapper.find('#max-test-option-apple').trigger('click')
      expect(wrapper.vm.value).toEqual(['Banana'])

      // Now remaining options should be interactive again
      const cherryAfterRemove = wrapper.find('#max-test-option-cherry')
      expect(cherryAfterRemove.attributes('aria-disabled')).not.toBe('true')
    })
  })

  describe('4. Disabled state + all interactions', () => {
    it('suppresses all interactions when disabled', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectTrigger, SelectClear },
        setup() {
          const value = ref<string | null>('Apple')
          return { value, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" disabled id="disabled-all">
            <SelectTrigger>Toggle</SelectTrigger>
            <SelectInput aria-label="Search" />
            <SelectClear>Clear</SelectClear>
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      // 1. Click trigger -> no open
      const trigger = wrapper.find('button[type="button"]')
      await trigger.trigger('click')
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)

      // 2. Type in input -> no filter/open
      const input = wrapper.find('input')
      expect(input.attributes('disabled')).toBeDefined()

      // 3. Click clear -> no clear
      const clearBtn = wrapper.findAll('button').find(
        (btn) => btn.text() === 'Clear',
      )
      expect(clearBtn).toBeDefined()
      await clearBtn!.trigger('click')
      expect(wrapper.vm.value).toBe('Apple')
    })
  })

  describe('5. Controlled value + controlled open (bidirectional v-model)', () => {
    it('supports bidirectional v-model for both value and open', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          const open = ref(false)
          return { value, open, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" v-model:open="open" id="controlled">
            <SelectInput aria-label="Select" />
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      // Programmatically change open from parent
      wrapper.vm.open = true
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="listbox"]').exists()).toBe(true)

      // Select an option, verify parent value updates
      await wrapper.find('#controlled-option-cherry').trigger('click')
      expect(wrapper.vm.value).toBe('Cherry')

      // After single-select, dropdown closes
      expect(wrapper.vm.open).toBe(false)

      // Programmatically change value from parent
      wrapper.vm.value = 'Banana'
      await wrapper.vm.$nextTick()

      // Value ref should reflect the change
      expect(wrapper.vm.value).toBe('Banana')
      const input = wrapper.find('input')
      expect((input.element as HTMLInputElement).value).toBe('Banana')

      // Open again via input to verify selected state
      await input.setValue('')
      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      const bananaOpt = wrapper.find('#controlled-option-banana')
      expect(bananaOpt.exists()).toBe(true)
      expect(bananaOpt.attributes('aria-selected')).toBe('true')
    })
  })

  describe('6. Accessibility full lifecycle', () => {
    it('validates complete ARIA contract through combobox lifecycle', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          return { value, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" id="a11y">
            <SelectInput aria-label="Fruit picker" />
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')

      // CLOSED state
      expect(input.attributes('role')).toBe('combobox')
      expect(input.attributes('aria-expanded')).toBe('false')
      expect(input.attributes('aria-autocomplete')).toBe('list')
      expect(input.attributes('aria-controls')).toBe('a11y-listbox')

      // OPEN state
      await input.setValue('')
      expect(input.attributes('aria-expanded')).toBe('true')

      const listbox = wrapper.find('[role="listbox"]')
      expect(listbox.exists()).toBe(true)
      expect(listbox.attributes('id')).toBe('a11y-listbox')

      const options = wrapper.findAll('[role="option"]')
      expect(options).toHaveLength(4)

      // NAVIGATE: aria-activedescendant tracks highlighted option
      expect(input.attributes('aria-activedescendant')).toBe('a11y-option-apple')

      await input.trigger('keydown', { key: 'ArrowDown' })
      expect(input.attributes('aria-activedescendant')).toBe('a11y-option-banana')

      // SELECT
      await input.trigger('keydown', { key: 'Enter' })
      expect(wrapper.vm.value).toBe('Banana')
    })

    it('validates multi-select ARIA attributes', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string[]>([])
          return { value, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" multiple :defaultOpen="true" id="a11y-multi">
            <SelectInput aria-label="Multi fruit" />
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()

      // Multi-select: aria-multiselectable on listbox
      const listbox = wrapper.find('[role="listbox"]')
      expect(listbox.attributes('aria-multiselectable')).toBe('true')

      // Select option
      await wrapper.find('#a11y-multi-option-apple').trigger('click')

      const selectedOption = wrapper.find('#a11y-multi-option-apple')
      expect(selectedOption.attributes('aria-selected')).toBe('true')

      // Disabled option test
      const wrapper2 = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string[]>([])
          return { value }
        },
        template: `
          <SelectRoot v-model="value" multiple :defaultOpen="true" id="a11y-disabled-opt">
            <SelectInput aria-label="With disabled" />
            <SelectContent>
              <SelectOption id="x" value="X" label="Enabled" />
              <SelectOption id="y" value="Y" label="Disabled" disabled />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper2.vm.$nextTick()

      const disabledOpt = wrapper2.find('#a11y-disabled-opt-option-y')
      expect(disabledOpt.attributes('aria-disabled')).toBe('true')

      // Keyboard should skip disabled option
      const input2 = wrapper2.find('input')
      // First ArrowDown highlights Enabled (first)
      expect(input2.attributes('aria-activedescendant')).toBe('a11y-disabled-opt-option-x')
      // ArrowDown should skip disabled and loop (if loop is true) back to first
      await input2.trigger('keydown', { key: 'ArrowDown' })
      // Should stay on first since disabled option is skipped
      const activeAfter = input2.attributes('aria-activedescendant')
      expect(activeAfter).toBe('a11y-disabled-opt-option-x')
    })
  })

  describe('7. Filter + clear cycle', () => {
    it('handles filter, Escape clear, and re-filter cycle', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string | null>(null)
          return { value, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" id="filter-cycle">
            <SelectInput aria-label="Search" />
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')

      // Type query
      await input.setValue('ch')
      await wrapper.vm.$nextTick()

      // Should show Cherry only
      const filtered = wrapper.findAll('[role="option"]')
      expect(filtered.length).toBe(1)
      expect(filtered[0].text()).toContain('Cherry')

      // Escape closes dropdown
      await input.trigger('keydown', { key: 'Escape' })
      await wrapper.vm.$nextTick()
      expect(wrapper.find('[role="listbox"]').exists()).toBe(false)

      // Second Escape clears query
      await input.trigger('keydown', { key: 'Escape' })
      await wrapper.vm.$nextTick()
      expect(input.element.value).toBe('')

      // Type again and select
      await input.setValue('ban')
      await wrapper.vm.$nextTick()

      const filteredAgain = wrapper.findAll('[role="option"]')
      expect(filteredAgain.length).toBe(1)

      await filteredAgain[0].trigger('click')
      expect(wrapper.vm.value).toBe('Banana')

      // After selection, query clears and list closes
      expect(input.element.value).toBe('Banana')
    })
  })

  describe('8. Empty state transitions', () => {
    it('shows and hides empty state based on filter results', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectEmpty },
        setup() {
          const value = ref<string | null>(null)
          return { value, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" id="empty-transition">
            <SelectInput aria-label="Search" />
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
              <SelectEmpty>No matches found</SelectEmpty>
            </SelectContent>
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')

      // Type query that matches no options
      await input.setValue('xyz')
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('[role="option"]')).toHaveLength(0)
      expect(wrapper.text()).toContain('No matches found')

      // Modify query to match options
      await input.setValue('ap')
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('[role="option"]').length).toBeGreaterThan(0)
      expect(wrapper.text()).not.toContain('No matches found')

      // Clear query to show full list
      await input.setValue('')
      await wrapper.vm.$nextTick()

      expect(wrapper.findAll('[role="option"]')).toHaveLength(4)
      expect(wrapper.text()).not.toContain('No matches found')
    })
  })

  describe('9. Full component tree with tags, clear, and control', () => {
    it('integrates tags, control, clear, and multi-select lifecycle', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectControl, SelectTag, SelectClear },
        setup() {
          const value = ref<string[]>([])
          return { value, fruitOptions }
        },
        template: `
          <SelectRoot v-model="value" multiple :defaultOpen="true" id="full-tree">
            <SelectControl v-slot="{ selectedItems, removeItem }">
              <SelectTag
                v-for="item in selectedItems"
                :key="String(item.value)"
                :value="item.value"
                :label="item.label"
                @remove="removeItem(item.value)"
              />
              <SelectInput aria-label="Select" />
            </SelectControl>
            <SelectClear>Clear All</SelectClear>
            <SelectContent>
              <SelectOption
                v-for="opt in fruitOptions"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
              />
            </SelectContent>
          </SelectRoot>
        `,
      }))

      await wrapper.vm.$nextTick()
      await wrapper.vm.$nextTick()

      // Select two items
      await wrapper.find('#full-tree-option-apple').trigger('click')
      await wrapper.find('#full-tree-option-cherry').trigger('click')

      expect(wrapper.vm.value).toEqual(['Apple', 'Cherry'])

      // Tags should be rendered
      const tags = wrapper.findAll('[data-part="tag"]')
      expect(tags).toHaveLength(2)

      // Remove via tag
      const removeBtn = tags[0].find('[data-part="remove"]')
      await removeBtn.trigger('click')

      expect(wrapper.vm.value).toEqual(['Cherry'])

      // Clear all
      const clearBtn = wrapper.findAll('button').find(
        (btn) => btn.text() === 'Clear All',
      )
      await clearBtn!.trigger('click')

      expect(wrapper.vm.value).toEqual([])
    })
  })

  describe('10. Multiple instances coordination', () => {
    it('closes the first list when opening a second select', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const first = ref<string | null>(null)
          const second = ref<string | null>(null)
          return { first, second, fruitOptions }
        },
        template: `
          <div>
            <SelectRoot v-model="first" id="first-select">
              <SelectInput aria-label="First select" />
              <SelectContent>
                <SelectOption
                  v-for="opt in fruitOptions"
                  :key="'first-' + opt.id"
                  :id="'first-' + opt.id"
                  :value="opt.value"
                  :label="opt.label"
                />
              </SelectContent>
            </SelectRoot>

            <SelectRoot v-model="second" id="second-select">
              <SelectInput aria-label="Second select" />
              <SelectContent>
                <SelectOption
                  v-for="opt in fruitOptions"
                  :key="'second-' + opt.id"
                  :id="'second-' + opt.id"
                  :value="opt.value"
                  :label="opt.label"
                />
              </SelectContent>
            </SelectRoot>
          </div>
        `,
      }))

      const firstInput = wrapper.find('input[aria-label="First select"]')
      const secondInput = wrapper.find('input[aria-label="Second select"]')

      await firstInput.trigger('mousedown')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#first-select-listbox').exists()).toBe(true)
      expect(wrapper.find('#second-select-listbox').exists()).toBe(false)

      // One click on second input should switch open listbox ownership.
      await secondInput.trigger('mousedown')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('#first-select-listbox').exists()).toBe(false)
      expect(wrapper.find('#second-select-listbox').exists()).toBe(true)
    })
  })
})
