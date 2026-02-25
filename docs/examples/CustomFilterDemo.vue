<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectEmpty,
} from 'vue-superselect'

const selected = ref<string | null>(null)
const cities = [
  'Amsterdam', 'Barcelona', 'Berlin', 'Copenhagen', 'Dublin',
  'Edinburgh', 'Florence', 'Geneva', 'Helsinki', 'Istanbul',
]
</script>

<template>
  <div class="cf-demo">
    <p class="cf-hint">Type to filter. The built-in filter matches case-insensitively.</p>
    <SelectRoot v-model="selected">
      <SelectControl class="cf-control">
        <SelectInput placeholder="Search cities..." class="cf-input" />
      </SelectControl>
      <SelectContent class="cf-content">
        <SelectOption
          v-for="city in cities"
          :key="city"
          :value="city"
          :label="city"
          v-slot="{ selected: isSelected, active }"
          class="cf-option"
          :class="{
            'cf-option--selected': isSelected,
            'cf-option--active': active,
          }"
        >
          {{ city }}
        </SelectOption>
        <SelectEmpty class="cf-empty">No cities match your search</SelectEmpty>
      </SelectContent>
    </SelectRoot>
    <p v-if="selected" class="cf-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.cf-demo {
  max-width: 320px;
}

.cf-hint {
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
}

.cf-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.cf-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.cf-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.cf-input::placeholder {
  color: var(--vp-c-text-3);
}

.cf-content {
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

.cf-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.cf-option--active {
  background-color: var(--vp-c-brand-soft);
}

.cf-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.cf-empty {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
}

.cf-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
