import { type Ref, computed, ref, watch } from 'vue'

export interface UseControllableOptions<T> {
  prop: Ref<T | undefined>
  defaultValue?: T
  onChange?: (value: T) => void
}

export function useControllable<T>(options: UseControllableOptions<T>): Ref<T> {
  const { prop, defaultValue, onChange } = options
  const internalValue = ref(defaultValue) as Ref<T>

  const isControlled = computed(() => prop.value !== undefined)
  let wasControlled = isControlled.value

  if (__DEV__) {
    watch(isControlled, (controlled) => {
      if (wasControlled && !controlled) {
        console.warn(
          'A component changed from controlled to uncontrolled. ' +
            'This is likely a bug. Decide between controlled or uncontrolled for the lifetime of the component.',
        )
      }

      if (!wasControlled && controlled) {
        console.warn(
          'A component changed from uncontrolled to controlled. ' +
            'This is likely a bug. Decide between controlled or uncontrolled for the lifetime of the component.',
        )
      }

      wasControlled = controlled
    })
  }

  const value = computed({
    get() {
      return isControlled.value ? prop.value! : internalValue.value
    },
    set(newValue: T) {
      if (isControlled.value) {
        onChange?.(newValue)
      } else {
        internalValue.value = newValue
        onChange?.(newValue)
      }
    },
  })

  return value as Ref<T>
}
