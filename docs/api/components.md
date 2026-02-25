# Components API

vue-superselect provides a set of compound components that compose together via `provide`/`inject`. Each component is headless -- it renders no styles and gives you full control over markup and styling.

For a renderless alternative, see the [Composable API](/api/composable).

<script setup>
import ComponentsApiDemo from '../examples/ComponentsApiDemo.vue'
</script>

## Complete Example

<ClientOnly>
  <DemoBox title="All Components Together">
    <ComponentsApiDemo />
    <template #source>

<<< ../examples/ComponentsApiDemo.vue

  </template>
  </DemoBox>
</ClientOnly>

## SelectRoot

The root provider component. Wraps all other Select components and manages state via `provide`/`inject`. Renders no DOM element -- only its default slot.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `T \| T[] \| null` | `undefined` | Controlled selected value. Use with `v-model`. |
| `defaultValue` | `T \| T[] \| null` | `null` | Initial value for uncontrolled usage. |
| `multiple` | `boolean` | `false` | Enable multi-select mode. When true, `modelValue` must be an array. |
| `disabled` | `boolean` | `false` | Disables all interaction: input, trigger, clear, and option clicks. |
| `items` | `T[]` | `undefined` | Root-level data source for option items. Alternative to using SelectOption children. |
| `labelKey` | `keyof T` | `undefined` | Which field on each item object to use as the display label. |
| `valueKey` | `keyof T` | `undefined` | Which field on each item object to use as the v-model value. |
| `filter` | `FilterFn` | `undefined` | Custom filter function. See [FilterFn type](#typescript-types) below. Defaults to case-insensitive label matching. |
| `debounce` | `number` | `undefined` | Debounce delay in milliseconds for the filter function. |
| `resolveLabel` | `(value: T) => string` | `undefined` | Resolves a display label for a selected value when option components are not mounted. |
| `selectOnTab` | `boolean` | `false` | When true, pressing Tab selects the highlighted option before closing. |
| `max` | `number` | `undefined` | Maximum number of selections in multi-select mode. Has no effect when `multiple` is false. |
| `hideSelected` | `boolean` | `false` | Hides already-selected options from the dropdown list in multi-select mode. |
| `open` | `boolean` | `undefined` | Controlled open state. Use with `v-model:open` for two-way binding. |
| `defaultOpen` | `boolean` | `false` | Initial open state for uncontrolled usage. |
| `loop` | `boolean` | `true` | Whether keyboard navigation wraps around from last to first option and vice versa. |
| `placeholder` | `string` | `undefined` | Placeholder text displayed on the input when empty. |
| `id` | `string` | auto-generated | Custom ID for the root element. Used as a base for ARIA IDs. |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `T \| T[] \| null` | Emitted when the selected value changes. Used by `v-model`. |
| `update:open` | `boolean` | Emitted when the open state changes. Used by `v-model:open`. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | -- | Content to render. Must contain other Select components. |

### Exposed Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `() => void` | Opens the dropdown |
| `close` | `() => void` | Closes the dropdown |
| `toggle` | `() => void` | Toggles the dropdown open/closed |
| `clear` | `() => void` | Clears the current selection and query |
| `focus` | `() => void` | Focuses the input element |

### TypeScript Types {#typescript-types}

```ts
type FilterFn<T> = (item: CollectionItem<T>, query: string) => boolean

interface CollectionItem<T> {
  id: string
  value: T
  label: string
  disabled: boolean
  element: HTMLElement | null
}

type SelectLabelResolver<T> = (value: T) => string | undefined
```

---

## SelectControl

Visual wrapper around the input and tags. Serves as the positioning reference for the dropdown. Renders as a `div` by default.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string \| Component` | `'div'` | The element or component to render as. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ selectedItems, removeItem, multiple }` | Scoped slot providing selected items data for multi-select rendering. |

**Slot props detail:**

| Prop | Type | Description |
|------|------|-------------|
| `selectedItems` | `Array<{ value: T; label: string }>` | Selected items with resolved labels (multi-select only) |
| `removeItem` | `(value: T) => void` | Removes a specific item from the selection |
| `multiple` | `boolean` | Whether multi-select mode is active |

---

## SelectInput

Search/filter input element. Renders as an `input` by default. Handles typing, keyboard navigation, and focus management.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string \| Component` | `'input'` | The element or component to render as. |

::: tip Accessibility
Always provide an accessible label for the input. Use `aria-label`, `aria-labelledby`, or an associated `<label>` element. A dev-only warning is shown if no label is detected.
:::

---

## SelectContent

Dropdown listbox container. Only renders when the select is open. Renders as a `ul` by default. Integrates with `@floating-ui/vue` for smart positioning when available.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string \| Component` | `'ul'` | The element or component to render as. |
| `placement` | `string` | `'bottom-start'` | Preferred placement of the dropdown relative to the control. |
| `collisionStrategy` | `FloatingCollisionStrategy` | `'flip'` | How to handle collisions with viewport edges. `'flip'` moves to opposite side; `'none'` disables collision handling. |
| `forceAbsolute` | `boolean` | `false` | Disables Floating UI and uses simple CSS absolute positioning instead. |
| `teleport` | `boolean \| string` | `false` | Teleports the dropdown to a target element. `true` teleports to body; a string specifies a CSS selector. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | -- | Dropdown content. Typically contains SelectOption components. |

### TypeScript Types

```ts
type FloatingCollisionStrategy = 'flip' | 'none'
```

### Data Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-side` | `'top'`, `'bottom'`, `'left'`, `'right'` | Which side the dropdown is positioned on |
| `data-align` | `'start'`, `'center'`, `'end'` | Alignment within the chosen side |

---

## SelectOption

Individual option item within the dropdown. Self-registers with the collection and handles selection, highlighting, and visibility. Renders as a `li` by default.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `T` | -- (required) | The value of this option. |
| `label` | `string` | `String(value)` | Display label for this option. Falls back to string conversion of value. |
| `disabled` | `boolean` | `false` | Whether this option is disabled and cannot be selected. |
| `id` | `string` | auto-generated | Custom ID for this option element. |
| `as` | `string \| Component` | `'li'` | The element or component to render as. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ selected, active, disabled, option }` | Custom option rendering. Falls back to label prop or `String(value)`. |

**Slot props detail:**

| Prop | Type | Description |
|------|------|-------------|
| `selected` | `boolean` | Whether this option is currently selected |
| `active` | `boolean` | Whether this option is currently highlighted (via keyboard or mouse) |
| `disabled` | `boolean` | Whether this option is disabled |
| `option` | `T` | The raw value of this option |

### Data Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-selected` | `'true'`, `'false'` | Whether the option is selected |
| `data-highlighted` | `'true'`, `'false'` | Whether the option is highlighted |
| `data-disabled` | `'true'`, `'false'` | Whether the option is disabled |

---

## SelectTag

Multi-select tag/chip for displaying selected items. Provides a built-in remove button and emits a `remove` event. Renders as a `span` by default.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `T` | -- (required) | The value this tag represents. |
| `label` | `string` | -- (required) | Display text for the tag. |
| `disabled` | `boolean` | `false` | When true, the remove button is disabled. |
| `as` | `string \| Component` | `'span'` | The element or component to render as. |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `remove` | `T` | Emitted when the remove button is clicked. Payload is the tag value. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ value, label, disabled, remove }` | Custom tag rendering. Defaults to label text and a remove button. |

**Slot props detail:**

| Prop | Type | Description |
|------|------|-------------|
| `value` | `T` | The raw value of this tag |
| `label` | `string` | The display label |
| `disabled` | `boolean` | Whether the tag is disabled |
| `remove` | `(event: Event) => void` | Call to remove this tag |

### Data Attributes

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-part` | `'tag'` | Identifies the tag element |
| `data-disabled` | `'true'`, `undefined` | Present when the tag is disabled |

---

## SelectTrigger

Toggle button that opens/closes the dropdown. Renders as a `button` by default. Automatically sets `aria-expanded` and `aria-controls`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string \| Component` | `'button'` | The element or component to render as. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | -- | Button content. Typically a chevron icon or toggle indicator. |

---

## SelectClear

Clear button that resets the selection and query. Renders as a `button` by default. Automatically disabled when the select is disabled.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string \| Component` | `'button'` | The element or component to render as. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | -- | Button content. Typically an "x" icon. |

---

## SelectEmpty

Conditional empty state that only renders when no options match the current filter query. Renders as a `div` by default.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `string \| Component` | `'div'` | The element or component to render as. |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | -- | Custom empty state content. Defaults to "No results". |

---

## SelectLiveRegion

Screen reader live region that announces selection changes, dropdown state, and result counts. Renders a visually hidden `div` with `aria-live="polite"`.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `messages` | `Partial<SelectMessages>` | `defaultSelectMessages` | Custom message functions for screen reader announcements. |

### TypeScript Types

```ts
interface SelectMessages {
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
```

**Default messages:**

| Message | Default |
|---------|---------|
| `listExpanded` | `"List expanded"` |
| `listCollapsed` | `"List collapsed"` |
| `resultsCount` | `"3 results"` (pluralized) |
| `itemAdded` | `"Added Apple"` |
| `itemRemoved` | `"Removed Apple"` |

---

## Primitive `as` Prop

All components accept an `as` prop that controls the rendered element. This enables rendering as custom components or different HTML elements:

```vue
<!-- Render SelectContent as an <ol> instead of <ul> -->
<SelectContent as="ol">
  <SelectOption as="li" ... />
</SelectContent>

<!-- Render SelectControl as a custom component -->
<SelectControl :as="MyCustomWrapper">
  ...
</SelectControl>
```
