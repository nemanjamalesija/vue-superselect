# Custom Filtering

vue-superselect filters options automatically as the user types. The built-in filter matches case-insensitively against each option's `label`. For domain-specific matching, you can provide your own filter function.

<script setup>
import CustomFilterDemo from '../examples/CustomFilterDemo.vue'
import DebounceFilterDemo from '../examples/DebounceFilterDemo.vue'
</script>

## Default Filtering

Out of the box, typing in the input filters the visible options. The built-in filter:

- Matches case-insensitively against the option's `label`
- Shows all options when the input is empty
- Handles IME composition automatically (filtering waits until composition completes)

<DemoBox title="Default Filter Behavior">
  <ClientOnly>
    <CustomFilterDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/CustomFilterDemo.vue

  </template>
</DemoBox>

No configuration is needed. Filtering is built in. If the input contains text, only matching options are shown. The `SelectEmpty` component displays a message when no options match.

## Custom Filter Function

Pass a `filter` prop to `SelectRoot` to replace the built-in matching logic. The filter function receives a collection item and the current query, and returns `true` to show the option or `false` to hide it.

<DemoBox title="Custom Filter with Debounce">
  <ClientOnly>
    <DebounceFilterDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/DebounceFilterDemo.vue

  </template>
</DemoBox>

### Writing a Filter Function

The filter function signature:

```ts
type FilterFn<T> = (item: CollectionItem<T>, query: string) => boolean
```

Each `item` has these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the option |
| `value` | `T` | The raw value passed to `:value` on `SelectOption` |
| `label` | `string` | The label string used for display |
| `disabled` | `boolean` | Whether the option is disabled |

Example: search both the option label and a category field:

:::tabs key:api-style
== Composition API
```vue
<script setup>
import { ref } from 'vue'
import { SelectRoot, type FilterFn } from 'vue-superselect'

const tools = [
  { id: 'vite', name: 'Vite', category: 'Build Tool' },
  { id: 'vitest', name: 'Vitest', category: 'Test Runner' },
]

const customFilter: FilterFn<unknown> = (item, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const tool = tools.find((t) => t.id === item.value)
  const category = tool?.category.toLowerCase() ?? ''

  return item.label.toLowerCase().includes(q) || category.includes(q)
}
</script>

<template>
  <SelectRoot :filter="customFilter" :items="tools" label-key="name" value-key="id">
    <!-- ... -->
  </SelectRoot>
</template>
```
== Options API
```vue
<script>
import { SelectRoot } from 'vue-superselect'

const tools = [
  { id: 'vite', name: 'Vite', category: 'Build Tool' },
  { id: 'vitest', name: 'Vitest', category: 'Test Runner' },
]

export default {
  components: { SelectRoot },
  data() {
    return { tools }
  },
  methods: {
    customFilter(item, query) {
      const q = query.trim().toLowerCase()
      if (!q) return true

      const tool = this.tools.find((t) => t.id === item.value)
      const category = tool?.category.toLowerCase() ?? ''

      return item.label.toLowerCase().includes(q) || category.includes(q)
    },
  },
}
</script>

<template>
  <SelectRoot :filter="customFilter" :items="tools" label-key="name" value-key="id">
    <!-- ... -->
  </SelectRoot>
</template>
```
:::

## Debounced Filtering

Use the `debounce` prop to delay filtering while the user is still typing. This is useful when your filter function is expensive or when you want to reduce visual noise during fast typing.

```vue-html
<SelectRoot :filter="customFilter" :debounce="200">
  <!-- ... -->
</SelectRoot>
```

The debounce value is in milliseconds. The filter function is only called after the user stops typing for that duration.

## IME Composition

vue-superselect handles IME (Input Method Editor) composition automatically. When a user is composing characters (e.g., typing Chinese, Japanese, or Korean), filtering is paused until composition is complete. This prevents partial composition strings from triggering unexpected filter results.

No configuration is needed. This behavior is built in.

## Next Steps

- [Dropdown Positioning](/recipes/dropdown-positioning)
- [Multi-Select](/recipes/multi-select)
- [API Reference: Components](/api/components)
