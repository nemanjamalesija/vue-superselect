import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectInput } from './SelectInput'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'
import { SelectLiveRegion } from './SelectLiveRegion'

const options = [
  { id: 'a', value: 'Apple', label: 'Apple' },
  { id: 'b', value: 'Banana', label: 'Banana' },
]

describe('SelectLiveRegion', () => {
  it('announces result count and open/close', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
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
          <SelectLiveRegion />
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('')

    const liveRegion = wrapper.find('[aria-live]')
    expect(liveRegion.text()).toContain('2 results')

    await input.setValue('ap')
    expect(liveRegion.text()).toContain('1 result')

    await input.setValue('')
    expect(liveRegion.text()).toContain('2 results')
  })

  it('announces added and removed items in multi-select mode', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
      setup() {
        const value = ref<string[]>([])
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" multiple id="select">
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
          <SelectLiveRegion />
          <div data-value>{{ JSON.stringify(value) }}</div>
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('')

    const optionA = wrapper.find('#select-option-a')
    const optionB = wrapper.find('#select-option-b')
    const liveRegion = wrapper.find('[aria-live]')

    await optionA.trigger('mousedown')
    await optionA.trigger('click')
    expect(liveRegion.text()).toContain('Added Apple')

    await optionB.trigger('mousedown')
    await optionB.trigger('click')
    expect(liveRegion.text()).toContain('Added Banana')

    await optionB.trigger('mousedown')
    await optionB.trigger('click')
    expect(liveRegion.text()).toContain('Removed Banana')
  })

  it('does not announce add/remove strings in single-select mode', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectInput, SelectContent, SelectOption, SelectLiveRegion },
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
          <SelectLiveRegion />
        </SelectRoot>
      `,
    }))

    const input = wrapper.find('input')
    await input.setValue('')

    const optionA = wrapper.find('#select-option-a')
    await optionA.trigger('mousedown')
    await optionA.trigger('click')

    const liveRegion = wrapper.find('[aria-live]')
    expect(liveRegion.text()).not.toContain('Added')
    expect(liveRegion.text()).not.toContain('Removed')
  })

  it('uses resolveLabel when announcing removals with unmounted options', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectLiveRegion },
      setup() {
        const value = ref<string[]>(['a'])
        const resolveLabel = (selectedValue: unknown) =>
          String(selectedValue) === 'a' ? 'Apple' : undefined

        return { value, resolveLabel }
      },
      template: `
        <SelectRoot
          v-model="value"
          multiple
          id="select"
          :resolveLabel="resolveLabel"
        >
          <SelectLiveRegion />
        </SelectRoot>
      `,
    }))

    const liveRegion = wrapper.find('[aria-live]')

    wrapper.vm.value = []
    await wrapper.vm.$nextTick()

    expect(liveRegion.text()).toContain('Removed Apple')
  })
})
