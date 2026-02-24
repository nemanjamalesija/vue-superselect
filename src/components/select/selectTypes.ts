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

/** Function-based message generators for screen reader announcements. */
export interface SelectMessages {
  /** Announced when the dropdown opens */
  listExpanded: () => string
  /** Announced when the dropdown closes */
  listCollapsed: () => string
  /** Announced when the filtered result count changes */
  resultsCount: (count: number) => string
  /** Announced when an item is added in multi-select */
  itemAdded: (label: string) => string
  /** Announced when an item is removed in multi-select */
  itemRemoved: (label: string) => string
}

/** Default English messages for screen reader announcements. */
export const defaultSelectMessages: SelectMessages = {
  listExpanded: () => 'List expanded',
  listCollapsed: () => 'List collapsed',
  resultsCount: (count) => `${count} result${count === 1 ? '' : 's'}`,
  itemAdded: (label) => `Added ${label}`,
  itemRemoved: (label) => `Removed ${label}`,
}
