import { defineComponent, h, type Component, type PropType } from 'vue'

export interface PrimitiveProps {
  as?: string | Component
}

export const Primitive = defineComponent({
  name: 'Primitive',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'div',
    },
  },
  setup(props, { slots, attrs }) {
    return () => h(props.as, attrs, slots.default?.())
  },
})
