import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectTrigger } from './SelectTrigger'
import { SelectContent } from './SelectContent'

const options = [
  { id: 'a', value: 'Apple', label: 'Apple' },
  { id: 'b', value: 'Banana', label: 'Banana' },
]

describe('SelectTrigger', () => {
  it('toggles open state and updates aria-expanded', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectTrigger, SelectContent },
      setup() {
        const value = ref<string | null>(null)
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" id="select">
          <SelectTrigger>Toggle</SelectTrigger>
          <SelectContent>
            <li v-for="opt in options" :key="opt.id">{{ opt.label }}</li>
          </SelectContent>
        </SelectRoot>
      `,
    }))

    const trigger = wrapper.find('button')
    expect(trigger.attributes('aria-expanded')).toBe('false')

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('true')

    await trigger.trigger('click')
    expect(trigger.attributes('aria-expanded')).toBe('false')
  })
})
