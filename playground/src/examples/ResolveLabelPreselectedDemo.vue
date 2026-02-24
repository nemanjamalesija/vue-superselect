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
 * Example: Preselected IDs resolved from root items.
 *
 * Why this exists:
 * - Shows stable labels before first open when selected values are raw IDs.
 * - Demonstrates Phase 6 root-items auto label resolution.
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
</script>

<template>
  <section class="card">
    <header>
      <h2>Preselected IDs via root items</h2>
      <p>
        Tags stay readable while closed because <code>items</code> +
        <code>label-key</code>/<code>value-key</code> resolve IDs to labels on
        mount, without a custom resolver.
      </p>
    </header>

    <SelectRoot
      id="playground-resolve-label"
      v-model="values"
      multiple
      :items="options"
      label-key="label"
      value-key="id"
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

      <SelectContent force-absolute class="content content-inline-flow">
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
