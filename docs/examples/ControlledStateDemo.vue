<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
} from 'vue-superselect'

const selected = ref<string | null>(null)
const fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange']

const reset = () => {
  selected.value = null
}

const setToCherry = () => {
  selected.value = 'Cherry'
}
</script>

<template>
  <div class="cs-demo">
    <SelectRoot v-model="selected">
      <SelectControl class="cs-control">
        <SelectInput placeholder="Pick a fruit..." class="cs-input" />
      </SelectControl>
      <SelectContent class="cs-content">
        <SelectOption
          v-for="fruit in fruits"
          :key="fruit"
          :value="fruit"
          :label="fruit"
          v-slot="{ selected: isSelected, active }"
          class="cs-option"
          :class="{
            'cs-option--selected': isSelected,
            'cs-option--active': active,
          }"
        >
          {{ fruit }}
        </SelectOption>
      </SelectContent>
    </SelectRoot>

    <div class="cs-status">
      <p>
        Selected: <strong>{{ selected ?? 'nothing' }}</strong>
      </p>
      <div class="cs-actions">
        <button @click="reset" class="cs-btn">Reset</button>
        <button @click="setToCherry" class="cs-btn">Set to Cherry</button>
      </div>
    </div>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.cs-demo {
  max-width: 360px;
  position: relative;
}

.cs-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.cs-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.cs-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.cs-input::placeholder {
  color: var(--vp-c-text-3);
}

.cs-content {
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

.cs-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.cs-option--active {
  background-color: var(--vp-c-brand-soft);
}

.cs-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.cs-status {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.cs-status p {
  margin: 0 0 0.5rem;
}

.cs-actions {
  display: flex;
  gap: 0.5rem;
}

.cs-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: border-color 0.2s, color 0.2s;
}

.cs-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
</style>
