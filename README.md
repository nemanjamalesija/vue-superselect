# vue-superselect

Headless Vue 3 select/combobox component library.

## Minimal Example (Single Select)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectControl,
  SelectTrigger,
  SelectClear,
  SelectEmpty,
} from 'vue-superselect'

const value = ref<string | null>(null)
const options = [
  { id: 'a', label: 'Apple' },
  { id: 'b', label: 'Banana' },
  { id: 'c', label: 'Cherry' },
]
</script>

<template>
  <SelectRoot v-model="value" id="fruits">
    <SelectControl>
      <SelectInput placeholder="Search..." />
      <SelectTrigger>Toggle</SelectTrigger>
      <SelectClear>Clear</SelectClear>
    </SelectControl>

    <SelectContent>
      <SelectOption
        v-for="opt in options"
        :key="opt.id"
        :id="opt.id"
        :value="opt.label"
        :label="opt.label"
      >
        {{ opt.label }}
      </SelectOption>

      <SelectEmpty>No results</SelectEmpty>
    </SelectContent>
  </SelectRoot>
</template>
```

