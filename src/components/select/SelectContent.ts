import { defineComponent, h, type Component, type PropType } from 'vue'
import { Primitive } from '../Primitive'
import { useSelectContext } from './selectContext'

export const SelectContent = defineComponent({
  name: 'SelectContent',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'ul',
    },
  },
  setup(props, { attrs, slots }) {
    const ctx = useSelectContext<unknown>()

    return () => {
      if (!ctx.isOpen.value) return null

      const listboxProps = ctx.getListboxProps(attrs)
      const children = slots.default ? { default: () => slots.default?.() } : undefined

      return h(Primitive, {
        as: props.as,
        ...listboxProps,
      }, children)
    }
  },
})
