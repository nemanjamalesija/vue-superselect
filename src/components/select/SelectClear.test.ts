import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectInput } from './SelectInput'
import { SelectClear } from './SelectClear'

const options = [
  { id: 'a', value: 'Apple', label: 'Apple' },
  { id: 'b', value: 'Banana', label: 'Banana' },
]

describe('SelectClear', () => {
  it('clears value and query', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectClear },
      setup() {
        const value = ref<string | null>('Apple')
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" id="select">
          <SelectInput />
          <SelectClear>Clear</SelectClear>
          <div data-value>{{ value }}</div>
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('ap')

    const clear = wrapper.find('button')
    await clear.trigger('click')

    expect(wrapper.find('[data-value]').text()).toBe('')
    expect((input.element as HTMLInputElement).value).toBe('')
  })

  it('clears all selections to empty array in multi-select mode', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectClear },
      setup() {
        const value = ref<string[]>(['Apple', 'Banana'])
        return { value }
      },
      template: `
        <SelectRoot v-model="value" multiple id="select">
          <SelectInput />
          <SelectClear>Clear</SelectClear>
          <div data-value>{{ JSON.stringify(value) }}</div>
        </SelectRoot>
      `,
    }))

    const clear = wrapper.find('button')
    await clear.trigger('click')

    expect(wrapper.find('[data-value]').text()).toBe('[]')
  })

  it('disabled state prevents clear on click', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectClear },
      setup() {
        const value = ref<string | null>('Apple')
        return { value }
      },
      template: `
        <SelectRoot v-model="value" disabled id="select">
          <SelectInput />
          <SelectClear>Clear</SelectClear>
          <div data-value>{{ value }}</div>
        </SelectRoot>
      `,
    }))

    const clear = wrapper.find('button')
    expect(clear.attributes('disabled')).toBeDefined()
    await clear.trigger('click')

    // Value should not change because root is disabled
    expect(wrapper.find('[data-value]').text()).toBe('Apple')
  })

  it('renders with custom as prop', () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectClear },
      setup() {
        const value = ref<string | null>(null)
        return { value }
      },
      template: `
        <SelectRoot v-model="value" id="select">
          <SelectInput />
          <SelectClear as="span">Clear</SelectClear>
        </SelectRoot>
      `,
    }))

    const clearEl = wrapper.find('span')
    expect(clearEl.exists()).toBe(true)
    expect(clearEl.text()).toContain('Clear')
  })

  it('clears value when valueKey is set', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectClear },
      setup() {
        const value = ref<string | null>('a')
        const items = [
          { id: 'a', name: 'Apple' },
          { id: 'b', name: 'Banana' },
        ]
        return { value, items }
      },
      template: `
        <SelectRoot v-model="value" :items="items" label-key="name" value-key="id" id="select">
          <SelectInput />
          <SelectClear>Clear</SelectClear>
          <div data-value>{{ value }}</div>
        </SelectRoot>
      `,
    }))

    const clear = wrapper.find('button')
    await clear.trigger('click')

    expect(wrapper.find('[data-value]').text()).toBe('')
  })
})
