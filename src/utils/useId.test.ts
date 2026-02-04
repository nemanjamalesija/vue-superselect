import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { useId } from './useId'

describe('useId', () => {
  it('returns deterministic ID when provided', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const id = useId('my-custom-id')
          return { id }
        },
        template: '<div>{{ id }}</div>',
      }),
    )

    expect(wrapper.vm.id).toBe('my-custom-id')
  })

  it('generates a unique ID when no deterministic ID is provided', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const id1 = useId()
          const id2 = useId()
          return { id1, id2 }
        },
        template: '<div>{{ id1 }} {{ id2 }}</div>',
      }),
    )

    expect(wrapper.vm.id1).toBeTruthy()
    expect(wrapper.vm.id2).toBeTruthy()
    expect(wrapper.vm.id1).not.toBe(wrapper.vm.id2)
  })

  it('returns empty string when provided explicitly', () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const id = useId('')
          return { id }
        },
        template: '<div>{{ id }}</div>',
      }),
    )

    expect(wrapper.vm.id).toBe('')
  })
})
