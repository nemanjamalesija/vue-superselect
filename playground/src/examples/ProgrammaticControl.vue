<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SelectRoot,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectControl,
  SelectTrigger,
  SelectLiveRegion,
} from 'vue-superselect'

/**
 * Example: Programmatic open/close/toggle.
 *
 * Why this exists:
 * - Shows how parent code can drive the select without user interaction.
 * - Demonstrates the expose() API from SelectRoot (open/close/toggle).
 *
 * Real-world use:
 * - Open the list when a user focuses a related form field.
 * - Close the list after a background validation passes.
 * - Toggle from a custom toolbar or keybinding outside the select itself.
 */

type CityOption = {
  id: string
  label: string
}

type SelectRootExpose = {
  open: () => void
  close: () => void
  toggle: () => void
}

const options: CityOption[] = [
  { id: 'nyc', label: 'New York' },
  { id: 'lon', label: 'London' },
  { id: 'rom', label: 'Rome' },
  { id: 'tok', label: 'Tokyo' },
  { id: 'syd', label: 'Sydney' },
]

// Selected city id. Null means no selection.
const value = ref<string | null>(null)
// Controlled open state, wired to v-model:open.
const open = ref(false)
// Access the SelectRoot exposed API (open/close/toggle).
const selectRef = ref<SelectRootExpose | null>(null)

// Trigger label based on selection.
const selectedLabel = computed(() => {
  const match = options.find((option) => option.id === value.value)
  return match?.label ?? 'Choose a city'
})

// External controls use the exposed API.
const openList = () => selectRef.value?.open()
const closeList = () => selectRef.value?.close()
const toggleList = () => selectRef.value?.toggle()
</script>

<template>
  <section class="card">
    <header>
      <h2>Programmatic control</h2>
      <p>Use the exposed API to open, close, or toggle the listbox.</p>
    </header>

    <div class="toolbar">
      <button class="pill" type="button" @click="openList">Open</button>
      <button class="pill secondary" type="button" @click="closeList">Close</button>
      <button class="pill" type="button" @click="toggleList">Toggle</button>
    </div>

    <SelectRoot
      id="playground-programmatic"
      ref="selectRef"
      v-model="value"
      v-model:open="open"
    >
      <SelectControl class="control">
        <SelectInput class="input" placeholder="Search cities" />
        <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
      </SelectControl>

      <SelectContent force-absolute class="content content-inline-flow">
        <SelectOption
          v-for="option in options"
          :id="`city-${option.id}`"
          :key="option.id"
          v-slot="{ selected }"
          :value="option.id"
          :label="option.label"
          class="option"
        >
          <span>{{ option.label }}</span>
          <span v-if="selected" class="option-state">Selected</span>
        </SelectOption>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <p class="note">Open state: {{ open }}</p>
  </section>
</template>
