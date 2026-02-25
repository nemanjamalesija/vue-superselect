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
const fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Mango', 'Orange', 'Strawberry']
</script>

<template>
  <div class="bs-demo">
    <SelectRoot v-model="selected">
      <SelectControl class="bs-control">
        <SelectInput placeholder="Pick a fruit..." class="bs-input" />
      </SelectControl>
      <SelectContent class="bs-content">
        <SelectOption
          v-for="fruit in fruits"
          :key="fruit"
          :value="fruit"
          :label="fruit"
          v-slot="{ selected: isSelected, active }"
          class="bs-option"
          :class="{
            'bs-option--selected': isSelected,
            'bs-option--active': active,
          }"
        >
          {{ fruit }}
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p v-if="selected" class="bs-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.bs-demo {
  max-width: 320px;
  position: relative;
}

.bs-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.bs-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.bs-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.bs-input::placeholder {
  color: var(--vp-c-text-3);
}

.bs-content {
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

.bs-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.bs-option--active {
  background-color: var(--vp-c-brand-soft);
}

.bs-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.bs-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
