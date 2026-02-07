<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectControl,
  SelectTag,
  SelectClear,
  SelectEmpty,
  SelectLiveRegion,
} from 'vue-superselect'

/**
 * Example: Preselected IDs with resolveLabel.
 *
 * Why this exists:
 * - Shows stable labels before first open when selected values are raw IDs.
 * - Demonstrates intended usage of `SelectRoot.resolveLabel`.
 */

type Option = {
  id: string
  label: string
}

const options: Option[] = [
  { id: 'zgr', label: 'Zagreb-Gric (DHMZ)' },
  { id: 'dem1', label: 'Demo - DEMO1 (bar)' },
  { id: 'dem2', label: 'Demo - DEMO2 (m3)' },
  { id: 'voda', label: 'Voda' },
]

const values = ref<string[]>(['dem1', 'zgr'])
const labelById = new Map(options.map((option) => [option.id, option.label]))
const resolveLabel = (value: unknown) => labelById.get(String(value))
</script>

<template>
  <section class="card">
    <header>
      <h2>Preselected IDs via resolveLabel</h2>
      <p>
        Tags stay readable while closed because `resolveLabel` maps selected IDs
        to display labels before options mount.
      </p>
    </header>

    <SelectRoot
      id="playground-resolve-label"
      v-model="values"
      multiple
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
        <SelectInput class="input input-inline" placeholder="Search sources" />
        <SelectClear v-if="values.length > 0" class="clear">Clear</SelectClear>
      </SelectControl>

      <SelectContent class="content">
        <SelectOption
          v-for="option in options"
          :id="`resolve-${option.id}`"
          :key="option.id"
          :value="option.id"
          :label="option.label"
          class="option"
        >
          {{ option.label }}
        </SelectOption>
        <SelectEmpty class="empty">No match</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <div class="meta">
      <div>Values: {{ JSON.stringify(values) }}</div>
    </div>
  </section>
</template>
