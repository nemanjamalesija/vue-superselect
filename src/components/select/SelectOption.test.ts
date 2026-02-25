import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
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

  it('auto-highlights first option and advances on ArrowDown', async () => {
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

    expect(input.attributes('aria-activedescendant')).toBe('select-option-a')

    await input.trigger('keydown', { key: 'ArrowDown', preventDefault: () => {} })

    expect(input.attributes('aria-activedescendant')).toBe('select-option-b')
  })

  it('adds data attributes for selected/highlighted/disabled', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>('Banana')
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
              :disabled="opt.id === 'a'"
            />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('')
    await input.trigger('keydown', { key: 'ArrowDown', preventDefault: () => {} })

    const optionA = wrapper.find('#select-option-a')
    const optionB = wrapper.find('#select-option-b')

    expect(optionA.attributes('data-disabled')).toBe('true')
    expect(optionA.attributes('data-selected')).toBe('false')
    expect(optionA.attributes('data-highlighted')).toBe('false')

    expect(optionB.attributes('data-selected')).toBe('true')
    expect(optionB.attributes('data-highlighted')).toBe('true')
  })

  it('closes the list on Escape with controlled open state', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>(null)
        const open = ref(false)
        return { value, open, options }
      },
      template: `
        <SelectRoot v-model="value" v-model:open="open" id="select">
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
          <div data-open>{{ open }}</div>
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    // Type to open the list
    await input.setValue('a')
    expect(wrapper.find('[data-open]').text()).toBe('true')

    // Press Escape
    await input.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[data-open]').text()).toBe('false')
  })

  it('keeps input focus after mouse selection in multi-select mode', async () => {
    const wrapper = mount(
      defineComponent({
        components: { SelectRoot, SelectInput, SelectContent, SelectOption },
        setup() {
          const value = ref<string[]>([])
          const open = ref(false)
          return { value, open, options }
        },
        template: `
          <SelectRoot v-model="value" v-model:open="open" multiple id="select">
            <SelectInput />
            <SelectContent>
              <SelectOption
                v-for="opt in options"
                :key="opt.id"
                :id="opt.id"
                :value="opt.value"
                :label="opt.label"
                as="button"
              />
            </SelectContent>
            <div data-open>{{ open }}</div>
          </SelectRoot>
        `,
      }),
      { attachTo: document.body },
    )

    const input = wrapper.find('input')
    await input.setValue('')
    ;(input.element as HTMLInputElement).focus()
    expect(document.activeElement).toBe(input.element)

    const option = wrapper.find('button[role="option"]')
    await option.trigger('mousedown')
    await option.trigger('click')

    expect(document.activeElement).toBe(input.element)

    await input.trigger('keydown', { key: 'Escape' })
    expect(wrapper.find('[data-open]').text()).toBe('false')

    wrapper.unmount()
  })

  it('unregisters option on unmount', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>(null)
        const showCherry = ref(true)
        return { value, options, showCherry }
      },
      template: `
        <SelectRoot v-model="value" :defaultOpen="true" id="select">
          <SelectInput />
          <SelectContent>
            <SelectOption
              v-for="opt in options"
              :key="opt.id"
              :id="opt.id"
              :value="opt.value"
              :label="opt.label"
            />
            <SelectOption v-if="showCherry" id="c" value="Cherry" label="Cherry" />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[role="option"]')).toHaveLength(3)

    wrapper.vm.showCherry = false
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[role="option"]')).toHaveLength(2)
    expect(wrapper.find('#select-option-c').exists()).toBe(false)
  })

  it('reacts to prop changes (value, label, disabled) via updateItem', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>(null)
        const optLabel = ref('Apple')
        const optDisabled = ref(false)
        return { value, optLabel, optDisabled }
      },
      template: `
        <SelectRoot v-model="value" :defaultOpen="true" id="select">
          <SelectInput />
          <SelectContent>
            <SelectOption id="a" value="Apple" :label="optLabel" :disabled="optDisabled" />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const option = wrapper.find('#select-option-a')
    expect(option.text()).toContain('Apple')
    expect(option.attributes('aria-disabled')).not.toBe('true')

    wrapper.vm.optLabel = 'Green Apple'
    wrapper.vm.optDisabled = true
    await wrapper.vm.$nextTick()

    const updatedOption = wrapper.find('#select-option-a')
    expect(updatedOption.text()).toContain('Green Apple')
    expect(updatedOption.attributes('aria-disabled')).toBe('true')
  })

  it('falls back to String(props.value) when label and slot are missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<number | null>(null)
        return { value }
      },
      template: `
        <SelectRoot v-model="value" :defaultOpen="true" id="select">
          <SelectInput />
          <SelectContent>
            <SelectOption id="a" :value="42" />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    const option = wrapper.find('#select-option-a')
    expect(option.text()).toContain('42')

    warnSpy.mockRestore()
  })

  it('warns in dev mode when label and slot are missing', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>(null)
        return { value }
      },
      template: `
        <SelectRoot v-model="value" id="select">
          <SelectInput />
          <SelectContent>
            <SelectOption id="a" :value="'Apple'" />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('')

    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
