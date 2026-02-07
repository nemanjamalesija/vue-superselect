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
 * Example: Multi-select state foundation (Phase 04-01).
 *
 * Why this exists:
 * - Shows that `multiple` switches v-model to an array.
 * - Demonstrates toggle behavior (click again to deselect).
 * - Confirms listbox stays open and query clears between picks.
 *
 * Note:
 * - Tag components land in Phase 04-02. This example uses a manual selected
 *   preview so array behavior is still visible today.
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

const selectedTeammates = computed(() =>
  options.filter((option) => values.value.some((id) => Object.is(id, option.id))),
)

const clearAll = () => {
  values.value = []
}

const removeSelected = (id: string) => {
  values.value = values.value.filter((value) => !Object.is(value, id))
}
</script>

<template>
  <section class="card">
    <header>
      <h2>Multi-select foundation</h2>
      <p>
        `multiple` uses array v-model, keeps the list open after selection, and
        lets users toggle options in place.
      </p>
    </header>

    <SelectRoot
      id="playground-multi-foundation"
      v-model="values"
      v-model:open="open"
      multiple
    >
      <SelectControl class="control">
        <SelectInput class="input" placeholder="Search teammates" />
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

    <div v-if="selectedTeammates.length > 0" class="chip-row">
      <button
        v-for="member in selectedTeammates"
        :key="member.id"
        type="button"
        class="chip-remove"
        @click="removeSelected(member.id)"
      >
        {{ member.label }} ×
      </button>
    </div>

    <p v-else class="note">No teammates selected yet.</p>

    <div class="meta">
      <div>Values: {{ JSON.stringify(values) }}</div>
      <div>Open: {{ open }}</div>
    </div>
  </section>
</template>
