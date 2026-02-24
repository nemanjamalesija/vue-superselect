import { defineComponent, h, type Component, type PropType } from 'vue'
import { Primitive } from '../Primitive'
import { useSelectContext } from './selectContext'

interface PrimitiveRefTarget {
  $el?: unknown
}

const resolveElementRef = (target: unknown): HTMLElement | null => {
  if (target instanceof HTMLElement) return target
  if (!target || typeof target !== 'object') return null

  const maybeElement = (target as PrimitiveRefTarget).$el
  return maybeElement instanceof HTMLElement ? maybeElement : null
}

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
        ref: (target: unknown) => {
          ctx.inputRef.value = resolveElementRef(target)
        },
      })
    }
  },
})
