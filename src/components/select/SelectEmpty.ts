import { defineComponent, h, type Component, type PropType } from 'vue'
import { Primitive } from '../Primitive'
import { useSelectContext } from './selectContext'

export const SelectEmpty = defineComponent({
  name: 'SelectEmpty',
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
      if (ctx.filteredItems.value.length > 0) return null

      return h(
        Primitive,
        {
          as: props.as,
          ...attrs,
        },
        slots.default?.() ?? 'No results',
      )
    }
  },
})
