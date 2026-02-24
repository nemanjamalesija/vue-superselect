declare module '@floating-ui/vue' {
  import type { MaybeRefOrGetter, Ref } from 'vue'

  export interface FloatingMiddleware {
    name: string
    options?: unknown
  }

  export interface FloatingMiddlewareState {
    rects: {
      reference: {
        width: number
      }
    }
    elements: {
      floating: HTMLElement
    }
    availableHeight: number
  }

  export interface UseFloatingOptions {
    placement?: MaybeRefOrGetter<string>
    whileElementsMounted?: (
      reference: Element,
      floating: HTMLElement,
      update: () => void,
    ) => (() => void) | void
    middleware?: FloatingMiddleware[]
  }

  export interface UseFloatingReturn {
    floatingStyles: Readonly<Ref<Record<string, string | number>>>
    placement: Readonly<Ref<string>>
    isPositioned: Readonly<Ref<boolean>>
    update?: () => void
  }

  export function useFloating(
    reference: Ref<HTMLElement | null>,
    floating: Ref<HTMLElement | null>,
    options?: UseFloatingOptions,
  ): UseFloatingReturn

  export function autoUpdate(
    reference: Element,
    floating: HTMLElement,
    update: () => void,
  ): (() => void) | void

  export function offset(value: number): FloatingMiddleware
  export function flip(): FloatingMiddleware
  export function shift(options: { padding: number }): FloatingMiddleware
  export function size(options: {
    apply: (state: FloatingMiddlewareState) => void
  }): FloatingMiddleware
}
