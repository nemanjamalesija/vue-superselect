import { defineComponent, h, ref } from 'vue'
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectInput } from './SelectInput'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'
import { useSelectContext } from './selectContext'

const ContextProbe = defineComponent({
  name: 'ContextProbe',
  setup() {
    const ctx = useSelectContext<unknown>()
    return () =>
      h('div', {
        'data-open': ctx.isOpen.value ? '1' : '0',
        'data-query': ctx.query.value,
      })
  },
})

const options = [
  { id: 'a', value: 'Apple', label: 'Apple' },
  { id: 'b', value: 'Banana', label: 'Banana' },
]

describe('SelectInput', () => {
  it('updates query and opens list on input', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption, ContextProbe },
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
          <ContextProbe />
        </SelectRoot>
      `,
    }))

    expect(wrapper.find('ul').exists()).toBe(false)

    const input = wrapper.find('input')
    await input.setValue('ap')

    const probe = wrapper.find('[data-query]')
    expect(probe.attributes('data-query')).toBe('ap')
    expect(probe.attributes('data-open')).toBe('1')
    expect(wrapper.find('ul').exists()).toBe(true)
  })

  it('renders correct attributes (placeholder, aria-label)', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput },
      template: `
        <SelectRoot id="attr-test" placeholder="Type here...">
          <SelectInput aria-label="Fruit selector" />
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    expect(input.attributes('placeholder')).toBe('Type here...')
    expect(input.attributes('aria-label')).toBe('Fruit selector')
    expect(input.attributes('role')).toBe('combobox')
    expect(input.attributes('aria-expanded')).toBe('false')
    expect(input.attributes('aria-autocomplete')).toBe('list')
  })

  it('renders with as prop using a custom component', async () => {
    const CustomInput = defineComponent({
      name: 'CustomInput',
      inheritAttrs: true,
      setup(_, { attrs }) {
        return () => h('input', { ...attrs, class: 'custom-input' })
      },
    })

    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput: SelectInput },
      setup() {
        return { CustomInput }
      },
      template: `
        <SelectRoot id="custom-input-test">
          <SelectInput :as="CustomInput" aria-label="Custom" />
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('role')).toBe('combobox')
  })

  describe('missing aria-label warning', () => {
    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('warns when no aria-label or label is provided', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(defineComponent({
        components: { SelectRoot, SelectInput },
        template: `
          <SelectRoot id="no-label-test">
            <SelectInput />
          </SelectRoot>
        `,
      }))

      await flushPromises()

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Missing accessible label'),
      )
    })

    it('does not warn when aria-label is provided', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(defineComponent({
        components: { SelectRoot, SelectInput },
        template: `
          <SelectRoot id="with-label-test">
            <SelectInput aria-label="Select a fruit" />
          </SelectRoot>
        `,
      }))

      await flushPromises()

      const labelWarnings = warnSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('Missing accessible label'),
      )
      expect(labelWarnings).toHaveLength(0)
    })

    it('does not warn when aria-labelledby is provided', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      mount(defineComponent({
        components: { SelectRoot, SelectInput },
        template: `
          <SelectRoot id="with-labelledby-test">
            <SelectInput aria-labelledby="my-label" />
          </SelectRoot>
        `,
      }))

      await flushPromises()

      const labelWarnings = warnSpy.mock.calls.filter(
        (call) => typeof call[0] === 'string' && call[0].includes('Missing accessible label'),
      )
      expect(labelWarnings).toHaveLength(0)
    })
  })
})
