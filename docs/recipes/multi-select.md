# Multi-Select

Enable selecting multiple values with the `multiple` prop. The v-model becomes an array, the dropdown stays open between selections, and users can toggle options on and off.

<script setup>
import MultiSelectDemo from '../examples/MultiSelectDemo.vue'
import MultiSelectTagsDemo from '../examples/MultiSelectTagsDemo.vue'
import MultiSelectMaxDemo from '../examples/MultiSelectMaxDemo.vue'
</script>

## Basic Multi-Select

Add `multiple` to `SelectRoot` and bind v-model to an array.

<DemoBox title="Basic Multi-Select">
  <ClientOnly>
    <MultiSelectDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/MultiSelectDemo.vue

  </template>
</DemoBox>

### Key Differences from Single Select

| Behavior | Single | Multi |
|----------|--------|-------|
| **v-model type** | `T \| null` | `T[]` |
| **After selection** | Dropdown closes | Dropdown stays open |
| **Clicking selected option** | No effect | Deselects (toggle) |
| **Query** | Preserved | Clears after each selection |

:::tabs key:api-style
== Composition API
```vue
<script setup>
import { ref } from 'vue'
import { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption } from 'vue-superselect'

const selected = ref([])  // array, not null
const skills = ['JavaScript', 'TypeScript', 'Vue', 'React']
</script>

<template>
  <SelectRoot v-model="selected" multiple>
    <!-- same template structure as single select -->
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
    return {
      selected: [],  // array, not null
      skills: ['JavaScript', 'TypeScript', 'Vue', 'React'],
    }
  },
}
</script>

<template>
  <SelectRoot v-model="selected" multiple>
    <!-- same template structure as single select -->
  </SelectRoot>
</template>
```
:::

## Tags with Remove Buttons

Use `SelectTag` inside `SelectControl`'s scoped slot to render removable tags for each selection.

<DemoBox title="Multi-Select with Tags">
  <ClientOnly>
    <MultiSelectTagsDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/MultiSelectTagsDemo.vue

  </template>
</DemoBox>

### How Tags Work

`SelectControl` exposes a scoped slot with `selectedItems` and `removeItem`:

```vue-html
<SelectControl v-slot="{ selectedItems, removeItem }">
  <SelectTag
    v-for="item in selectedItems"
    :key="String(item.value)"
    :value="item.value"
    :label="item.label"
    @remove="removeItem"
  />
  <SelectInput placeholder="Add members..." />
</SelectControl>
```

| Slot Data | Type | Description |
|-----------|------|-------------|
| `selectedItems` | `{ value: unknown; label: string }[]` | Currently selected items with resolved labels |
| `removeItem` | `(value: unknown) => void` | Removes an item from the selection |
| `multiple` | `boolean` | Whether multi-select mode is active |

`SelectTag` renders a tag with a remove button by default. You can customize it with a scoped slot:

```vue-html
<SelectTag :value="item.value" :label="item.label" v-slot="{ label, remove }">
  <span>{{ label }}</span>
  <button @click="remove">Remove</button>
</SelectTag>
```

**Backspace removal:** When the input is empty and the user presses Backspace, the last selected tag is automatically removed.

## Max Selections and Hide Selected

Limit the number of selections with `max` and hide already-selected options from the dropdown with `hide-selected`.

<DemoBox title="Multi-Select with Max Limit">
  <ClientOnly>
    <MultiSelectMaxDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/MultiSelectMaxDemo.vue

  </template>
</DemoBox>

### Props for Multi-Select Control

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `multiple` | `boolean` | `false` | Enable multi-select mode |
| `max` | `number` | `undefined` | Maximum number of selections allowed |
| `hide-selected` | `boolean` | `false` | Remove selected options from the visible dropdown |

When the `max` limit is reached:

- Unselected options become disabled (grayed out, not clickable)
- The `disabled` scoped slot prop on `SelectOption` becomes `true` for unselected items
- Already-selected options can still be toggled off

Combine `max` with `hide-selected` for a cleaner experience — as users select options, those options disappear from the list, and the limit prevents selecting too many.

:::tabs key:api-style
== Composition API
```vue
<script setup>
import { ref } from 'vue'
import { SelectRoot } from 'vue-superselect'

const selected = ref([])
</script>

<template>
  <SelectRoot v-model="selected" multiple :max="3" hide-selected>
    <!-- ... -->
  </SelectRoot>
</template>
```
== Options API
```vue
<script>
import { SelectRoot } from 'vue-superselect'

export default {
  components: { SelectRoot },
  data() {
    return { selected: [] }
  },
}
</script>

<template>
  <SelectRoot v-model="selected" multiple :max="3" hide-selected>
    <!-- ... -->
  </SelectRoot>
</template>
```
:::

## Next Steps

- [Custom Filtering](/recipes/custom-filtering) — write custom filter functions with debounce
- [Basic Select](/recipes/basic-select) — single-select patterns
- [Accessibility](/core-concepts/accessibility) — keyboard shortcuts for multi-select (Backspace removal)
