# Basic Select

Build a single-select component from simple string options to a full-featured clearable select with object data.

<script setup>
import BasicSingleDemo from '../examples/BasicSingleDemo.vue'
import BasicObjectDemo from '../examples/BasicObjectDemo.vue'
import BasicClearableDemo from '../examples/BasicClearableDemo.vue'
</script>

## String Options

The simplest possible select: an array of strings bound with `v-model`.

<DemoBox title="Basic String Select">
  <ClientOnly>
    <BasicSingleDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/BasicSingleDemo.vue

  </template>
</DemoBox>

### Step by Step

**1. Import and set up state**

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
const fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange', 'Strawberry']
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
  components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
  data() {
    return {
      selected: null,
      fruits: ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange', 'Strawberry'],
    }
  },
}
</script>
```
:::

**2. Build the template**

```vue-html
<SelectRoot v-model="selected">
  <SelectControl>
    <SelectInput placeholder="Pick a fruit..." />
  </SelectControl>
  <SelectContent>
    <SelectOption
      v-for="fruit in fruits"
      :key="fruit"
      :value="fruit"
      :label="fruit"
    >
      {{ fruit }}
    </SelectOption>
  </SelectContent>
</SelectRoot>
```

For string options, `:value` and `:label` are the same string. The `label` prop is used for filtering — when a user types in the input, options are matched against their label.

## Object Options

When your options are objects, use `label-key` and `value-key` on `SelectRoot` to tell the component which fields to use.

<DemoBox title="Object Options with label-key / value-key">
  <ClientOnly>
    <BasicObjectDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/BasicObjectDemo.vue

  </template>
</DemoBox>

### How Object Binding Works

```vue-html
<SelectRoot
  v-model="selected"
  :items="countries"
  label-key="name"
  value-key="code"
>
```

| Prop | Purpose |
|------|---------|
| `:items` | The full array of option objects. Used for label resolution when the dropdown is closed. |
| `label-key` | Which field to display and filter by (e.g. `"name"`) |
| `value-key` | Which field becomes the v-model value (e.g. `"code"`) |

With `value-key="code"`, the v-model value will be `"au"`, `"br"`, etc. — not the full object.

Each `SelectOption` still receives the individual `:value` and `:label`:

```vue-html
<SelectOption
  v-for="country in countries"
  :key="country.code"
  :value="country.code"
  :label="country.name"
>
  {{ country.name }}
</SelectOption>
```

## Clearable with Trigger and Empty State

Add a clear button, a dropdown toggle trigger, and a "no results" message for a complete select experience.

<DemoBox title="Clearable Select with Trigger and Empty State">
  <ClientOnly>
    <BasicClearableDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/BasicClearableDemo.vue

  </template>
</DemoBox>

### Additional Components

| Component | Purpose |
|-----------|---------|
| `SelectClear` | Button that resets the value to `null`. Renders as `<button>` by default. |
| `SelectTrigger` | Button that toggles the dropdown open/closed. |
| `SelectEmpty` | Shown when filtering produces zero visible options. |

```vue-html
<SelectControl>
  <SelectInput />
  <SelectClear v-if="selected">x</SelectClear>
  <SelectTrigger>
    <!-- chevron icon -->
  </SelectTrigger>
</SelectControl>
```

`SelectClear` is conditionally rendered with `v-if` — show it only when there's a value to clear.

`SelectEmpty` goes inside `SelectContent`:

```vue-html
<SelectContent>
  <SelectOption v-for="..." />
  <SelectEmpty>No results found</SelectEmpty>
</SelectContent>
```

## Scoped Slot Props

Every `SelectOption` exposes scoped slot props for conditional styling:

```vue-html
<SelectOption v-slot="{ selected, active, disabled, option }">
  {{ option }}
</SelectOption>
```

| Prop | Type | Description |
|------|------|-------------|
| `selected` | `boolean` | Whether this option is currently selected |
| `active` | `boolean` | Whether this option is keyboard-highlighted |
| `disabled` | `boolean` | Whether this option is disabled |
| `option` | `unknown` | The raw value passed to `:value` |

## Next Steps

- [Multi-Select](/recipes/multi-select) — select multiple values with tags
- [Custom Filtering](/recipes/custom-filtering) — write custom filter functions
- [Controlled State](/core-concepts/controlled-state) — programmatic control and v-model patterns
