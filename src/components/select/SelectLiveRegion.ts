import { computed, defineComponent, h, ref, watch, type PropType } from 'vue'
import { useSelectContext } from './selectContext'
import { defaultSelectMessages, type SelectMessages } from './selectTypes'

export const SelectLiveRegion = defineComponent({
  name: 'SelectLiveRegion',
  props: {
    messages: {
      type: Object as PropType<Partial<SelectMessages>>,
      default: undefined,
    },
  },
  setup(props) {
    const ctx = useSelectContext<unknown>()
    const message = ref('')
    let previousValues: unknown[] = []
    let hasTrackedInitialValues = false

    const mergedMessages = computed<SelectMessages>(() => ({
      ...defaultSelectMessages,
      ...props.messages,
    }))

    const getItemLabel = (value: unknown) => {
      const item = ctx.orderedItems.value.find((candidate) =>
        Object.is(candidate.value, value),
      )
      if (item) return item.label

      const resolvedLabel = ctx.resolveLabel(value)
      return resolvedLabel ?? String(value)
    }

    watch(
      () => ctx.isOpen.value,
      (open) => {
        message.value = open
          ? mergedMessages.value.listExpanded()
          : mergedMessages.value.listCollapsed()
      },
    )

    watch(
      () => ctx.filteredItems.value.length,
      (count) => {
        message.value = mergedMessages.value.resultsCount(count)
      },
      { immediate: true },
    )

    watch(
      () => ctx.value.value,
      (newValue) => {
        if (!ctx.multiple || !Array.isArray(newValue)) {
          previousValues = []
          hasTrackedInitialValues = false
          return
        }

        if (!hasTrackedInitialValues) {
          previousValues = [...newValue]
          hasTrackedInitialValues = true
          return
        }

        const added = newValue.filter((value) =>
          !previousValues.some((prevValue) => Object.is(prevValue, value)),
        )
        const removed = previousValues.filter((value) =>
          !newValue.some((nextValue) => Object.is(nextValue, value)),
        )

        if (added.length === 1) {
          message.value = mergedMessages.value.itemAdded(getItemLabel(added[0]))
        } else if (removed.length === 1) {
          message.value = mergedMessages.value.itemRemoved(getItemLabel(removed[0]))
        }

        previousValues = [...newValue]
      },
      { immediate: true },
    )

    return () =>
      h(
        'div',
        {
          'aria-live': 'polite',
          'aria-atomic': 'true',
          style: {
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: 0,
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: 0,
          },
        },
        message.value,
      )
  },
})
