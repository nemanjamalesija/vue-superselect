import { defineComponent, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SelectRoot } from './SelectRoot'
import { SelectControl } from './SelectControl'
import { SelectInput } from './SelectInput'
import { SelectContent } from './SelectContent'
import { SelectOption } from './SelectOption'

const options = [
  { id: 'a', value: 'a', label: 'Apple' },
  { id: 'b', value: 'b', label: 'Banana' },
]

describe('SelectControl', () => {
  it('exposes selectedItems and removeItem in scoped slot', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string[]>(['a', 'b'])
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" multiple :defaultOpen="true" id="select">
          <SelectControl v-slot="{ selectedItems, removeItem, multiple }">
            <div data-multiple>{{ multiple }}</div>
            <div data-items>{{ selectedItems.map(item => item.label).join(',') }}</div>
            <button type="button" data-remove @click="removeItem('a')">Remove A</button>
            <SelectInput />
          </SelectControl>
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

    expect(wrapper.find('[data-multiple]').text()).toBe('true')
    expect(wrapper.find('[data-items]').text()).toBe('Apple,Banana')

    await wrapper.find('[data-remove]').trigger('click')
    expect(wrapper.vm.value).toEqual(['b'])
  })

  it('keeps selected labels after options unmount on close', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string[]>(['a', 'b'])
        const open = ref(true)
        return { value, open, options }
      },
      template: `
        <SelectRoot v-model="value" v-model:open="open" multiple id="select">
          <SelectControl v-slot="{ selectedItems }">
            <div data-items>{{ selectedItems.map(item => item.label).join(',') }}</div>
            <SelectInput />
          </SelectControl>
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

    expect(wrapper.find('[data-items]').text()).toBe('Apple,Banana')

    wrapper.vm.open = false
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-items]').text()).toBe('Apple,Banana')
  })

  it('resolveSelectedLabel falls back to String when value has no match', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectControl, SelectInput },
      setup() {
        const value = ref<string[]>(['unknown-val'])
        return { value }
      },
      template: `
        <SelectRoot v-model="value" multiple id="select">
          <SelectControl v-slot="{ selectedItems }">
            <div data-items>{{ selectedItems.map(item => item.label).join(',') }}</div>
            <SelectInput />
          </SelectControl>
        </SelectRoot>
      `,
    }))

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-items]').text()).toBe('unknown-val')
  })

  it('cacheLabel updates existing entry when label changes', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string[]>(['a'])
        const open = ref(true)
        const labelA = ref('Apple')
        return { value, open, labelA, options }
      },
      template: `
        <SelectRoot v-model="value" v-model:open="open" multiple id="select">
          <SelectControl v-slot="{ selectedItems }">
            <div data-items>{{ selectedItems.map(item => item.label).join(',') }}</div>
            <SelectInput />
          </SelectControl>
          <SelectContent>
            <SelectOption id="a" value="a" :label="labelA" />
            <SelectOption id="b" value="b" label="Banana" />
          </SelectContent>
        </SelectRoot>
      `,
    }))

    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-items]').text()).toBe('Apple')

    wrapper.vm.labelA = 'Green Apple'
    await wrapper.vm.$nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-items]').text()).toBe('Green Apple')
  })

  it('removeItem is a no-op in single-select mode', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string | null>('a')
        return { value, options }
      },
      template: `
        <SelectRoot v-model="value" id="select">
          <SelectControl v-slot="{ removeItem }">
            <button type="button" data-remove @click="removeItem('a')">Remove A</button>
            <SelectInput />
          </SelectControl>
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

    await wrapper.find('[data-remove]').trigger('click')
    // In single-select mode, removeItem should be a no-op
    expect(wrapper.vm.value).toBe('a')
  })

  it('uses resolveLabel for preselected values before content mounts', async () => {
    const wrapper = mount(defineComponent({
      components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
      setup() {
        const value = ref<string[]>(['a', 'b'])
        const optionsByValue = {
          a: 'Apple',
          b: 'Banana',
        } as const
        const resolveLabel = (selectedValue: unknown) => {
          const valueKey = String(selectedValue) as keyof typeof optionsByValue
          return optionsByValue[valueKey]
        }

        return { value, resolveLabel, options }
      },
      template: `
        <SelectRoot v-model="value" multiple id="select" :resolveLabel="resolveLabel">
          <SelectControl v-slot="{ selectedItems }">
            <div data-items>{{ selectedItems.map(item => item.label).join(',') }}</div>
            <SelectInput />
          </SelectControl>
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
    expect(wrapper.find('[data-items]').text()).toBe('Apple,Banana')
  })
})
