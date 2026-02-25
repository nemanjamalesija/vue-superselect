<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectTrigger,
  SelectClear,
  SelectContent,
  SelectOption,
  SelectEmpty,
} from 'vue-superselect'

const selected = ref<string | null>(null)
const fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange', 'Strawberry']
</script>

<template>
  <div class="bc-demo">
    <SelectRoot v-model="selected" placeholder="Search fruits...">
      <SelectControl class="bc-control">
        <SelectInput class="bc-input" />
        <SelectClear v-if="selected" class="bc-clear">x</SelectClear>
        <SelectTrigger class="bc-trigger">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </SelectTrigger>
      </SelectControl>
      <SelectContent class="bc-content">
        <SelectOption
          v-for="fruit in fruits"
          :key="fruit"
          :value="fruit"
          :label="fruit"
          v-slot="{ selected: isSelected, active }"
          class="bc-option"
          :class="{
            'bc-option--selected': isSelected,
            'bc-option--active': active,
          }"
        >
          {{ fruit }}
        </SelectOption>
        <SelectEmpty class="bc-empty">No fruits match your search</SelectEmpty>
      </SelectContent>
    </SelectRoot>
    <p class="bc-result">
      Selected: <strong>{{ selected ?? 'nothing' }}</strong>
    </p>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.bc-demo {
  max-width: 320px;
}

.bc-control {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.bc-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.bc-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.bc-input::placeholder {
  color: var(--vp-c-text-3);
}

.bc-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s;
}

.bc-clear:hover {
  background: var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.bc-trigger {
  display: flex;
  align-items: center;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--vp-c-text-3);
  cursor: pointer;
}

.bc-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
}

.bc-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.bc-option--active {
  background-color: var(--vp-c-brand-soft);
}

.bc-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.bc-empty {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
}

.bc-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
