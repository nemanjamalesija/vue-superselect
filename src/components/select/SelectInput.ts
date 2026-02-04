import { defineComponent, h, type Component, type PropType } from 'vue'
import { Primitive } from '../Primitive'
import { useSelectContext } from './selectContext'

export const SelectInput = defineComponent({
  name: 'SelectInput',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'input',
    },
  },
  setup(props, { attrs }) {
    const ctx = useSelectContext<unknown>()

    return () => {
      const inputProps = ctx.getInputProps({ type: 'text', ...attrs })

      return h(Primitive, {
        as: props.as,
        ...inputProps,
      })
    }
  },
})
