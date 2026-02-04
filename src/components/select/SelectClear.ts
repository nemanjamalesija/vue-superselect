import { defineComponent, h, type Component, type PropType } from 'vue'
import { Primitive } from '../Primitive'
import { useSelectContext } from './selectContext'
import { mergeProps } from '../../utils/mergeProps'

export const SelectClear = defineComponent({
  name: 'SelectClear',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'button',
    },
  },
  setup(props, { attrs, slots }) {
    const ctx = useSelectContext<unknown>()

    return () => {
      const clearProps = mergeProps(
        {
          type: 'button',
          onClick: () => {
            ctx.value.value = null
            ctx.query.value = ''
          },
        },
        attrs,
      )

      const children = slots.default ? { default: () => slots.default?.() } : undefined

      return h(
        Primitive,
        {
          as: props.as,
          ...clearProps,
        },
        children,
      )
    }
  },
})
