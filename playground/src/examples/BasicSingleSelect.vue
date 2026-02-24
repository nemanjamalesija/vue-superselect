<script setup lang="ts">
import { computed, ref } from 'vue'
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
import SelectDebug from '../components/SelectDebug.vue'

/**
 * Example: Basic single select with search.
 *
 * Why this exists:
 * - Demonstrates the core stack of components that make the select work.
 * - Shows how query filtering and keyboard navigation behave together.
 * - Keeps all state in one place so the UI can be inspected in devtools.
 *
 * Component mapping:
 * - SelectRoot: owns value, open state, query, and collection registry.
 * - SelectControl: wrapper that receives data-state for styling.
 * - SelectInput: drives filtering and keyboard navigation.
 * - SelectTrigger: toggles the listbox open/closed.
 * - SelectClear: resets value and query.
 * - SelectContent/SelectOption: renders the listbox and options.
 * - SelectEmpty: shows the empty state when filtering removes all items.
 * - SelectLiveRegion: announces open/close and result count for SR users.
 */

type FruitOption = {
  id: string
  label: string
  disabled?: boolean
}

const options: FruitOption[] = [
  { id: 'ap', label: 'Apple' },
  { id: 'bn', label: 'Banana' },
  { id: 'ch', label: 'Cherry' },
  { id: 'gr', label: 'Grape', disabled: true },
  { id: 'or', label: 'Orange' },
  { id: 'pe', label: 'Peach' },
]

// Selected option id. Null means "no selection yet".
const value = ref<string | null>(null)
// Controlled open state so we can visualize it in the UI.
const open = ref(false)

// Derived label for the trigger button.
const selectedLabel = computed(() => {
  const match = options.find((option) => option.id === value.value)
  return match?.label ?? 'Pick a fruit'
})
</script>

<template>
  <section class="card">
    <header>
      <h2>Searchable single select</h2>
      <p>Type to filter, arrow keys to navigate, and clear to reset.</p>
    </header>

    <SelectRoot id="playground-basic" v-model="value" v-model:open="open">
      <SelectDebug />
      <SelectControl class="control">
        <SelectInput class="input" placeholder="Search fruits" />
        <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
        <SelectClear v-if="value !== null" class="clear">Clear</SelectClear>
      </SelectControl>

      <SelectContent force-absolute class="content content-inline-flow">
        <SelectOption
          v-for="option in options"
          :id="`basic-${option.id}`"
          :key="option.id"
          v-slot="{ selected, active, disabled }"
          :value="option.id"
          :label="option.label"
          :disabled="option.disabled"
          class="option"
        >
          <span>{{ option.label }}</span>
          <span class="option-state">
            <span v-if="disabled">Disabled</span>
            <span v-else-if="selected">Selected</span>
            <span v-else-if="active">Active</span>
          </span>
        </SelectOption>

        <SelectEmpty class="empty">No results</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <div class="meta">
      <div>Value: {{ value ?? 'null' }}</div>
      <div>Open: {{ open }}</div>
    </div>
  </section>
</template>
