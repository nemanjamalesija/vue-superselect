import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectTrigger } from './SelectTrigger'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'

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

  it('renders disabled state with aria-disabled and suppresses click', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectTrigger, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>(null)
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" disabled id="select">
          <SelectTrigger>Toggle</SelectTrigger>
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

    const trigger = wrapper.find('button')
    expect(trigger.attributes('aria-disabled')).toBe('true')
    expect(trigger.attributes('disabled')).toBeDefined()

    await trigger.trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[role="listbox"]').exists()).toBe(false)
  })

  it('renders aria-controls attribute pointing to listbox', () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectTrigger, SelectContent },
      setup() {
        const value = ref<string | null>(null)
        return { value }
      },
      template: `
        <SelectRoot v-model="value" id="select">
          <SelectTrigger>Toggle</SelectTrigger>
          <SelectContent />
        </SelectRoot>
      `,
    }))

    const trigger = wrapper.find('button')
    expect(trigger.attributes('aria-controls')).toBe('select-listbox')
  })

  it('toggles open on click and verifies state change', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectTrigger, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>(null)
        const open = ref(false)
        return { value, open }
      },
      template: `
        <SelectRoot v-model="value" v-model:open="open" id="select">
          <SelectTrigger>Toggle</SelectTrigger>
          <SelectContent>
            <SelectOption id="a" value="Apple" label="Apple" />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    expect(wrapper.vm.open).toBe(false)

    await wrapper.find('button').trigger('click')
    expect(wrapper.vm.open).toBe(true)

    expect(wrapper.find('[role="listbox"]').exists()).toBe(true)
  })
})
