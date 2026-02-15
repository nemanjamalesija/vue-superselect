import { defineComponent, h, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'
import { SelectInput } from './SelectInput'
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

describe('SelectRoot', () => {
  it('provides context to children', () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, ContextProbe },
      template: '<SelectRoot><ContextProbe /></SelectRoot>',
    }))

    const probe = wrapper.find('[data-open]')
    expect(probe.exists()).toBe(true)
    expect(probe.attributes('data-open')).toBe('0')
  })

  it('exposes programmatic control', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, ContextProbe },
      setup() {
        const selectRef = ref<null | { open: () => void; close: () => void; toggle: () => void }>(
          null,
        )
        return { selectRef }
      },
      template: '<SelectRoot ref="selectRef"><ContextProbe /></SelectRoot>',
    }))

    const instance = wrapper.vm.selectRef as {
      open: () => void
      close: () => void
      toggle: () => void
    }

    const probe = wrapper.find('[data-open]')
    expect(probe.attributes('data-open')).toBe('0')
    instance.open()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-open]').attributes('data-open')).toBe('1')
    instance.toggle()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-open]').attributes('data-open')).toBe('0')
    instance.close()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-open]').attributes('data-open')).toBe('0')
  })

  it('emits array values with v-model in multi-select mode', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectContent, SelectOption },
      setup() {
        const value = ref<string[]>([])
        const options = [
          { id: 'a', value: 'Apple', label: 'Apple' },
          { id: 'b', value: 'Banana', label: 'Banana' },
        ]
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" multiple :defaultOpen="true" id="multi-select">
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

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const options = wrapper.findAll('[role="option"]')
    expect(options).toHaveLength(2)

    await options[0].trigger('click')
    expect(wrapper.vm.value).toEqual(['Apple'])

    await options[1].trigger('click')
    expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])
  })

  it('sets aria-multiselectable on listbox when multiple is true', () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectContent, SelectOption },
      template: `
        <SelectRoot multiple :defaultOpen="true" id="multi-select">
          <SelectContent>
            <SelectOption id="a" value="Apple" label="Apple" />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.attributes('aria-multiselectable')).toBe('true')
  })

  it('warns in dev when multiple is true and modelValue is not an array', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mount(SelectRoot, {
      props: {
        multiple: true,
        modelValue: 'not-an-array',
      },
    })

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('v-model must be an array'),
    )

    warnSpy.mockRestore()
  })

  describe('Backspace removal', () => {
    it('removes the last selected value on Backspace when query is empty', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput },
        setup() {
          const value = ref(['Apple', 'Banana', 'Cherry'])
          return { value }
        },
        template: `
          <SelectRoot v-model="value" multiple id="multi-select">
            <SelectInput />
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      await input.trigger('keydown', { key: 'Backspace' })

      expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])
    })

    it('does not remove selected values on Backspace when query has text', async () => {
      const wrapper = mount(defineComponent({
        components: { SelectRoot, SelectInput },
        setup() {
          const value = ref(['Apple', 'Banana'])
          return { value }
        },
        template: `
          <SelectRoot v-model="value" multiple id="multi-select">
            <SelectInput />
          </SelectRoot>
        `,
      }))

      const input = wrapper.find('input')
      await input.setValue('ba')
      await input.trigger('keydown', { key: 'Backspace' })

      expect(wrapper.vm.value).toEqual(['Apple', 'Banana'])
    })
  })
})
