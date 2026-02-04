import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectInput } from './SelectInput'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'

const options = [
  { id: 'a', value: 'Apple', label: 'Apple' },
  { id: 'b', value: 'Banana', label: 'Banana' },
]

describe('SelectContent', () => {
  it('applies listbox ARIA attributes when open', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>(null)
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" id="select">
          <SelectInput />
          <SelectContent>
            <SelectOption
              v-for="opt in options"
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
    await input.setValue('')

    const listbox = wrapper.find('ul')
    expect(listbox.attributes('role')).toBe('listbox')
    expect(listbox.attributes('id')).toBe('select-listbox')
  })
})
