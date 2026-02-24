# vue-superselect

Headless Vue 3 select/combobox component library.

## Install

```bash
npm install vue-superselect
```

## What Works Today

- Single-select with filtering, keyboard navigation, clear, and live region updates.
- Multi-select via `multiple` with array `v-model`.
- Tag rendering via `SelectTag` + `SelectControl` scoped slot (`selectedItems`, `removeItem`).
- Tag removal via remove button or Backspace (when input query is empty).
- Multi-select clear-all behavior via `SelectClear`.
- `max` selection limits (at max, unselected options are disabled).
- `hideSelected` to hide selected options from the dropdown.

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

## Quick Start (Multi Select With max + hideSelected)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectTag,
  SelectClear,
  SelectContent,
  SelectOption,
  SelectEmpty,
} from 'vue-superselect'

const values = ref<string[]>([])
const options = [
  { id: 'nm', label: 'Nina Maric' },
  { id: 'tk', label: 'Theo King' },
  { id: 'as', label: 'Ava Stone' },
]
</script>

<template>
  <SelectRoot
    v-model="values"
    multiple
    :max="2"
    :hideSelected="true"
    id="team"
  >
    <SelectControl v-slot="{ selectedItems, removeItem }">
      <SelectTag
        v-for="item in selectedItems"
        :key="String(item.value)"
        :value="item.value"
        :label="item.label"
        @remove="removeItem"
      />
      <SelectInput placeholder="Pick teammates" />
      <SelectClear v-if="values.length > 0">Clear all</SelectClear>
    </SelectControl>

    <SelectContent>
      <SelectOption
        v-for="opt in options"
        :key="opt.id"
        :id="`team-${opt.id}`"
        :value="opt.id"
        :label="opt.label"
      >
        {{ opt.label }}
      </SelectOption>
      <SelectEmpty>No results</SelectEmpty>
    </SelectContent>
  </SelectRoot>
</template>
```

## Core Components

- `SelectRoot`
- `SelectControl`
- `SelectInput`
- `SelectTrigger`
- `SelectClear`
- `SelectContent`
- `SelectOption`
- `SelectTag`
- `SelectEmpty`
- `SelectLiveRegion`

## Composable API (Advanced)

```ts
import { useSelect } from 'vue-superselect'

const select = useSelect({
  id: 'fruits',
  defaultValue: null,
  multiple: false,
})

const rootProps = select.getRootProps()
const inputProps = select.getInputProps()
const listboxProps = select.getListboxProps()
```

## Playground (Local)

```bash
npm run playground
```

Then open:

- `#/multi-all-features` for a full multi-select capability demo

The playground lives in `playground/` and is not part of the published package.

## Accessibility

- WAI-ARIA combobox/listbox roles and attributes.
- Virtual focus via `aria-activedescendant`.
- Keyboard navigation: Arrow keys, Home/End, Enter, Escape.
- Live region announcements for open/close, result count, and multi-select add/remove.

## Current Status

This project is in **alpha** (`0.1.0-alpha.0`).

The package is not published yet. Use the local playground to test current
behavior while development continues.
