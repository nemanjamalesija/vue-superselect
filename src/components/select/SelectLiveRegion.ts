import { defineComponent, h, ref, watch } from 'vue'
import { useSelectContext } from './selectContext'

export const SelectLiveRegion = defineComponent({
  name: 'SelectLiveRegion',
  setup() {
    const ctx = useSelectContext<unknown>()
    const message = ref('')

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
