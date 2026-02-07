import { defineComponent, h, ref, watch } from 'vue'
import { useSelectContext } from './selectContext'

export const SelectLiveRegion = defineComponent({
  name: 'SelectLiveRegion',
  setup() {
    const ctx = useSelectContext<unknown>()
    const message = ref('')
    let previousValues: unknown[] = []
    let hasTrackedInitialValues = false

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
        message.value = open ? 'List expanded' : 'List collapsed'
      },
    )

    watch(
      () => ctx.filteredItems.value.length,
      (count) => {
        message.value = `${count} result${count === 1 ? '' : 's'}`
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
          message.value = `Added ${getItemLabel(added[0])}`
        } else if (removed.length === 1) {
          message.value = `Removed ${getItemLabel(removed[0])}`
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
