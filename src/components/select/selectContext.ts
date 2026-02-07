import { createContext } from '../../utils/createContext'
import type { UseSelectReturn } from '../../composables/useSelect'

export type SelectContextValue<T> = UseSelectReturn<T>

const [injectSelectContext, provideSelectContextInternal] = createContext<SelectContextValue<unknown>>(
  'SelectRoot',
)

export function useSelectContext<T>() {
  return injectSelectContext() as SelectContextValue<T>
}

export function provideSelectContext<T>(value: SelectContextValue<T>) {
  return provideSelectContextInternal(value as SelectContextValue<unknown>)
}
