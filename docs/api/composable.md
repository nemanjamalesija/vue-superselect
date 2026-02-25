# Composable API

The `useSelect` composable provides full select functionality without any components. You get reactive state and **prop getter** functions that return the correct attributes for your own HTML elements.

For a component-based alternative, see the [Components API](/api/components).

<script setup>
import ComposableApiDemo from '../examples/ComposableApiDemo.vue'
</script>

## Complete Example

<ClientOnly>
  <DemoBox title="useSelect with Prop Getters">
    <ComposableApiDemo />
    <template #source>

<<< ../examples/ComposableApiDemo.vue

  </template>
  </DemoBox>
</ClientOnly>

## useSelect

```ts
function useSelect<T>(options?: UseSelectOptions<T>): UseSelectReturn<T>
```

Creates a fully functional select instance. Returns reactive state, methods, and prop getter functions.

### Options

```ts
interface UseSelectOptions<T> {
  id?: string
  value?: Ref<T | T[] | null | undefined>
  defaultValue?: T | T[] | null
  onValueChange?: (value: T | T[] | null) => void
  open?: Ref<boolean | undefined>
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  filter?: FilterFn<T>
  debounce?: number
  loop?: boolean
  multiple?: boolean
  max?: number | Ref<number | undefined>
  hideSelected?: boolean | Ref<boolean>
  disabled?: Ref<boolean>
  selectOnTab?: boolean
  placeholder?: Ref<string | undefined>
  items?: Ref<T[] | undefined> | T[]
  labelKey?: keyof T
  valueKey?: keyof T
  resolveLabel?: SelectLabelResolver<T>
}
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `id` | `string` | auto-generated | Base ID for ARIA attributes. |
| `value` | `Ref` | `undefined` | Controlled value ref. When provided, the composable does not manage its own value state. |
| `defaultValue` | `T \| T[] \| null` | `null` | Initial value for uncontrolled usage. |
| `onValueChange` | `(value) => void` | `undefined` | Callback when value changes. Works with both controlled and uncontrolled modes. |
| `open` | `Ref<boolean>` | `undefined` | Controlled open state ref. |
| `defaultOpen` | `boolean` | `false` | Initial open state for uncontrolled usage. |
| `onOpenChange` | `(open) => void` | `undefined` | Callback when open state changes. |
| `filter` | `FilterFn` | case-insensitive label match | Custom filter function. Receives item and query string, returns boolean. |
| `debounce` | `number` | `undefined` | Debounce delay in ms for the filter function. |
| `loop` | `boolean` | `undefined` | Whether keyboard navigation wraps around. |
| `multiple` | `boolean` | `false` | Enable multi-select mode. |
| `max` | `number \| Ref<number>` | `undefined` | Maximum selections in multi-select mode. |
| `hideSelected` | `boolean \| Ref<boolean>` | `false` | Hide selected items from the dropdown in multi-select mode. |
| `disabled` | `Ref<boolean>` | `ref(false)` | Disables all interaction. |
| `selectOnTab` | `boolean` | `false` | Tab key selects the highlighted option before closing. |
| `placeholder` | `Ref<string>` | `undefined` | Placeholder text for the input. |
| `items` | `Ref<T[]> \| T[]` | `undefined` | Data source for options. Used by `resolveLabel` for label lookup. |
| `labelKey` | `keyof T` | `undefined` | Object field to use as display label. |
| `valueKey` | `keyof T` | `undefined` | Object field to use as the selected value. |
| `resolveLabel` | `(value: T) => string` | `undefined` | Custom label resolver for values without mounted options. |

### Return Value

```ts
interface UseSelectReturn<T> {
  // Prop getters
  getRootProps: (userProps?) => Record<string, unknown>
  getInputProps: (userProps?) => Record<string, unknown>
  getListboxProps: (userProps?) => Record<string, unknown>
  getOptionProps: (item: CollectionItem<T>, userProps?) => Record<string, unknown>

  // Reactive state
  value: Ref<T | T[] | null>
  isOpen: Ref<boolean>
  query: Ref<string>
  items: Readonly<Ref<readonly CollectionItem<T>[]>>
  orderedItems: Ref<CollectionItem<T>[]>
  filteredItems: Ref<CollectionItem<T>[]>
  visibleItems: Ref<CollectionItem<T>[]>
  activeId: Ref<string | null>
  activeIndex: Ref<number>
  multiple: boolean
  isAtMax: Ref<boolean>
  disabled: Ref<boolean>
  placeholder: Ref<string | undefined>

  // Methods
  open: () => void
  close: () => void
  toggle: () => void
  dismiss: () => void
  clear: () => void
  focus: () => void
  removeLast: () => void
  isSelected: (item: CollectionItem<T>) => boolean

  // Collection management
  registerItem: (item: CollectionItem<T>) => void
  unregisterItem: (id: string) => void
  updateItem: (id: string, patch: Partial<CollectionItem<T>>) => void
  resolveLabel: (value: unknown) => string | undefined
  getItemLabel: (item: T) => string
  getItemValue: (item: T) => unknown

  // Element refs
  controlRef: Ref<HTMLElement | null>
  inputRef: Ref<HTMLElement | null>
}
```

## Prop Getters

Prop getters are functions that return the correct HTML attributes for each element. They handle ARIA attributes, event handlers, keyboard navigation, and state management. Spread them onto your elements:

```vue
<template>
  <div v-bind="getRootProps()">
    <input v-bind="getInputProps()" />
    <ul v-if="isOpen" v-bind="getListboxProps()">
      <li
        v-for="item in visibleItems"
        :key="item.id"
        v-bind="getOptionProps(item)"
      >
        {{ item.label }}
      </li>
    </ul>
  </div>
</template>
```

### getRootProps

Returns attributes for the root container element: `id`, `data-state` (`'open'` or `'closed'`), and `data-disabled`.

### getInputProps

Returns attributes for the input element: `role`, `aria-expanded`, `aria-activedescendant`, `aria-autocomplete`, `value`, `placeholder`, `disabled`, plus event handlers for `input`, `keydown`, `mousedown`, `focusout`, `compositionstart`, and `compositionend`.

### getListboxProps

Returns attributes for the listbox container: `role="listbox"`, `id`, `aria-multiselectable` (when `multiple` is true).

### getOptionProps

Returns attributes for each option: `role="option"`, `id`, `aria-selected`, `aria-disabled`, plus `data-selected`, `data-highlighted`, `data-disabled` attributes, and event handlers for `click`, `mousedown`, and `mousemove`.

**Signature:**
```ts
getOptionProps(item: CollectionItem<T>, userProps?: Record<string, unknown>)
```

### Merging User Props

All prop getters accept an optional `userProps` argument. Your props are merged with the internal props, and event handlers are combined (both run):

```vue
<input v-bind="getInputProps({ class: 'my-input', onFocus: handleFocus })" />
```

## Reactive State

| Property | Type | Description |
|----------|------|-------------|
| `value` | `Ref` | Current selected value |
| `isOpen` | `Ref<boolean>` | Whether the dropdown is open |
| `query` | `Ref<string>` | Current search query text |
| `items` | `Ref<CollectionItem[]>` | All registered items |
| `orderedItems` | `Ref<CollectionItem[]>` | Items in DOM order |
| `filteredItems` | `Ref<CollectionItem[]>` | Items after filter is applied |
| `visibleItems` | `Ref<CollectionItem[]>` | Items visible in dropdown (filtered + hideSelected) |
| `activeId` | `Ref<string \| null>` | ID of the currently highlighted option |
| `activeIndex` | `Ref<number>` | Index of the currently highlighted option |
| `multiple` | `boolean` | Whether multi-select is active |
| `isAtMax` | `Ref<boolean>` | Whether maximum selections have been reached |
| `disabled` | `Ref<boolean>` | Whether the select is disabled |
| `placeholder` | `Ref<string>` | Placeholder text |

## Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `open` | `() => void` | Opens the dropdown (no-op if disabled) |
| `close` | `() => void` | Closes the dropdown |
| `toggle` | `() => void` | Toggles the dropdown open/closed |
| `dismiss` | `() => void` | Closes the dropdown and restores the query to the selected label (single) or clears it (multi) |
| `clear` | `() => void` | Clears the selection and query |
| `focus` | `() => void` | Focuses the input element |
| `removeLast` | `() => void` | Removes the last selected item (multi-select only, when query is empty) |
| `isSelected` | `(item) => boolean` | Checks if an item is currently selected |

## Collection Management

When using the composable, you must register and unregister items manually. This is typically done in `onMounted` and `onBeforeUnmount`:

```ts
import { onMounted, onBeforeUnmount } from 'vue'

const { registerItem, unregisterItem, visibleItems } = useSelect({ ... })

// Register items from your data
const items = ['Apple', 'Banana', 'Cherry'].map((fruit, i) => ({
  id: `option-${i}`,
  value: fruit,
  label: fruit,
  disabled: false,
  element: null,
}))

onMounted(() => items.forEach(registerItem))
onBeforeUnmount(() => items.forEach(item => unregisterItem(item.id)))
```

## TypeScript Types

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

type SelectValue<T> = T | T[] | null
```

## Usage with Options API

The composable works in the Options API via the `setup()` function:

:::tabs key:api-style
== Composition API

```vue
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useSelect } from 'vue-superselect'

const fruits = ['Apple', 'Banana', 'Cherry']
const { getRootProps, getInputProps, getListboxProps, getOptionProps,
        isOpen, visibleItems, registerItem, unregisterItem } = useSelect()

const items = fruits.map((fruit, i) => ({
  id: `fruit-${i}`, value: fruit, label: fruit, disabled: false, element: null,
}))

onMounted(() => items.forEach(registerItem))
onBeforeUnmount(() => items.forEach(item => unregisterItem(item.id)))
</script>
```

== Options API

```vue
<script>
import { onMounted, onBeforeUnmount } from 'vue'
import { useSelect } from 'vue-superselect'

export default {
  setup() {
    const fruits = ['Apple', 'Banana', 'Cherry']
    const select = useSelect()

    const items = fruits.map((fruit, i) => ({
      id: `fruit-${i}`, value: fruit, label: fruit, disabled: false, element: null,
    }))

    onMounted(() => items.forEach(select.registerItem))
    onBeforeUnmount(() => items.forEach(item => select.unregisterItem(item.id)))

    return { ...select, items }
  },
}
</script>
```

:::
