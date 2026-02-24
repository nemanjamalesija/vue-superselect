export type SelectDataState = 'open' | 'closed'

export interface SelectDataAttributes {
  'data-state'?: SelectDataState
  'data-selected'?: 'true' | 'false'
  'data-highlighted'?: 'true' | 'false'
  'data-disabled'?: 'true' | 'false'
  'data-side'?: 'top' | 'bottom' | 'left' | 'right'
  'data-align'?: 'start' | 'center' | 'end'
}
