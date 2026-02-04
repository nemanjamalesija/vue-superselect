import { defineComponent, h, type Component, type PropType } from 'vue'
import { Primitive } from '../Primitive'
import { useSelectContext } from './selectContext'

export const SelectControl = defineComponent({
  name: 'SelectControl',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const ctx = useSelectContext<unknown>()

    return () => {
      const controlProps = ctx.getRootProps(attrs)

      return h(
        Primitive,
        {
          as: props.as,
          ...controlProps,
        },
        slots.default?.(),
      )
    }
  },
})
