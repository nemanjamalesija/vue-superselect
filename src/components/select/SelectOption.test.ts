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

describe('SelectOption', () => {
  it('updates v-model value when clicked', async () => {
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
            >
              {{ opt.label }}
            </SelectOption>
          </SelectContent>
          <div data-value>{{ value }}</div>
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('a')

    const option = wrapper.find('li')
    await option.trigger('click')

    expect(wrapper.find('[data-value]').text()).toBe('Apple')
  })

  it('updates aria-activedescendant on ArrowDown', async () => {
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
    await input.trigger('keydown', { key: 'ArrowDown', preventDefault: () => {} })

    expect(input.attributes('aria-activedescendant')).toBe('select-option-a')
  })
})
