import { defineComponent, h, nextTick, onMounted, ref, type Component, type PropType } from 'vue'
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
    const inputEl = ref<HTMLElement | null>(null)

    onMounted(() => {
      if (!__DEV__) return
      nextTick(() => {
        const el = inputEl.value
        if (!el) return
        const hasAriaLabel = el.hasAttribute('aria-label')
        const hasAriaLabelledBy = el.hasAttribute('aria-labelledby')
        const hasAssociatedLabel = el.id && document.querySelector(`label[for="${el.id}"]`)
        if (!hasAriaLabel && !hasAriaLabelledBy && !hasAssociatedLabel) {
          console.warn(
            '[SelectRoot] Missing accessible label. Provide an `aria-label` prop on SelectInput, ' +
            'use `aria-labelledby` to reference a visible label, or add a `<label>` element with a matching `for` attribute. ' +
            'Screen readers require a label to identify this combobox.',
          )
        }
      })
    })

    return () => {
      const inputProps = ctx.getInputProps({ type: 'text', ...attrs })

      return h(Primitive, {
        as: props.as,
        ...inputProps,
        ref: (target: unknown) => {
          const resolved = resolveElementRef(target)
          inputEl.value = resolved
          ctx.inputRef.value = resolved
        },
      })
    }
  },
})
