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
const options = ['Apple', 'Banana', 'Cherry', 'Grape', 'Orange']
</script>

<template>
  <SelectRoot v-model="selected">
    <SelectControl class="qs-control">
      <SelectInput placeholder="Choose a fruit..." class="qs-input" />
    </SelectControl>
    <SelectContent class="qs-content">
      <SelectOption
        v-for="option in options"
        :key="option"
        :value="option"
        :label="option"
        v-slot="{ isSelected, isHighlighted }"
        class="qs-option"
        :class="{
          'qs-option--selected': isSelected,
          'qs-option--highlighted': isHighlighted,
        }"
      >
        {{ option }}
      </SelectOption>
    </SelectContent>
  </SelectRoot>
  <p v-if="selected" class="qs-result">
    You picked: <strong>{{ selected }}</strong>
  </p>
</template>

<style scoped>
.qs-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.qs-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.qs-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.qs-input::placeholder {
  color: var(--vp-c-text-3);
}

.qs-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
}

.qs-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.qs-option--highlighted {
  background-color: var(--vp-c-brand-soft);
}

.qs-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.qs-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
