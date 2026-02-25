# vue-superselect

Headless, accessible, TypeScript-first select/combobox for Vue 3.

Zero runtime CSS. Full keyboard navigation. WAI-ARIA combobox pattern. Dual API: compound components or `useSelect()` composable.

**[Documentation](https://nemanjamalesija.github.io/vue-superselect/)**

## Install

```bash
npm install vue-superselect
```

Vue 3.5+ required. `@floating-ui/vue` is an optional peer dependency for smart dropdown positioning.

## Quick Start

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
} from 'vue-superselect'

const selected = ref<string | null>(null)
const fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Orange']
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
      >
        {{ fruit }}
      </SelectOption>
    </SelectContent>
  </SelectRoot>
</template>
```

The library ships zero CSS. Add your own classes and styles.

## Features

- **Headless**: no shipped CSS, full control over rendering via scoped slots
- **Accessible**: WAI-ARIA combobox pattern, keyboard navigation, screen reader announcements
- **TypeScript**: strict mode, full generic inference, typed props and slots
- **Single and multi-select**: `v-model` with `multiple`, tags, max limits, `hideSelected`
- **Filtering**: built-in case-insensitive filter, custom filter functions, debounce, IME-safe
- **Positioning**: optional `@floating-ui/vue` integration with auto-flip, teleport support
- **Composable API**: `useSelect<T>()` with prop getters for full DOM control
- **Tree-shakeable**: `sideEffects: false`, ESM + CJS builds, `/*#__PURE__*/` annotations

## Components

| Component | Purpose |
|-----------|---------|
| `SelectRoot` | State container. Manages selection, filtering, keyboard, and ARIA. |
| `SelectControl` | Wrapper around the input/tags area. |
| `SelectInput` | Search/filter input field. |
| `SelectContent` | Dropdown container with positioning. |
| `SelectOption` | Individual selectable option with scoped slot props. |
| `SelectTag` | Removable tag for multi-select. |
| `SelectTrigger` | Toggle button for the dropdown. |
| `SelectClear` | Button to clear the current selection. |
| `SelectEmpty` | Shown when no options match the filter. |
| `SelectLiveRegion` | Screen reader announcements. |

## Composable API

For full control over the rendered DOM:

```ts
import { useSelect } from 'vue-superselect'

const {
  getRootProps,
  getInputProps,
  getListboxProps,
  getOptionProps,
  isOpen,
  value,
  visibleItems,
} = useSelect({
  items: options,
  labelKey: 'label',
  valueKey: 'id',
})
```

Spread prop getters on your own elements:

```vue-html
<div v-bind="getRootProps()">
  <input v-bind="getInputProps()" />
  <ul v-bind="getListboxProps()">
    <li v-for="item in visibleItems" :key="item.id" v-bind="getOptionProps(item)">
      {{ item.label }}
    </li>
  </ul>
</div>
```

## Keyboard Navigation

| Key | Action |
|-----|--------|
| Arrow Down/Up | Navigate options |
| Enter | Select highlighted option |
| Escape | Close dropdown; pressing again clears input query |
| Tab | Move focus (or select highlighted option when `selectOnTab` is enabled) |
| Backspace | Remove last tag (multi-select, empty input) |
| Home/End | Jump to first/last option |

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge). No IE11.

## License

MIT
