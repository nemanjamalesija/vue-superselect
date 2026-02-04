import { createContext } from '../../utils/createContext'
import type { useSelect } from '../../composables/useSelect'

export type SelectContextValue<T> = ReturnType<typeof useSelect<T>>

const [injectSelectContext, provideSelectContextInternal] = createContext<SelectContextValue<unknown>>(
  'SelectRoot',
)

export function useSelectContext<T>() {
  return injectSelectContext() as SelectContextValue<T>
}

export function provideSelectContext<T>(value: SelectContextValue<T>) {
  return provideSelectContextInternal(value as SelectContextValue<unknown>)
}
