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
 * Example: Styling via data attributes.
 *
 * Why this exists:
 * - The library adds data-state/data-selected/data-highlighted/data-disabled.
 * - Designers can style states without threading extra reactive state.
 *
 * Real-world use:
 * - Build a branded UI without coupling visuals to internal state.
 * - Keep templates lean while still supporting rich CSS interactions.
 */

type Option = {
  id: string
  label: string
  disabled?: boolean
}

const options: Option[] = [
  { id: 'in', label: 'In progress' },
  { id: 'rv', label: 'In review' },
  { id: 'dn', label: 'Done' },
  { id: 'bk', label: 'Blocked', disabled: true },
]

// Selected status id.
const value = ref<string | null>(null)

// Trigger label based on selection.
const selectedLabel = computed(() => {
  const match = options.find((option) => option.id === value.value)
  return match?.label ?? 'Set status'
})
</script>

<template>
  <section class="card">
    <header>
      <h2>Styled by data attributes</h2>
      <p>
        The select injects `data-state`, `data-selected`, `data-highlighted`, and
        `data-disabled` so you can style without extra state.
      </p>
    </header>

    <SelectRoot id="playground-data" v-model="value">
      <SelectControl class="control">
        <SelectInput class="input" placeholder="Filter statuses" />
        <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
      </SelectControl>

      <SelectContent force-absolute class="content">
        <SelectOption
          v-for="option in options"
          :id="`status-${option.id}`"
          :key="option.id"
          v-slot="{ selected, disabled }"
          :value="option.id"
          :label="option.label"
          :disabled="option.disabled"
          class="option"
        >
          <span>{{ option.label }}</span>
          <span v-if="disabled" class="option-state">Locked</span>
          <span v-else-if="selected" class="option-state">Chosen</span>
        </SelectOption>

        <SelectEmpty class="empty">No matching status</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <p class="note">
      Try hovering options or filtering to see how the CSS reacts to the data
      attributes.
    </p>
  </section>
</template>
