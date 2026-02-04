import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, markRaw } from 'vue'
import { Primitive } from './Primitive'

describe('Primitive', () => {
  it('renders as div by default', () => {
    const wrapper = mount(Primitive)
    expect(wrapper.element.tagName).toBe('DIV')
  })

  it('renders as the specified element', () => {
    const wrapper = mount(Primitive, {
      props: { as: 'button' },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')
  })

  it('forwards attributes to the rendered element', () => {
    const wrapper = mount(Primitive, {
      attrs: {
        id: 'test-id',
        class: 'test-class',
        'data-test': 'ok',
      },
    })

    expect(wrapper.attributes('id')).toBe('test-id')
    expect(wrapper.classes()).toContain('test-class')
    expect(wrapper.attributes('data-test')).toBe('ok')
  })

  it('forwards event listeners', async () => {
    const onClick = vi.fn()

    const wrapper = mount(Primitive, {
      attrs: {
        onClick,
      },
    })

    await wrapper.trigger('click')
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders slot content', () => {
    const wrapper = mount(Primitive, {
      slots: {
        default: 'Hello',
      },
    })

    expect(wrapper.text()).toBe('Hello')
  })

  it('renders as a Vue component when `as` is a component', () => {
    const Custom = markRaw(
      defineComponent({
      props: {
        label: {
          type: String,
          required: true,
        },
      },
      setup(props) {
        return () => h('span', { 'data-custom': 'true' }, props.label)
      },
      }),
    )

    const wrapper = mount(Primitive, {
      props: {
        as: Custom,
        label: 'Custom',
      },
    })

    expect(wrapper.find('[data-custom="true"]').text()).toBe('Custom')
  })
})
