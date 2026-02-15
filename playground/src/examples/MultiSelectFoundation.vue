<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SelectRoot,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectControl,
  SelectTag,
  SelectTrigger,
  SelectEmpty,
  SelectLiveRegion,
} from 'vue-superselect'

/**
 * Example: Multi-select foundation with tag removal (Phase 04-03).
 *
 * Why this exists:
 * - Shows that `multiple` switches v-model to an array.
 * - Demonstrates toggle behavior (click again to deselect).
 * - Confirms listbox stays open and query clears between picks.
 * - Confirms Backspace removes the last tag when search is empty.
 *
 */

type TeammateOption = {
  id: string
  label: string
}

const options: TeammateOption[] = [
  { id: 'nm', label: 'Nina Maric' },
  { id: 'tk', label: 'Theo King' },
  { id: 'as', label: 'Ava Stone' },
  { id: 'lp', label: 'Liam Park' },
  { id: 'zr', label: 'Zoe Reid' },
]

const values = ref<string[]>([])
const open = ref(false)

const selectedLabel = computed(() =>
  values.value.length === 0 ? 'Pick teammates' : `${values.value.length} selected`,
)

const clearAll = () => {
  values.value = []
}
</script>

<template>
  <section class="card">
    <header>
      <h2>Multi-select foundation</h2>
      <p>
        `multiple` uses array v-model, keeps the list open after selection, and
        lets users toggle options in place. With an empty query, Backspace removes
        the last selected tag.
      </p>
    </header>

    <SelectRoot
      id="playground-multi-foundation"
      v-model="values"
      v-model:open="open"
      multiple
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

        <SelectInput class="input input-inline" placeholder="Search teammates" />
        <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
        <button
          v-if="values.length > 0"
          type="button"
          class="clear"
          @click="clearAll"
        >
          Reset
        </button>
      </SelectControl>

      <SelectContent class="content">
        <SelectOption
          v-for="option in options"
          :id="`team-${option.id}`"
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

        <SelectEmpty class="empty">No teammates found</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <p class="note">
      Tags are rendered in-control using SelectControl scoped slot data. Press
      Backspace in an empty input to remove the last tag.
    </p>

    <div class="meta">
      <div>Values: {{ JSON.stringify(values) }}</div>
      <div>Open: {{ open }}</div>
    </div>
  </section>
</template>
