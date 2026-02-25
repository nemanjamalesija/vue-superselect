# Custom Rendering

Every component in vue-superselect exposes scoped slots for rendering custom content. The library is headless, so these demos show one possible styling approach. You have full control over what each option and tag looks like.

<script setup>
import CustomRenderingDemo from '../examples/CustomRenderingDemo.vue'
import CustomRenderingSlotDemo from '../examples/CustomRenderingSlotDemo.vue'
</script>

## Rich Option Content

Use the `SelectOption` default slot to render icons, badges, secondary text, or any custom layout inside each option.

<DemoBox title="Custom Option Rendering with Icons and Categories">
  <ClientOnly>
    <CustomRenderingDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/CustomRenderingDemo.vue

  </template>
</DemoBox>

### Scoped Slot Props

`SelectOption` provides these scoped slot props for conditional rendering and styling:

```vue-html
<SelectOption v-slot="{ selected, active, disabled, option }">
  <!-- Render anything here -->
</SelectOption>
```

| Prop | Type | Description |
|------|------|-------------|
| `selected` | `boolean` | Whether this option is currently selected |
| `active` | `boolean` | Whether this option is keyboard-highlighted |
| `disabled` | `boolean` | Whether this option is disabled |
| `option` | `unknown` | The raw value passed to `:value` |

:::tabs key:api-style
== Composition API
```vue
<script setup>
import { ref } from 'vue'
import { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption } from 'vue-superselect'

const selected = ref(null)
const languages = [
  { id: 'js', name: 'JavaScript', icon: 'JS', category: 'Frontend' },
  { id: 'ts', name: 'TypeScript', icon: 'TS', category: 'Frontend' },
  { id: 'python', name: 'Python', icon: 'Py', category: 'Backend' },
]
</script>

<template>
  <SelectRoot v-model="selected" :items="languages" label-key="name" value-key="id">
    <SelectControl>
      <SelectInput placeholder="Pick a language..." />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="lang in languages"
        :key="lang.id"
        :value="lang.id"
        :label="lang.name"
        v-slot="{ selected: isSelected, active }"
      >
        <span class="icon">{{ lang.icon }}</span>
        <span class="info">
          <span>{{ lang.name }}</span>
          <span class="category">{{ lang.category }}</span>
        </span>
        <span v-if="isSelected">&#10003;</span>
      </SelectOption>
    </SelectContent>
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
      selected: null,
      languages: [
        { id: 'js', name: 'JavaScript', icon: 'JS', category: 'Frontend' },
        { id: 'ts', name: 'TypeScript', icon: 'TS', category: 'Frontend' },
        { id: 'python', name: 'Python', icon: 'Py', category: 'Backend' },
      ],
    }
  },
}
</script>

<template>
  <SelectRoot v-model="selected" :items="languages" label-key="name" value-key="id">
    <SelectControl>
      <SelectInput placeholder="Pick a language..." />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="lang in languages"
        :key="lang.id"
        :value="lang.id"
        :label="lang.name"
        v-slot="{ selected: isSelected, active }"
      >
        <span class="icon">{{ lang.icon }}</span>
        <span class="info">
          <span>{{ lang.name }}</span>
          <span class="category">{{ lang.category }}</span>
        </span>
        <span v-if="isSelected">&#10003;</span>
      </SelectOption>
    </SelectContent>
  </SelectRoot>
</template>
```
:::

## Custom Tags and Selected Display

Use `SelectControl`'s scoped slot to customize how selected items are displayed. Combined with `SelectTag`'s scoped slot, you can render avatars, custom remove buttons, or any layout inside tags.

<DemoBox title="Custom Tags with Avatars">
  <ClientOnly>
    <CustomRenderingSlotDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/CustomRenderingSlotDemo.vue

  </template>
</DemoBox>

### SelectControl Scoped Slot

`SelectControl` provides data about the current selection:

```vue-html
<SelectControl v-slot="{ selectedItems, removeItem, multiple }">
  <!-- Render selected items however you want -->
</SelectControl>
```

| Slot Data | Type | Description |
|-----------|------|-------------|
| `selectedItems` | `{ value: unknown; label: string }[]` | Currently selected items with resolved labels |
| `removeItem` | `(value: unknown) => void` | Removes an item from the selection |
| `multiple` | `boolean` | Whether multi-select mode is active |

### SelectTag Scoped Slot

Each `SelectTag` can be fully customized with its own scoped slot:

```vue-html
<SelectTag :value="item.value" :label="item.label" v-slot="{ label, remove }">
  <span class="avatar">{{ getInitials(item) }}</span>
  <span>{{ label }}</span>
  <button @click="remove">&times;</button>
</SelectTag>
```

| Slot Data | Type | Description |
|-----------|------|-------------|
| `label` | `string` | The resolved label for this tag |
| `remove` | `() => void` | Removes this specific tag |

## Styling with Data Attributes

Every component renders data attributes that reflect the current state, enabling CSS-only styling without scoped slot props:

```css
/* Highlighted option */
[data-highlighted="true"] {
  background-color: #e0f2fe;
}

/* Selected option */
[data-selected="true"] {
  font-weight: 600;
  color: #2563eb;
}

/* Disabled option */
[data-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
}
```

Available data attributes on `SelectOption`:

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-selected` | `"true"` \| `"false"` | Whether the option is selected |
| `data-highlighted` | `"true"` \| `"false"` | Whether the option has keyboard focus |
| `data-disabled` | `"true"` \| `"false"` | Whether the option is disabled |

On `SelectRoot`:

| Attribute | Values | Description |
|-----------|--------|-------------|
| `data-state` | `"open"` \| `"closed"` | Whether the dropdown is open |
| `data-disabled` | `"true"` \| `undefined` | Whether the component is disabled |

Data attributes are useful when you want to style options without writing JavaScript logic in scoped slots. For example, a CSS-only approach with Tailwind or utility classes.

## Next Steps

- [Programmatic Control](/recipes/programmatic-control)
- [Disabled Options](/recipes/disabled-options)
- [API Reference: Components](/api/components)
