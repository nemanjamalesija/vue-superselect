import { computed, defineComponent, h, ref, watch, type Component, type PropType } from 'vue'
import { Primitive } from '../Primitive'
import { useSelectContext } from './selectContext'

interface SelectedItemSlotData {
  value: unknown
  label: string
}

interface LabelCacheEntry {
  value: unknown
  label: string
}

interface PrimitiveRefTarget {
  $el?: unknown
}

const resolveElementRef = (target: unknown): HTMLElement | null => {
  if (target instanceof HTMLElement) return target
  if (!target || typeof target !== 'object') return null

  const maybeElement = (target as PrimitiveRefTarget).$el
  return maybeElement instanceof HTMLElement ? maybeElement : null
}

export const SelectControl = defineComponent({
  name: 'SelectControl',
  inheritAttrs: false,
  props: {
    as: {
      type: [String, Object] as PropType<string | Component>,
      default: 'div',
    },
  },
  setup(props, { attrs, slots }) {
    const ctx = useSelectContext<unknown>()
    const labelCache = ref<LabelCacheEntry[]>([])

    const cacheLabel = (value: unknown, label: string) => {
      const index = labelCache.value.findIndex((entry) => Object.is(entry.value, value))

      if (index === -1) {
        labelCache.value = [...labelCache.value, { value, label }]
        return
      }

      const current = labelCache.value[index]
      if (!current || current.label === label) return

      const next = [...labelCache.value]
      next[index] = { value, label }
      labelCache.value = next
    }

    watch(
      ctx.orderedItems,
      (items) => {
        items.forEach((item) => {
          cacheLabel(item.value, item.label)
        })
      },
      { immediate: true },
    )

    const resolveSelectedLabel = (selectedValue: unknown) => {
      const currentItem = ctx.orderedItems.value.find((candidate) =>
        Object.is(candidate.value, selectedValue),
      )

      if (currentItem) return currentItem.label

      const cachedItem = labelCache.value.find((entry) =>
        Object.is(entry.value, selectedValue),
      )

      if (cachedItem) return cachedItem.label

      const resolvedLabel = ctx.resolveLabel(selectedValue)
      return resolvedLabel ?? String(selectedValue)
    }

    const selectedItems = computed<SelectedItemSlotData[]>(() => {
      if (!ctx.multiple || !Array.isArray(ctx.value.value)) return []

      return ctx.value.value.map((selectedValue) => ({
        value: selectedValue,
        label: resolveSelectedLabel(selectedValue),
      }))
    })

    const removeItem = (value: unknown) => {
      if (!ctx.multiple || !Array.isArray(ctx.value.value)) return
      ctx.value.value = ctx.value.value.filter((itemValue) => !Object.is(itemValue, value))
    }

    return () => {
      const controlProps = ctx.getRootProps(attrs)
      const slotProps = {
        selectedItems: selectedItems.value,
        removeItem,
        multiple: ctx.multiple,
      }
      const children = slots.default
        ? { default: () => slots.default?.(slotProps) }
        : undefined

      return h(
        Primitive,
        {
          as: props.as,
          ref: (target: unknown) => {
            ctx.controlRef.value = resolveElementRef(target)
          },
          ...controlProps,
        },
        children,
      )
    }
  },
})
