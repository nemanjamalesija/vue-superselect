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
})
