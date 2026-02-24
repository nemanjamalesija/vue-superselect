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
  SelectClear,
  SelectEmpty,
  SelectLiveRegion,
} from 'vue-superselect'

/**
 * Example: SelectClear in single vs multi mode.
 *
 * Why this exists:
 * - Confirms clear behavior differs by mode (`null` vs `[]`).
 * - Gives a direct, side-by-side behavior reference.
 */

type Option = {
  id: string
  label: string
}

const options: Option[] = [
  { id: 'urgent', label: 'Urgent' },
  { id: 'high', label: 'High' },
  { id: 'medium', label: 'Medium' },
  { id: 'low', label: 'Low' },
]

const singleValue = ref<string | null>('medium')
const multiValues = ref<string[]>(['urgent', 'high'])

const singleLabel = computed(() => {
  const match = options.find((option) => option.id === singleValue.value)
  return match?.label ?? 'Single select'
})

const clearSummary = computed(() => ({
  single: singleValue.value,
  multi: multiValues.value,
}))
</script>

<template>
  <section class="card">
    <header>
      <h2>SelectClear semantics</h2>
      <p>
        In single mode, clear resets to `null`. In multi mode, clear resets to
        an empty array.
      </p>
    </header>

    <div class="clear-grid">
      <article class="clear-panel">
        <h3>Single Mode</h3>
        <SelectRoot id="playground-clear-single" v-model="singleValue">
          <SelectControl class="control">
            <SelectInput class="input" placeholder="Search priorities" />
            <SelectTrigger class="trigger">{{ singleLabel }}</SelectTrigger>
            <SelectClear v-if="singleValue !== null" class="clear">Clear</SelectClear>
          </SelectControl>

          <SelectContent force-absolute class="content content-inline-flow">
            <SelectOption
              v-for="option in options"
              :id="`single-${option.id}`"
              :key="option.id"
              :value="option.id"
              :label="option.label"
              class="option"
            >
              {{ option.label }}
            </SelectOption>
            <SelectEmpty class="empty">No priority match</SelectEmpty>
          </SelectContent>

          <SelectLiveRegion />
        </SelectRoot>
      </article>

      <article class="clear-panel">
        <h3>Multi Mode</h3>
        <SelectRoot id="playground-clear-multi" v-model="multiValues" multiple>
          <SelectControl v-slot="{ selectedItems, removeItem }" class="control control-with-tags">
            <SelectTag
              v-for="item in selectedItems"
              :key="String(item.value)"
              :value="item.value"
              :label="item.label"
              class="inline-tag"
              @remove="removeItem"
            />

            <SelectInput class="input input-inline" placeholder="Search priorities" />
            <SelectClear v-if="multiValues.length > 0" class="clear">Clear all</SelectClear>
          </SelectControl>

          <SelectContent force-absolute class="content content-inline-flow">
            <SelectOption
              v-for="option in options"
              :id="`multi-${option.id}`"
              :key="option.id"
              :value="option.id"
              :label="option.label"
              class="option"
            >
              {{ option.label }}
            </SelectOption>
            <SelectEmpty class="empty">No priority match</SelectEmpty>
          </SelectContent>

          <SelectLiveRegion />
        </SelectRoot>
      </article>
    </div>

    <div class="meta">
      <div>Single value: {{ clearSummary.single ?? 'null' }}</div>
      <div>Multi values: {{ JSON.stringify(clearSummary.multi) }}</div>
    </div>
  </section>
</template>

<style scoped>
.clear-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.clear-panel {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
}

.clear-panel h3 {
  margin: 0 0 10px;
  font-size: 0.95rem;
}

@media (max-width: 800px) {
  .clear-grid {
    grid-template-columns: 1fr;
  }
}
</style>
