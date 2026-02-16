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
  type FilterFn,
} from 'vue-superselect'

/**
 * Example: Custom filter function with debounce.
 *
 * Why this exists:
 * - Shows how to replace default filtering with domain-specific logic.
 * - Demonstrates built-in `debounce` query handling.
 */

type ToolOption = {
  id: string
  label: string
}

const options: ToolOption[] = [
  { id: 'vite', label: 'Vite Build Tool' },
  { id: 'vitest', label: 'Vitest Runner' },
  { id: 'vue', label: 'Vue Framework' },
  { id: 'vtu', label: 'Vue Test Utils' },
  { id: 'ts', label: 'TypeScript Compiler' },
  { id: 'eslint', label: 'ESLint Linter' },
  { id: 'prettier', label: 'Prettier Formatter' },
  { id: 'pnpm', label: 'PNPM Package Manager' },
]

const value = ref<string | null>(null)
const open = ref(false)
const rawQuery = ref('')
const debounceMs = 250

const toAcronym = (label: string) =>
  label
    .split(/\s+/)
    .map((word) => word[0] ?? '')
    .join('')
    .toLowerCase()

const customFilter: FilterFn<unknown> = (item, query) => {
  const normalizedQuery = query.trim().toLowerCase()
  if (normalizedQuery === '') return true

  const label = item.label.toLowerCase()
  const acronym = toAcronym(item.label)

  return (
    label.startsWith(normalizedQuery) ||
    label.includes(normalizedQuery) ||
    acronym.startsWith(normalizedQuery)
  )
}

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null
  rawQuery.value = target?.value ?? ''
}

const selectedLabel = computed(() => {
  const match = options.find((option) => option.id === value.value)
  return match?.label ?? 'Pick tool'
})
</script>

<template>
  <section class="card">
    <header>
      <h2>Custom filter + debounce</h2>
      <p>
        Uses `filter` for smart matching and `debounce` to delay filtering while
        typing.
      </p>
    </header>

    <SelectRoot
      id="playground-custom-filter"
      v-model="value"
      v-model:open="open"
      :filter="customFilter"
      :debounce="debounceMs"
    >
      <SelectControl class="control">
        <SelectInput
          class="input"
          placeholder="Try: vue, runner, vbt, vtu"
          @input="onInput"
        />
        <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
      </SelectControl>

      <SelectContent class="content">
        <SelectOption
          v-for="option in options"
          :id="`filter-${option.id}`"
          :key="option.id"
          :value="option.id"
          :label="option.label"
          class="option"
        >
          {{ option.label }}
        </SelectOption>

        <SelectEmpty class="empty">No tool matches this query</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <div class="meta">
      <div>Debounce: {{ debounceMs }}ms</div>
      <div>Raw query: "{{ rawQuery }}"</div>
      <div>Value: {{ value ?? 'null' }}</div>
      <div>Open: {{ open }}</div>
    </div>
  </section>
</template>
