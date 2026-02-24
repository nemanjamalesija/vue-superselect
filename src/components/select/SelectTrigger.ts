import { defineComponent, h, type Component, type PropType } from 'vue'
import { Primitive } from '../Primitive'
import { useSelectContext } from './selectContext'
import { mergeProps } from '../../utils/mergeProps'

export const SelectTrigger = defineComponent({
  name: 'SelectTrigger',
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
      const isDisabled = ctx.disabled.value
      const triggerProps = mergeProps(
        {
          type: 'button',
          'aria-expanded': ctx.isOpen.value,
          'aria-controls': ctx.getListboxProps().id,
          disabled: isDisabled || undefined,
          'aria-disabled': isDisabled || undefined,
          onClick: isDisabled ? undefined : () => ctx.toggle(),
        },
        attrs,
      )

      const children = slots.default ? { default: () => slots.default?.() } : undefined

      return h(
        Primitive,
        {
          as: props.as,
          ...triggerProps,
        },
        children,
      )
    }
  },
})
