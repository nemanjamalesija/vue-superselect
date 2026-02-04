import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import { SelectRoot } from './SelectRoot'
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
})
