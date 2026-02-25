# Disabled Options

Prevent certain options from being selected using the `disabled` prop on `SelectOption`. Disabled options remain visible in the dropdown but cannot be clicked or selected via keyboard navigation.

<script setup>
import DisabledOptionsDemo from '../examples/DisabledOptionsDemo.vue'
import DisabledConditionalDemo from '../examples/DisabledConditionalDemo.vue'
</script>

## Static Disabled Options

Set the `disabled` prop directly on individual `SelectOption` components. Disabled options are skipped during keyboard navigation and cannot be selected by click.

<DemoBox title="Static Disabled Options">
  <ClientOnly>
    <DisabledOptionsDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/DisabledOptionsDemo.vue

  </template>
</DemoBox>

### Step by Step

:::tabs key:api-style
== Composition API
```vue
<script setup>
import { ref } from 'vue'
import { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption } from 'vue-superselect'

const selected = ref(null)
const drinks = [
  { id: 'coffee', name: 'Coffee', disabled: false },
  { id: 'espresso', name: 'Espresso', disabled: true },
  { id: 'latte', name: 'Latte', disabled: false },
]
</script>

<template>
  <SelectRoot v-model="selected" :items="drinks" label-key="name" value-key="id">
    <SelectControl>
      <SelectInput placeholder="Choose a drink..." />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="drink in drinks"
        :key="drink.id"
        :value="drink.id"
        :label="drink.name"
        :disabled="drink.disabled"
      >
        {{ drink.name }}
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
      drinks: [
        { id: 'coffee', name: 'Coffee', disabled: false },
        { id: 'espresso', name: 'Espresso', disabled: true },
        { id: 'latte', name: 'Latte', disabled: false },
      ],
    }
  },
}
</script>

<template>
  <SelectRoot v-model="selected" :items="drinks" label-key="name" value-key="id">
    <SelectControl>
      <SelectInput placeholder="Choose a drink..." />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="drink in drinks"
        :key="drink.id"
        :value="drink.id"
        :label="drink.name"
        :disabled="drink.disabled"
      >
        {{ drink.name }}
      </SelectOption>
    </SelectContent>
  </SelectRoot>
</template>
```
:::

The `:disabled` prop is a boolean on `SelectOption`. When `true`:

- The option is visible but not clickable
- Keyboard navigation (Arrow Up/Down) skips over it
- The `disabled` scoped slot prop is `true`
- The option receives `aria-disabled="true"` automatically

## Conditional Disabling

Compute the disabled state from your option data. In this example, products with zero stock are automatically disabled.

<DemoBox title="Conditional Disabling Based on Data">
  <ClientOnly>
    <DisabledConditionalDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/DisabledConditionalDemo.vue

  </template>
</DemoBox>

### Computed Disabled State

The key line is `:disabled="product.stock === 0"`. Any expression that evaluates to a boolean works:

```vue-html
<SelectOption
  v-for="product in products"
  :key="product.id"
  :value="product.id"
  :label="product.name"
  :disabled="product.stock === 0"
>
```

Common patterns for conditional disabling:

| Pattern | Expression |
|---------|------------|
| Out of stock | `:disabled="item.stock === 0"` |
| User permissions | `:disabled="!item.canAccess"` |
| Dependency | `:disabled="!selectedCategory"` |
| Already used | `:disabled="usedIds.includes(item.id)"` |

## Styling Disabled Options

### Using Scoped Slot Props

The `disabled` prop is exposed as a scoped slot prop on `SelectOption`:

```vue-html
<SelectOption
  v-slot="{ selected, active, disabled }"
  :disabled="item.disabled"
>
  <span :class="{ 'opacity-50': disabled }">{{ item.name }}</span>
</SelectOption>
```

### Using Data Attributes

Disabled options automatically receive `data-disabled="true"`, which you can target with CSS:

```css
[data-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
}
```

This approach works well for pure CSS styling without scoped slot props.

## Accessibility

Disabled options are fully accessible out of the box:

- `aria-disabled="true"` is set automatically
- Screen readers announce the option as disabled
- Keyboard navigation skips disabled options (Arrow Up/Down jump to the next enabled option)
- Disabled options do not respond to mouse clicks

No additional ARIA configuration is needed.

## Next Steps

- [Custom Rendering](/recipes/custom-rendering)
- [Multi-Select](/recipes/multi-select)
- [Accessibility](/core-concepts/accessibility)
