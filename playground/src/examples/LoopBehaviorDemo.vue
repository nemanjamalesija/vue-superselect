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
 * Example: Non-loop keyboard navigation.
 *
 * Why this exists:
 * - Demonstrates `loop={false}` behavior at list boundaries.
 * - Useful for UIs where wrap-around navigation is undesirable.
 */

type Option = {
  id: string
  label: string
}

const options: Option[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
  { id: 'd', label: 'Delta' },
]

const value = ref<string | null>(null)
const open = ref(false)

const selectedLabel = computed(() => {
  const match = options.find((option) => option.id === value.value)
  return match?.label ?? 'Pick letter'
})
</script>

<template>
  <section class="card">
    <header>
      <h2>Loop disabled</h2>
      <p>
        With `loop` set to `false`, ArrowUp/ArrowDown stop at the first and last
        option instead of wrapping around.
      </p>
    </header>

    <SelectRoot
      id="playground-loop-disabled"
      v-model="value"
      v-model:open="open"
      :loop="false"
    >
      <SelectControl class="control">
        <SelectInput class="input" placeholder="Use arrow keys" />
        <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
      </SelectControl>

      <SelectContent force-absolute class="content">
        <SelectOption
          v-for="option in options"
          :id="`loop-${option.id}`"
          :key="option.id"
          v-slot="{ selected, active }"
          :value="option.id"
          :label="option.label"
          class="option"
        >
          <span>{{ option.label }}</span>
          <span class="option-state">
            <span v-if="selected">Selected</span>
            <span v-else-if="active">Active</span>
          </span>
        </SelectOption>
        <SelectEmpty class="empty">No results</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <div class="meta">
      <div>loop: false</div>
      <div>Value: {{ value ?? 'null' }}</div>
      <div>Open: {{ open }}</div>
    </div>
  </section>
</template>
