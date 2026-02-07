import { defineComponent, toRef, type PropType } from 'vue'
import { useSelect } from '../../composables/useSelect'
import type { FilterFn } from '../../composables/useFilter'
import { provideSelectContext } from './selectContext'

export const SelectRoot = defineComponent({
  name: 'SelectRoot',
  props: {
    // `modelValue` must remain optional with no default so omitted prop stays `undefined`.
    // This preserves uncontrolled behavior and correct v-model typing in templates.
    // eslint-disable-next-line vue/require-default-prop
    modelValue: {
      type: null as unknown as PropType<unknown | null>,
      required: false,
    },
    defaultValue: {
      type: null as unknown as PropType<unknown | null>,
      default: null,
    },
    open: {
      type: Boolean as PropType<boolean | undefined>,
      default: undefined,
    },
    defaultOpen: {
      type: Boolean,
      default: false,
    },
    filter: {
      type: Function as PropType<FilterFn<unknown>>,
      default: undefined,
    },
    debounce: {
      type: Number,
      default: undefined,
    },
    loop: {
      type: Boolean,
      default: true,
    },
    id: {
      type: String,
      default: undefined,
    },
  },
  emits: {
    'update:modelValue': (value: unknown | null) => {
      void value
      return true
    },
    'update:open': (open: boolean) => {
      void open
      return true
    },
  },
  setup(props, { emit, slots, expose }) {
    const api = useSelect({
      id: props.id,
      value: toRef(props, 'modelValue'),
      defaultValue: props.defaultValue,
      onValueChange: (value) => emit('update:modelValue', value),
      open: toRef(props, 'open'),
      defaultOpen: props.defaultOpen,
      onOpenChange: (open) => emit('update:open', open),
      filter: props.filter,
      debounce: props.debounce,
      loop: props.loop,
    })

    provideSelectContext(api)
    expose({ open: api.open, close: api.close, toggle: api.toggle })

    return () => slots.default?.()
  },
})
