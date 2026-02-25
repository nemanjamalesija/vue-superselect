# Quick Start

Build a working select component in under a minute.

<script setup>
import QuickStartDemo from '../examples/QuickStartDemo.vue'
</script>

<DemoBox title="Basic Single Select">
  <ClientOnly>
    <QuickStartDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/QuickStartDemo.vue

  </template>
</DemoBox>

## Step-by-Step

### 1. Import Components

vue-superselect uses a compound component pattern:

| Component | Role |
|-----------|------|
| `SelectRoot` | State container. Manages selection, filtering, and keyboard navigation. |
| `SelectControl` | Visual wrapper around the input area. |
| `SelectInput` | Search/filter input field. |
| `SelectContent` | Dropdown container that shows/hides options. |
| `SelectOption` | Individual selectable option. |

### 2. Set Up State

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
const options = ['Apple', 'Banana', 'Cherry', 'Grape', 'Orange']
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
      options: ['Apple', 'Banana', 'Cherry', 'Grape', 'Orange'],
    }
  },
}
</script>
```
:::

### 3. Build the Template

The template shape is the same in both APIs:

```vue-html
<template>
  <SelectRoot v-model="selected">
    <SelectControl>
      <SelectInput placeholder="Choose a fruit..." />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="option in options"
        :key="option"
        :value="option"
        :label="option"
      >
        {{ option }}
      </SelectOption>
    </SelectContent>
  </SelectRoot>
</template>
```

### 4. Add Your Own Styles

vue-superselect ships zero CSS. Add classes and styles using whatever approach you prefer: plain CSS, Tailwind, CSS modules, or any other method.

```vue-html
<SelectControl class="my-control">
  <SelectInput class="my-input" />
</SelectControl>
```

If you want the deeper mental model (provide/inject, prop getters, and architecture), go to [How It Works](/core-concepts/how-it-works).

## Next Steps

- [How It Works](/core-concepts/how-it-works)
- [Controlled State](/core-concepts/controlled-state)
- [Basic Select](/recipes/basic-select)
- [Multi-Select](/recipes/multi-select)
- [API Reference](/api/components)
