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
      type: null as unknown as PropType<unknown | unknown[] | null>,
      required: false,
    },
    defaultValue: {
      type: null as unknown as PropType<unknown | unknown[] | null>,
      default: null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    max: {
      type: Number as PropType<number | undefined>,
      default: undefined,
    },
    hideSelected: {
      type: Boolean,
      default: false,
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
    /**
     * Optional label resolver used when selected values are known but options
     * are not currently mounted (e.g. closed content with preselected IDs).
     */
    resolveLabel: {
      type: Function as PropType<(value: unknown) => string | undefined>,
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
    /** Root-level data source for option items */
    items: {
      type: Array as PropType<unknown[]>,
      default: undefined,
    },
    /** Which field on each item to use as the display label */
    labelKey: {
      type: String,
      default: undefined,
    },
    /** Which field on each item to use as the v-model value */
    valueKey: {
      type: String,
      default: undefined,
    },
    /** Disables all interaction: input, trigger, clear, and option clicks */
    disabled: {
      type: Boolean,
      default: false,
    },
    /** Placeholder text displayed on the input when empty */
    placeholder: {
      type: String as PropType<string | undefined>,
      default: undefined,
    },
    /** When true, Tab key selects the highlighted option before closing */
    selectOnTab: {
      type: Boolean,
      default: false,
    },
  },
  emits: {
    'update:modelValue': (value: unknown | unknown[] | null) => {
      void value
      return true
    },
    'update:open': (open: boolean) => {
      void open
      return true
    },
  },
  setup(props, { emit, slots, expose }) {
    if (
      __DEV__ &&
      props.multiple &&
      props.modelValue !== undefined &&
      props.modelValue !== null &&
      !Array.isArray(props.modelValue)
    ) {
      console.warn('[SelectRoot] When `multiple` is true, v-model must be an array')
    }

    if (__DEV__ && !props.multiple && props.max !== undefined) {
      console.warn('[SelectRoot] `max` has no effect when `multiple` is false')
    }

    if (__DEV__ && !props.multiple && props.hideSelected) {
      console.warn('[SelectRoot] `hideSelected` has no effect when `multiple` is false')
    }

    if (__DEV__ && props.valueKey && props.items && props.items.length > 0) {
      const firstItem = props.items[0]
      if (typeof firstItem === 'object' && firstItem !== null && !(props.valueKey in firstItem)) {
        console.warn(
          `[SelectRoot] \`value-key="${props.valueKey}"\` does not exist on the provided items. ` +
          `Available keys: ${Object.keys(firstItem).join(', ')}. ` +
          `Check that value-key matches a field on your option objects.`,
        )
      }
    }

    if (__DEV__ && props.disabled && props.open === true) {
      console.warn('[SelectRoot] Cannot force open a disabled component')
    }

    if (__DEV__ && props.labelKey && props.items && props.items.length > 0) {
      const firstItem = props.items[0]
      if (typeof firstItem === 'object' && firstItem !== null && !(props.labelKey in firstItem)) {
        console.warn(
          `[SelectRoot] \`label-key="${props.labelKey}"\` does not exist on the provided items. ` +
          `Available keys: ${Object.keys(firstItem).join(', ')}. ` +
          `Check that label-key matches a field on your option objects.`,
        )
      }
    }

    const api = useSelect({
      id: props.id,
      value: toRef(props, 'modelValue'),
      defaultValue: props.defaultValue,
      onValueChange: (value) => emit('update:modelValue', value),
      multiple: props.multiple,
      max: toRef(props, 'max'),
      hideSelected: toRef(props, 'hideSelected'),
      disabled: toRef(props, 'disabled'),
      selectOnTab: props.selectOnTab,
      placeholder: toRef(props, 'placeholder'),
      open: toRef(props, 'open'),
      defaultOpen: props.defaultOpen,
      onOpenChange: (open) => emit('update:open', open),
      filter: props.filter,
      debounce: props.debounce,
      resolveLabel: props.resolveLabel,
      loop: props.loop,
      items: toRef(props, 'items'),
      labelKey: props.labelKey as keyof unknown | undefined,
      valueKey: props.valueKey as keyof unknown | undefined,
    })

    provideSelectContext(api)
    expose({ open: api.open, close: api.close, toggle: api.toggle, clear: api.clear, focus: api.focus })

    return () => slots.default?.()
  },
})
