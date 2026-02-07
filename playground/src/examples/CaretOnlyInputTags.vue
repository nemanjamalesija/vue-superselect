<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SelectRoot,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectControl,
  SelectTag,
  SelectEmpty,
  SelectLiveRegion,
} from 'vue-superselect'

/**
 * Example: Caret-only input presentation.
 *
 * Why this exists:
 * - Some UIs want tags + caret only, without placeholder or input chrome.
 * - The real input remains mounted for keyboard/filter/ARIA behavior.
 */

type Option = {
  id: string
  label: string
}

const options: Option[] = [
  { id: 'zg', label: 'Zagreb-Gric (DHMZ)' },
  { id: 'dm', label: 'Demo - DEMO1 (bar)' },
  { id: 'd2', label: 'Demo - DEMO2 (m3)' },
  { id: 'vd', label: 'Voda' },
]

const values = ref<string[]>(['dm', 'zg'])

const optionLabelById = new Map(options.map((option) => [option.id, option.label]))

const resolveLabel = (value: unknown) => optionLabelById.get(String(value))

const selectedCount = computed(() => values.value.length)
</script>

<template>
  <section class="card">
    <header>
      <h2>Caret-only input with tags</h2>
      <p>
        Input is still present for keyboard and filtering, but visually reduced
        to a caret area next to tags.
      </p>
    </header>

    <SelectRoot
      v-model="values"
      multiple
      id="playground-caret-only"
      :resolveLabel="resolveLabel"
    >
      <SelectControl v-slot="{ selectedItems, removeItem }" class="control control-with-tags">
        <SelectTag
          v-for="item in selectedItems"
          :key="String(item.value)"
          :value="item.value"
          :label="item.label"
          class="inline-tag"
          @remove="removeItem"
        />
        <SelectInput
          class="input input-inline input-caret-only"
          placeholder=""
          aria-label="Search options"
        />
      </SelectControl>

      <SelectContent class="content">
        <SelectOption
          v-for="option in options"
          :id="`caret-${option.id}`"
          :key="option.id"
          :value="option.id"
          :label="option.label"
          class="option"
        >
          {{ option.label }}
        </SelectOption>
        <SelectEmpty class="empty">No matching option</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <p class="note">Selected: {{ selectedCount }}</p>
  </section>
</template>
