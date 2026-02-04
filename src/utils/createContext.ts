import { type InjectionKey, inject, provide } from 'vue'

export function createContext<ContextValue>(
  rootComponentName: string | string[],
  contextName?: string,
) {
  const key = Symbol(
    contextName ?? (Array.isArray(rootComponentName) ? rootComponentName.join(', ') : rootComponentName),
  ) as InjectionKey<ContextValue>

  function provideContext(context: ContextValue): ContextValue {
    provide(key, context)
    return context
  }

  function injectContext(fallback?: ContextValue | null): ContextValue {
    const context = inject(key, fallback ?? null)

    if (context === null) {
      const names = Array.isArray(rootComponentName) ? rootComponentName : [rootComponentName]

      throw new Error(
        `\`${contextName ?? names.join(', ')}\` must be used within \`${names.join(' or ')}\``,
      )
    }

    return context
  }

  return [injectContext, provideContext] as const
}
