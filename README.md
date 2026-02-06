# vue-superselect

Headless Vue 3 select/combobox component library.

## Quick Start (Single Select)

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
  SelectLiveRegion,
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

    <SelectLiveRegion />
  </SelectRoot>
</template>
```

## Core Components

- `SelectRoot` — state provider (v-model, open/close, filtering)
- `SelectControl` — wrapper for input/trigger/clear
- `SelectInput` — text input with keyboard/IME support
- `SelectTrigger` — toggles open/close
- `SelectClear` — resets selection and query
- `SelectContent` — listbox container
- `SelectOption` — option item with registration
- `SelectEmpty` — empty state
- `SelectLiveRegion` — screen reader announcements

## Composable API (advanced)

```ts
import { useSelect } from 'vue-superselect'

const select = useSelect({
  id: 'fruits',
  defaultValue: null,
})

const rootProps = select.getRootProps()
const inputProps = select.getInputProps()
const listboxProps = select.getListboxProps()
```

You can render your own markup and spread these props onto any elements.

## Accessibility

- Follows WAI‑ARIA combobox pattern
- Uses `aria-activedescendant` (virtual focus)
- Live region announces open/close and result count
- Full keyboard navigation (Arrow keys, Home/End)

## Status

This project is in **alpha** (`0.1.0-alpha.0`). The API may change.
