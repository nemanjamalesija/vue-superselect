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
 * Example: All currently supported multi-select capabilities.
 *
 * Why this exists:
 * - Provides one place to verify all shipped Phase 4 behavior.
 * - Makes regressions obvious when changing multi-select internals.
 */

type Option = {
  id: string
  label: string
}

const options: Option[] = [
  { id: 'nm', label: 'Nina Maric' },
  { id: 'tk', label: 'Theo King' },
  { id: 'as', label: 'Ava Stone' },
  { id: 'lp', label: 'Liam Park' },
  { id: 'zr', label: 'Zoe Reid' },
  { id: 'md', label: 'Mila Diaz' },
]

const values = ref<string[]>(['nm', 'tk'])
const open = ref(false)
const hideSelected = ref(false)
const maxEnabled = ref(true)
const maxLimit = ref(3)

const selectedSummary = computed(() => {
  if (!maxEnabled.value) return `${values.value.length} selected`
  return `${values.value.length}/${maxLimit.value} selected`
})

const resolvedMax = computed<number | undefined>(() => (
  maxEnabled.value ? maxLimit.value : undefined
))

const isAtMax = computed(() => (
  resolvedMax.value !== undefined && values.value.length >= resolvedMax.value
))

const resetDemo = () => {
  values.value = ['nm', 'tk']
  hideSelected.value = false
  maxEnabled.value = true
  maxLimit.value = 3
}
</script>

<template>
  <section class="card">
    <header>
      <h2>Multi-select: all supported features</h2>
      <p>
        Demonstrates tags, remove actions, Backspace removal, clear-all behavior,
        max selection constraints, and hideSelected filtering.
      </p>
    </header>

    <div class="panel">
      <div class="toolbar">
        <label class="toggle">
          <input v-model="hideSelected" type="checkbox">
          hideSelected
        </label>

        <label class="toggle">
          <input v-model="maxEnabled" type="checkbox">
          enable max
        </label>

        <label class="range">
          max
          <input
            v-model.number="maxLimit"
            type="range"
            min="1"
            max="6"
            :disabled="!maxEnabled"
          >
          <span>{{ maxLimit }}</span>
        </label>

        <button type="button" class="pill" @click="resetDemo">
          reset demo
        </button>
      </div>

      <SelectRoot
        id="playground-multi-all-features"
        v-model="values"
        v-model:open="open"
        multiple
        :max="resolvedMax"
        :hideSelected="hideSelected"
      >
        <SelectControl v-slot="{ selectedItems, removeItem }" class="control control-with-tags">
          <SelectTag
            v-for="item in selectedItems"
            :key="String(item.value)"
            :value="item.value"
            :label="item.label"
            @remove="removeItem"
          />

          <SelectInput class="input input-inline" placeholder="Search teammates" />
          <SelectTrigger class="trigger">{{ selectedSummary }}</SelectTrigger>
          <SelectClear v-if="values.length > 0" class="clear">Clear all</SelectClear>
        </SelectControl>

        <SelectContent class="content">
          <SelectOption
            v-for="option in options"
            :id="`all-${option.id}`"
            :key="option.id"
            :value="option.id"
            :label="option.label"
            class="option"
            v-slot="{ selected, active, disabled }"
          >
            <span>{{ option.label }}</span>
            <span class="option-state">
              <span v-if="selected">Selected</span>
              <span v-else-if="disabled">Blocked</span>
              <span v-else-if="active">Active</span>
            </span>
          </SelectOption>

          <SelectEmpty class="empty">No options available</SelectEmpty>
        </SelectContent>

        <SelectLiveRegion />
      </SelectRoot>

      <p class="note">
        Keyboard: use arrows + Enter to select, Backspace on empty input to remove
        the last tag.
      </p>
    </div>

    <div class="meta">
      <div>Values: {{ JSON.stringify(values) }}</div>
      <div>Open: {{ open }}</div>
      <div>hideSelected: {{ hideSelected }}</div>
      <div>max: {{ resolvedMax ?? 'none' }}</div>
      <div>at max: {{ isAtMax }}</div>
    </div>
  </section>
</template>

<style scoped>
.panel {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  display: grid;
  gap: 12px;
}

.toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.88rem;
  color: var(--muted);
}

.range {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.88rem;
  color: var(--muted);
}

.range input[type='range'] {
  width: 120px;
}
</style>
