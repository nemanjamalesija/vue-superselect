# Controlled State

vue-superselect supports both **controlled** and **uncontrolled** state patterns, just like native form elements in Vue.

<script setup>
import ControlledStateDemo from '../examples/ControlledStateDemo.vue'
import UncontrolledDemo from '../examples/UncontrolledDemo.vue'
</script>

## Controlled: v-model

Bind `v-model` on `SelectRoot` to control the selected value from your parent component. The value is reactive: change it programmatically and the select updates. Select an option and your variable updates.

### API Setup (Controlled Single Select)

:::tabs key:api-style
== Composition API
```vue
<script setup>
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
} from 'vue-superselect'

const selected = ref(null)
const fruits = ['Apple', 'Banana', 'Cherry']
</script>
```
== Options API
```vue
<script>
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
} from 'vue-superselect'

export default {
  components: {
    SelectRoot,
    SelectControl,
    SelectInput,
    SelectContent,
    SelectOption,
  },
  data() {
    return {
      selected: null,
      fruits: ['Apple', 'Banana', 'Cherry'],
    }
  },
}
</script>
```
:::

<DemoBox title="Controlled State with v-model">
  <ClientOnly>
    <ControlledStateDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/ControlledStateDemo.vue

  </template>
</DemoBox>

### Setting Up v-model

```vue-html
<SelectRoot v-model="selected">
  <!-- ... -->
</SelectRoot>
<p>Current: {{ selected }}</p>
```

`selected` can be `null` (no selection) or the selected option value.  
For the full component setup, see [Quick Start](/getting-started/quick-start).

### Programmatic Control

Because `v-model` is two-way, you can set the value from code:

```ts
// Reset selection
selected.value = null

// Set a specific value
selected.value = 'Cherry'

// Watch for changes
watch(selected, (newValue, oldValue) => {
  console.log(`Changed from ${oldValue} to ${newValue}`)
})
```

### Initial Value

Set the initial value through the ref:

```ts
const selected = ref('Banana') // starts with Banana selected
```

## Uncontrolled: No v-model

Omit `v-model` to let `SelectRoot` manage its own state internally. Use `default-value` to set the initial selection.

<DemoBox title="Uncontrolled with default-value">
  <ClientOnly>
    <UncontrolledDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/UncontrolledDemo.vue

  </template>
</DemoBox>

Uncontrolled mode is useful when you don't need to read or react to the selected value in the parent, for example in a simple form where submission reads the value at submit time.

## Object Options

When your options are objects rather than strings, use `items`, `label-key`, and `value-key` on `SelectRoot`:

```vue-html
<SelectRoot
  v-model="selected"
  :items="users"
  label-key="name"
  value-key="id"
>
  <!-- ... -->
</SelectRoot>
```

This keeps labels user-friendly (`name`) while storing compact model values (`id`).  
For a complete object-options walkthrough, see [Basic Select: Object Options](/recipes/basic-select#object-options).

| Prop | Purpose |
|------|---------|
| `items` | The full array of option objects (used for label resolution when content is closed) |
| `label-key` | Which field to display as the option label (e.g. `"name"`) |
| `value-key` | Which field to use as the v-model value (e.g. `"id"`) |

When using `value-key`, the v-model value will be the extracted field (e.g., the user's `id`), not the full object.

## Controlling Open State

You can also control the open/closed state of the dropdown:

```vue-html
<SelectRoot v-model="selected" v-model:open="isOpen">
  <!-- ... -->
</SelectRoot>
```

Or set a default open state without controlling it:

```vue-html
<SelectRoot :default-open="true">
  <!-- ... -->
</SelectRoot>
```

## Summary

| Pattern | v-model | default-value | When to use |
|---------|---------|---------------|-------------|
| **Controlled** | `v-model="ref"` | n/a | You need to read, watch, or set the value |
| **Uncontrolled** | n/a | `:default-value="'initial'"` | Self-contained select, value read at form submit |

## Next Steps

- [How It Works](/core-concepts/how-it-works)
- [Accessibility](/core-concepts/accessibility)
- [Basic Select](/recipes/basic-select)
