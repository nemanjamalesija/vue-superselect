import {
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect,
  type Component,
  type PropType,
} from 'vue'
import { Primitive } from '../Primitive'
import { useId } from '../../utils/useId'
import { useSelectContext } from './selectContext'
import type { CollectionItem } from '../../composables/useCollection'

export const SelectOption = defineComponent({
  name: 'SelectOption',
  inheritAttrs: false,
  props: {
    value: {
      type: null as PropType<unknown>,
      required: true,
    },
    label: {
      type: String,
      default: undefined,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      default: undefined,
    },
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'li',
    },
  },
  setup(props, { attrs, slots }) {
    const ctx = useSelectContext<unknown>()
    const fallbackId = useId()
    const optionId = props.id ?? fallbackId
    const primitiveRef = ref<InstanceType<typeof Primitive> | null>(null)
    const elementRef = ref<HTMLElement | null>(null)

    watchEffect(() => {
      elementRef.value = (primitiveRef.value?.$el as HTMLElement | null) ?? null
    })

    const getItem = (): CollectionItem<unknown> => ({
      id: optionId,
      value: props.value,
      label: props.label ?? String(props.value),
      disabled: props.disabled,
      element: elementRef.value,
    })

    onMounted(() => {
      ctx.registerItem(getItem())
    })

    watch(
      [
        () => props.value,
        () => props.label,
        () => props.disabled,
        elementRef,
      ],
      () => {
        ctx.updateItem(optionId, getItem())
      },
    )

    onBeforeUnmount(() => {
      ctx.unregisterItem(optionId)
    })

    return () => {
      const optionProps = ctx.getOptionProps(getItem(), attrs)

      return h(
        Primitive,
        {
          as: props.as,
          ref: primitiveRef,
          ...optionProps,
        },
        slots.default?.({
          selected: optionProps['aria-selected'] === true,
          active: ctx.activeId.value === optionId,
          disabled: props.disabled,
          option: props.value,
        }) ?? props.label ?? String(props.value),
      )
    }
  },
})
