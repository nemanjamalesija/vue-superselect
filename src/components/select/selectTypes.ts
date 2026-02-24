export type SelectDataState = 'open' | 'closed'

export interface SelectDataAttributes {
  'data-state'?: SelectDataState
  'data-selected'?: 'true' | 'false'
  'data-highlighted'?: 'true' | 'false'
  'data-disabled'?: 'true' | 'false'
  'data-side'?: 'top' | 'bottom' | 'left' | 'right'
  'data-align'?: 'start' | 'center' | 'end'
}

/** Extracts value from an item using optional key mapping */
export type ExtractValue<T, VK extends keyof T | undefined> =
  VK extends keyof T ? T[VK] : T

/** Extracts label string from an item using optional key mapping */
export type ExtractLabel<T, LK extends keyof T | undefined> =
  LK extends keyof T ? T[LK] : T
