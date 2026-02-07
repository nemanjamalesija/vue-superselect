<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SelectRoot,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectControl,
  SelectTrigger,
  SelectEmpty,
  SelectLiveRegion,
} from 'vue-superselect'

/**
 * Example: Scrollable dropdown content.
 *
 * Why this exists:
 * - Long option lists should stay usable without pushing the page layout.
 * - This demo keeps scroll behavior local via scoped CSS.
 */

type Option = {
  id: string
  label: string
}

const options: Option[] = [
  { id: 'c01', label: 'Amsterdam' },
  { id: 'c02', label: 'Athens' },
  { id: 'c03', label: 'Barcelona' },
  { id: 'c04', label: 'Belgrade' },
  { id: 'c05', label: 'Berlin' },
  { id: 'c06', label: 'Brussels' },
  { id: 'c07', label: 'Budapest' },
  { id: 'c08', label: 'Copenhagen' },
  { id: 'c09', label: 'Dublin' },
  { id: 'c10', label: 'Helsinki' },
  { id: 'c11', label: 'Lisbon' },
  { id: 'c12', label: 'Ljubljana' },
  { id: 'c13', label: 'London' },
  { id: 'c14', label: 'Madrid' },
  { id: 'c15', label: 'Milan' },
  { id: 'c16', label: 'Oslo' },
  { id: 'c17', label: 'Paris' },
  { id: 'c18', label: 'Prague' },
  { id: 'c19', label: 'Rome' },
  { id: 'c20', label: 'Stockholm' },
  { id: 'c21', label: 'Vienna' },
  { id: 'c22', label: 'Warsaw' },
  { id: 'c23', label: 'Zagreb' },
  { id: 'c24', label: 'Zurich' },
]

const value = ref<string | null>(null)

const selectedLabel = computed(() => {
  const match = options.find((option) => option.id === value.value)
  return match?.label ?? 'Pick a city'
})
</script>

<template>
  <section class="card">
    <header>
      <h2>Scrollable dropdown list</h2>
      <p>
        This route demonstrates a long list that scrolls inside the listbox.
        The scroll styling is local to this file via scoped CSS.
      </p>
    </header>

    <SelectRoot id="playground-scroll-content" v-model="value">
      <SelectControl class="control">
        <SelectInput class="input" placeholder="Search cities" />
        <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
      </SelectControl>

      <SelectContent class="content scrollable-content">
        <SelectOption
          v-for="option in options"
          :id="`scroll-${option.id}`"
          :key="option.id"
          :value="option.id"
          :label="option.label"
          class="option"
        >
          {{ option.label }}
        </SelectOption>

        <SelectEmpty class="empty">No matching city</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>
  </section>
</template>

<style scoped>
.scrollable-content {
  max-height: 280px;
  overflow-y: auto;
}
</style>
