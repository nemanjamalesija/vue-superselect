# Programmatic Control

Control the select component from external code. Open, close, toggle, clear, and focus the select from buttons, keyboard shortcuts, or any application logic.

<script setup>
import ProgrammaticControlDemo from '../examples/ProgrammaticControlDemo.vue'
import ProgrammaticExposeDemo from '../examples/ProgrammaticExposeDemo.vue'
</script>

## Compound Component: Template Ref

Use a template ref on `SelectRoot` to access exposed methods. This is the simplest approach when using the compound component API.

<DemoBox title="Programmatic Control via Template Ref">
  <ClientOnly>
    <ProgrammaticControlDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/ProgrammaticControlDemo.vue

  </template>
</DemoBox>

### Exposed Methods

`SelectRoot` exposes these methods via template ref:

| Method | Signature | Description |
|--------|-----------|-------------|
| `open()` | `() => void` | Opens the dropdown |
| `close()` | `() => void` | Closes the dropdown |
| `toggle()` | `() => void` | Toggles the dropdown open/closed |
| `clear()` | `() => void` | Resets the value to `null` (single) or `[]` (multi) |
| `focus()` | `() => void` | Focuses the input element |

:::tabs key:api-style
== Composition API
```vue
<script setup>
import { ref } from 'vue'
import { SelectRoot } from 'vue-superselect'

const selectRef = ref(null)
const selected = ref(null)

// Call methods on the template ref
function openAndFocus() {
  selectRef.value?.open()
  selectRef.value?.focus()
}
</script>

<template>
  <button @click="openAndFocus">Open Select</button>
  <button @click="selectRef?.clear()">Clear</button>

  <SelectRoot ref="selectRef" v-model="selected">
    <!-- ... -->
  </SelectRoot>
</template>
```
== Options API
```vue
<script>
import { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption } from 'vue-superselect'

export default {
  components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
  data() {
    return { selected: null }
  },
  methods: {
    openAndFocus() {
      this.$refs.selectRef?.open()
      this.$refs.selectRef?.focus()
    },
  },
}
</script>

<template>
  <button @click="openAndFocus">Open Select</button>
  <button @click="$refs.selectRef?.clear()">Clear</button>

  <SelectRoot ref="selectRef" v-model="selected">
    <!-- ... -->
  </SelectRoot>
</template>
```
:::

## Composable API: Full Control

The `useSelect` composable returns the same control methods directly, plus reactive state you can read and write to. This gives you maximum flexibility for complex use cases.

<DemoBox title="Programmatic Control via Composable">
  <ClientOnly>
    <ProgrammaticExposeDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/ProgrammaticExposeDemo.vue

  </template>
</DemoBox>

### Composable Methods and State

`useSelect()` returns control methods as plain functions — no template ref needed:

```ts
const {
  // Control methods
  open,       // () => void — open the dropdown
  close,      // () => void — close the dropdown
  toggle,     // () => void — toggle open/closed
  clear,      // () => void — reset value
  focus,      // () => void — focus input
  dismiss,    // () => void — close + restore query

  // Reactive state (readable and writable)
  value,      // Ref<T | T[] | null> — current selection
  isOpen,     // Ref<boolean> — dropdown state
  query,      // Ref<string> — current filter text

  // Read-only state
  visibleItems, // Ref<CollectionItem<T>[]> — visible options
  activeId,     // Ref<string | null> — highlighted option id
  isAtMax,      // Ref<boolean> — max selections reached
  disabled,     // Ref<boolean> — component disabled state
} = useSelect({ items, labelKey: 'label', valueKey: 'id' })
```

### Setting Value Programmatically

With the composable, you can set the value directly:

```ts
// Select a specific item
value.value = 'some-id'

// Select random
const random = items[Math.floor(Math.random() * items.length)]
value.value = random.id

// Clear
clear()  // or: value.value = null
```

With the compound component API, use `v-model` reactivity:

```ts
// The v-model ref controls the value
const selected = ref(null)

// Set programmatically
selected.value = 'some-id'

// Clear
selected.value = null
```

## Common Patterns

### Open on External Event

```ts
// Open the select when a keyboard shortcut is pressed
function onKeyDown(event: KeyboardEvent) {
  if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault()
    selectRef.value?.open()
    selectRef.value?.focus()
  }
}
```

### Reset on Form Submit

```ts
function onSubmit() {
  // Process the selected value
  saveData(selected.value)

  // Reset the select
  selectRef.value?.clear()
}
```

### Controlled Open State

Use `v-model:open` on `SelectRoot` to control the dropdown state externally:

```vue-html
<SelectRoot v-model="selected" v-model:open="isOpen">
  <!-- ... -->
</SelectRoot>
```

This gives you a reactive `isOpen` ref that you can read and write to, independently of the exposed methods.

## Next Steps

- [Controlled State](/core-concepts/controlled-state) — v-model patterns and uncontrolled mode
- [How It Works](/core-concepts/how-it-works) — compound components vs composable architecture
- [API Reference: Composable](/api/composable) — full `useSelect` return value documentation
