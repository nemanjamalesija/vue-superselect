import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { SelectTag } from './SelectTag'

describe('SelectTag', () => {
  it('renders label text and remove button with aria-label', () => {
    const wrapper = mount(SelectTag, {
      props: {
        value: 'apple',
        label: 'Apple',
      },
    })

    expect(wrapper.text()).toContain('Apple')

    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
    expect(button.attributes('aria-label')).toBe('Remove Apple')
    expect(button.attributes('type')).toBe('button')
  })

  it('emits remove with tag value when remove button is clicked', async () => {
    const wrapper = mount(SelectTag, {
      props: {
        value: 'apple',
        label: 'Apple',
      },
    })

    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted('remove')).toEqual([['apple']])
  })

  it('does not emit remove when disabled', async () => {
    const wrapper = mount(SelectTag, {
      props: {
        value: 'apple',
        label: 'Apple',
        disabled: true,
      },
    })

    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('remove')).toBeUndefined()
  })

  it('sets data-disabled attribute when disabled', () => {
    const wrapper = mount(SelectTag, {
      props: {
        value: 'apple',
        label: 'Apple',
        disabled: true,
      },
    })

    expect(wrapper.attributes('data-disabled')).toBe('true')
  })

  it('supports custom scoped slot content with remove handler', async () => {
    const onRemove = vi.fn()
    const wrapper = mount(defineComponent({
      components: { SelectTag },
      setup() {
        return { onRemove }
      },
      template: `
        <SelectTag value="apple" label="Apple" @remove="onRemove" v-slot="{ label, remove }">
          <button type="button" class="custom-remove" @click="remove">Delete {{ label }}</button>
        </SelectTag>
      `,
    }))

    expect(wrapper.find('button.custom-remove').text()).toBe('Delete Apple')
    expect(wrapper.find('[data-part="remove"]').exists()).toBe(false)

    await wrapper.find('button.custom-remove').trigger('click')
    expect(onRemove).toHaveBeenCalledWith('apple')
  })
})
