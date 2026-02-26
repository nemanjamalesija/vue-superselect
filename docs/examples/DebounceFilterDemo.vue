<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectEmpty,
  type FilterFn,
} from 'vue-superselect'

const selected = ref<string | null>(null)

interface Tool {
  id: string
  name: string
  category: string
}

const tools: Tool[] = [
  { id: 'vite', name: 'Vite', category: 'Build Tool' },
  { id: 'vitest', name: 'Vitest', category: 'Test Runner' },
  { id: 'vue', name: 'Vue', category: 'Framework' },
  { id: 'ts', name: 'TypeScript', category: 'Language' },
  { id: 'eslint', name: 'ESLint', category: 'Linter' },
  { id: 'prettier', name: 'Prettier', category: 'Formatter' },
  { id: 'pnpm', name: 'pnpm', category: 'Package Manager' },
  { id: 'turborepo', name: 'Turborepo', category: 'Build Tool' },
]

const customFilter: FilterFn<unknown> = (item, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const label = item.label.toLowerCase()
  const tool = tools.find((t) => t.id === item.value)
  const category = tool?.category.toLowerCase() ?? ''

  return label.includes(q) || category.includes(q)
}
</script>

<template>
  <div class="df-demo">
    <p class="df-hint">Try typing a category like "build" or "linter" . This filter searches both name and category.</p>
    <SelectRoot
      v-model="selected"
      :filter="customFilter"
      :debounce="200"
      :items="tools"
      label-key="name"
      value-key="id"
    >
      <SelectControl class="df-control">
        <SelectInput placeholder="Search tools by name or category..." class="df-input" />
      </SelectControl>
      <SelectContent class="df-content">
        <SelectOption
          v-for="tool in tools"
          :key="tool.id"
          v-slot="{ selected: isSelected, active }"
          :value="tool.id"
          :label="tool.name"
          class="df-option"
          :class="{
            'df-option--selected': isSelected,
            'df-option--active': active,
          }"
        >
          <span>{{ tool.name }}</span>
          <span class="df-category">{{ tool.category }}</span>
        </SelectOption>
        <SelectEmpty class="df-empty">No tools found</SelectEmpty>
      </SelectContent>
    </SelectRoot>
    <p v-if="selected" class="df-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.df-demo {
  max-width: 400px;
}

.df-hint {
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
}

.df-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.df-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.df-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.df-input::placeholder {
  color: var(--vp-c-text-3);
}

.df-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
}

.df-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.df-option--active {
  background-color: var(--vp-c-brand-soft);
}

.df-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.df-category {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  padding: 0.125rem 0.5rem;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
}

.df-empty {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
}

.df-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
