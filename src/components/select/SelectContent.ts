import {
  computed,
  defineComponent,
  h,
  ref,
  watch,
  toRef,
  Teleport,
  type Component,
  type PropType,
} from 'vue'
import { useFloating, type FloatingCollisionStrategy } from '../../composables/useFloating'
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

export const SelectContent = defineComponent({
  name: 'SelectContent',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'ul',
    },
    placement: {
      type: String,
      default: 'bottom-start',
    },
    collisionStrategy: {
      type: String as PropType<FloatingCollisionStrategy>,
      default: 'flip',
    },
    forceAbsolute: {
      type: Boolean,
      default: false,
    },
    teleport: {
      type: [Boolean, String] as PropType<boolean | string>,
      default: false,
    },
  },
  setup(props, { attrs, slots }) {
    const ctx = useSelectContext<unknown>()
    const floatingRef = ref<HTMLElement | null>(null)

    const keepActiveOptionVisible = () => {
      const listbox = floatingRef.value
      if (!listbox) return

      const activeOption = listbox.querySelector<HTMLElement>('[role="option"][data-highlighted="true"]')
      if (!activeOption) return

      const listboxRect = listbox.getBoundingClientRect()
      const optionRect = activeOption.getBoundingClientRect()

      if (optionRect.top < listboxRect.top) {
        listbox.scrollTop -= listboxRect.top - optionRect.top
        return
      }

      if (optionRect.bottom > listboxRect.bottom) {
        listbox.scrollTop += optionRect.bottom - listboxRect.bottom
      }
    }

    watch(
      () => [ctx.isOpen.value, ctx.activeId.value, ctx.visibleItems.value.length] as const,
      ([isOpen]) => {
        if (!isOpen) return
        keepActiveOptionVisible()
      },
      { flush: 'post' },
    )

    const { floatingStyles, side, align } = useFloating({
      reference: ctx.controlRef,
      floating: floatingRef,
      placement: toRef(props, 'placement'),
      enabled: computed(() => !props.forceAbsolute),
      collisionStrategy: toRef(props, 'collisionStrategy'),
    })

    if (__DEV__ && props.teleport !== false && props.forceAbsolute) {
      console.warn(
        '[SelectContent] Using teleport with forceAbsolute disables smart positioning. ' +
          'The dropdown will use CSS absolute positioning relative to <body>, which may not align with the trigger.',
      )
    }

    return () => {
      if (!ctx.isOpen.value || ctx.disabled.value) return null

      const listboxProps = ctx.getListboxProps(attrs)
      const children = slots.default ? { default: () => slots.default?.() } : undefined
      const content = h(Primitive, {
        as: props.as,
        ...listboxProps,
        ref: (target: unknown) => {
          floatingRef.value = resolveElementRef(target)
        },
        onMousedown: (e: Event) => {
          e.preventDefault()
        },
        style: [listboxProps.style as unknown, floatingStyles.value],
        'data-side': side.value,
        'data-align': align.value,
      }, children)

      if (props.teleport !== false) {
        const target = props.teleport === true ? 'body' : props.teleport

        return h(Teleport, { to: target }, [content])
      }

      return content
    }
  },
})
