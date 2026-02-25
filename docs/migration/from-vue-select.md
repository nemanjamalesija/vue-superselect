# Migrating from vue-select

This guide helps you migrate from [vue-select](https://github.com/sagalbot/vue-select) (v3) to vue-superselect. The migration covers prop mapping, code transformations, and feature differences.

<script setup>
import MigrationAfterDemo from '../examples/MigrationAfterDemo.vue'
</script>

## Why Migrate?

vue-select has been abandoned since 2022 with no Vue 3 Composition API support, no TypeScript types, and no tree-shaking. vue-superselect is a ground-up replacement built for modern Vue:

- **TypeScript-first** with full generic inference
- **Headless** -- zero shipped CSS, full control over styling
- **Tree-shakeable** -- only ship the components you use
- **Accessible** -- WAI-ARIA combobox pattern with keyboard navigation
- **Dual API** -- compound components or composable with prop getters

## Prop Mapping

| vue-select Prop | vue-superselect Equivalent | Notes |
|-----------------|---------------------------|-------|
| `options` | `items` prop on SelectRoot | Or use SelectOption children directly |
| `value` / `v-model` | `v-model` on SelectRoot | Same pattern |
| `multiple` | `multiple` on SelectRoot | Same |
| `label` | `label-key` on SelectRoot | Renamed for clarity |
| `reduce` | `value-key` on SelectRoot | Extracts value from object |
| `filterable` / `searchable` | Always searchable via SelectInput | Omit SelectInput to disable search |
| `clearable` | Use SelectClear component | Declarative, not a boolean prop |
| `disabled` | `disabled` on SelectRoot | Same |
| `placeholder` | `placeholder` on SelectRoot or SelectInput | Same |
| `closeOnSelect` | Automatic | Single select closes on pick, multi stays open |
| `selectOnTab` | `select-on-tab` on SelectRoot | Same concept |
| `filter` / `filterBy` | `filter` prop on SelectRoot | Custom filter function |
| `getOptionLabel` | `label-key` or `resolve-label` | Different API surface |
| `getOptionKey` | `:key` on SelectOption | Standard Vue key binding |
| `maxHeight` | Style your SelectContent | Headless: you control CSS |
| `transition` | Vue `<Transition>` around SelectContent | Headless: you control transitions |
| `appendToBody` | `teleport` prop on SelectContent | Uses Vue Teleport internally |
| `components` (slot overrides) | Named slots on compound components | Fully composable via slots |
| `loading` | Not yet supported | -- |
| `taggable` / `pushTags` | Not yet supported | -- |
| `noDrop` | Not yet supported | -- |

## Before/After Examples

### Basic Single Select

**vue-select:**

```vue
<template>
  <v-select
    v-model="selected"
    :options="['Apple', 'Banana', 'Cherry']"
    placeholder="Pick a fruit..."
  />
</template>

<script>
export default {
  data() {
    return { selected: null }
  }
}
</script>
```

**vue-superselect:**

:::tabs key:api-style
== Composition API

```vue
<script setup>
import { ref } from 'vue'
import {
  SelectRoot, SelectControl, SelectInput,
  SelectContent, SelectOption
} from 'vue-superselect'

const selected = ref(null)
const fruits = ['Apple', 'Banana', 'Cherry']
</script>

<template>
  <SelectRoot v-model="selected">
    <SelectControl>
      <SelectInput placeholder="Pick a fruit..." aria-label="Fruit" />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="fruit in fruits"
        :key="fruit"
        :value="fruit"
        :label="fruit"
      />
    </SelectContent>
  </SelectRoot>
</template>
```

== Options API

```vue
<script>
import {
  SelectRoot, SelectControl, SelectInput,
  SelectContent, SelectOption
} from 'vue-superselect'

export default {
  components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
  data() {
    return {
      selected: null,
      fruits: ['Apple', 'Banana', 'Cherry']
    }
  }
}
</script>

<template>
  <SelectRoot v-model="selected">
    <SelectControl>
      <SelectInput placeholder="Pick a fruit..." aria-label="Fruit" />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="fruit in fruits"
        :key="fruit"
        :value="fruit"
        :label="fruit"
      />
    </SelectContent>
  </SelectRoot>
</template>
```

:::

### Multi-Select with Tags

**vue-select:**

```vue
<template>
  <v-select
    v-model="selected"
    :options="languages"
    multiple
    placeholder="Choose languages..."
  />
</template>

<script>
export default {
  data() {
    return {
      selected: [],
      languages: ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go']
    }
  }
}
</script>
```

**vue-superselect:**

:::tabs key:api-style
== Composition API

```vue
<script setup>
import { ref } from 'vue'
import {
  SelectRoot, SelectControl, SelectInput,
  SelectContent, SelectOption, SelectTag
} from 'vue-superselect'

const selected = ref([])
const languages = ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go']
</script>

<template>
  <SelectRoot v-model="selected" multiple>
    <SelectControl v-slot="{ selectedItems, removeItem }">
      <SelectTag
        v-for="item in selectedItems"
        :key="String(item.value)"
        :value="item.value"
        :label="item.label"
        @remove="removeItem(item.value)"
      />
      <SelectInput placeholder="Choose languages..." aria-label="Languages" />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="lang in languages"
        :key="lang"
        :value="lang"
        :label="lang"
      />
    </SelectContent>
  </SelectRoot>
</template>
```

== Options API

```vue
<script>
import {
  SelectRoot, SelectControl, SelectInput,
  SelectContent, SelectOption, SelectTag
} from 'vue-superselect'

export default {
  components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption, SelectTag },
  data() {
    return {
      selected: [],
      languages: ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go']
    }
  }
}
</script>

<template>
  <SelectRoot v-model="selected" multiple>
    <SelectControl v-slot="{ selectedItems, removeItem }">
      <SelectTag
        v-for="item in selectedItems"
        :key="String(item.value)"
        :value="item.value"
        :label="item.label"
        @remove="removeItem(item.value)"
      />
      <SelectInput placeholder="Choose languages..." aria-label="Languages" />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="lang in languages"
        :key="lang"
        :value="lang"
        :label="lang"
      />
    </SelectContent>
  </SelectRoot>
</template>
```

:::

### Custom Option Rendering

**vue-select:**

```vue
<template>
  <v-select
    v-model="selected"
    :options="users"
    label="name"
  >
    <template #option="{ name, email }">
      <strong>{{ name }}</strong>
      <br>
      <small>{{ email }}</small>
    </template>
  </v-select>
</template>
```

**vue-superselect:**

:::tabs key:api-style
== Composition API

```vue
<script setup>
import { ref } from 'vue'
import {
  SelectRoot, SelectControl, SelectInput,
  SelectContent, SelectOption
} from 'vue-superselect'

const selected = ref(null)
const users = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
]
</script>

<template>
  <SelectRoot v-model="selected" :items="users" label-key="name">
    <SelectControl>
      <SelectInput placeholder="Search users..." aria-label="Users" />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="user in users"
        :key="user.email"
        :value="user"
        :label="user.name"
        v-slot="{ selected: isSelected }"
      >
        <div>
          <strong>{{ user.name }}</strong>
          <br>
          <small>{{ user.email }}</small>
        </div>
      </SelectOption>
    </SelectContent>
  </SelectRoot>
</template>
```

== Options API

```vue
<script>
import {
  SelectRoot, SelectControl, SelectInput,
  SelectContent, SelectOption
} from 'vue-superselect'

export default {
  components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
  data() {
    return {
      selected: null,
      users: [
        { name: 'Alice', email: 'alice@example.com' },
        { name: 'Bob', email: 'bob@example.com' },
      ]
    }
  }
}
</script>

<template>
  <SelectRoot v-model="selected" :items="users" label-key="name">
    <SelectControl>
      <SelectInput placeholder="Search users..." aria-label="Users" />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="user in users"
        :key="user.email"
        :value="user"
        :label="user.name"
        v-slot="{ selected: isSelected }"
      >
        <div>
          <strong>{{ user.name }}</strong>
          <br>
          <small>{{ user.email }}</small>
        </div>
      </SelectOption>
    </SelectContent>
  </SelectRoot>
</template>
```

:::

### Programmatic Control

**vue-select:**

```vue
<template>
  <div>
    <v-select ref="select" v-model="selected" :options="items" />
    <button @click="$refs.select.open = true">Open</button>
    <button @click="$refs.select.clearSelection()">Clear</button>
  </div>
</template>
```

**vue-superselect:**

:::tabs key:api-style
== Composition API

```vue
<script setup>
import { ref } from 'vue'
import {
  SelectRoot, SelectControl, SelectInput,
  SelectContent, SelectOption
} from 'vue-superselect'

const selected = ref(null)
const selectRef = ref(null)
const items = ['Apple', 'Banana', 'Cherry']
</script>

<template>
  <SelectRoot ref="selectRef" v-model="selected">
    <SelectControl>
      <SelectInput placeholder="Pick a fruit..." aria-label="Fruit" />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="item in items"
        :key="item"
        :value="item"
        :label="item"
      />
    </SelectContent>
  </SelectRoot>
  <button @click="selectRef?.open()">Open</button>
  <button @click="selectRef?.clear()">Clear</button>
  <button @click="selectRef?.focus()">Focus</button>
</template>
```

== Options API

```vue
<script>
import {
  SelectRoot, SelectControl, SelectInput,
  SelectContent, SelectOption
} from 'vue-superselect'

export default {
  components: { SelectRoot, SelectControl, SelectInput, SelectContent, SelectOption },
  data() {
    return {
      selected: null,
      items: ['Apple', 'Banana', 'Cherry']
    }
  },
  methods: {
    openSelect() { this.$refs.selectRef.open() },
    clearSelect() { this.$refs.selectRef.clear() },
    focusSelect() { this.$refs.selectRef.focus() },
  }
}
</script>

<template>
  <SelectRoot ref="selectRef" v-model="selected">
    <SelectControl>
      <SelectInput placeholder="Pick a fruit..." aria-label="Fruit" />
    </SelectControl>
    <SelectContent>
      <SelectOption
        v-for="item in items"
        :key="item"
        :value="item"
        :label="item"
      />
    </SelectContent>
  </SelectRoot>
  <button @click="openSelect">Open</button>
  <button @click="clearSelect">Clear</button>
  <button @click="focusSelect">Focus</button>
</template>
```

:::

## Live Migration Demo

Here is the vue-superselect version in action:

<ClientOnly>
  <DemoBox title="Migrated Select">
    <MigrationAfterDemo />
    <template #source>

<<< ../examples/MigrationAfterDemo.vue

  </template>
  </DemoBox>
</ClientOnly>

## Unsupported Features

The following vue-select features are **not yet supported** in vue-superselect:

| Feature | vue-select Prop | Status |
|---------|----------------|--------|
| Loading indicator | `loading` | Not yet supported |
| Create new options | `taggable` / `pushTags` / `createOption` | Not yet supported |
| Suppress dropdown | `noDrop` | Not yet supported |

## Key Differences

1. **Headless by default.** vue-superselect ships zero CSS. You must provide all styling. This gives you complete design control but requires more initial setup.

2. **Compound components.** Instead of a single monolithic component with many props, vue-superselect uses composable building blocks. Each piece (control, input, content, option, tag) is a separate component.

3. **TypeScript generics.** Full type inference flows through from your data type to slot props. No manual type assertions needed.

4. **Accessibility built-in.** WAI-ARIA combobox pattern, keyboard navigation, and screen reader announcements are included by default.

## Getting Help

If you run into issues during migration, please [open an issue on GitHub](https://github.com/nemanjamalesija/vue-superselect/issues).
