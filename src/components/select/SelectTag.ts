import { defineComponent, h, type Component, type PropType } from 'vue'
import { Primitive } from '../Primitive'

/**
 * Headless tag/chip primitive for selected multi-select items.
 * Emits `remove` with its `value` when the remove button is activated.
 */
export const SelectTag = defineComponent({
  name: 'SelectTag',
  inheritAttrs: false,
  props: {
    value: {
      type: null as unknown as PropType<unknown>,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'span',
    },
  },
  emits: {
    remove: (value: unknown) => {
      void value
      return true
    },
  },
  setup(props, { attrs, slots, emit }) {
    const onRemove = (event: Event) => {
      event.stopPropagation()
      if (!props.disabled) emit('remove', props.value)
    }

    return () => {
      const slotProps = {
        value: props.value,
        label: props.label,
        disabled: props.disabled,
        remove: onRemove,
      }

      const defaultContent = () => [
        h('span', { 'data-part': 'label' }, props.label),
        h(
          'button',
          {
            type: 'button',
            onClick: onRemove,
            disabled: props.disabled,
            'aria-label': `Remove ${props.label}`,
            'data-part': 'remove',
          },
          '\u00d7',
        ),
      ]

      return h(
        Primitive,
        {
          as: props.as,
          'data-part': 'tag',
          'data-disabled': props.disabled ? 'true' : undefined,
          ...attrs,
        },
        {
          default: () => slots.default?.(slotProps) ?? defaultContent(),
        },
      )
    }
  },
})
