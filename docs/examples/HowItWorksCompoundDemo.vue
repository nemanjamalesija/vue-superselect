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
const colors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue', 'Indigo', 'Violet']
</script>

<template>
  <div class="hiw-compound">
    <SelectRoot v-model="selected">
      <SelectControl class="hiw-control">
        <SelectInput placeholder="Pick a color..." class="hiw-input" />
      </SelectControl>
      <SelectContent class="hiw-content">
        <SelectOption
          v-for="color in colors"
          :key="color"
          :value="color"
          :label="color"
          v-slot="{ selected: isSelected, active }"
          class="hiw-option"
          :class="{
            'hiw-option--selected': isSelected,
            'hiw-option--active': active,
          }"
        >
          {{ color }}
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p v-if="selected" class="hiw-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.hiw-compound {
  max-width: 320px;
}

.hiw-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.hiw-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.hiw-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.hiw-input::placeholder {
  color: var(--vp-c-text-3);
}

.hiw-content {
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

.hiw-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.hiw-option--active {
  background-color: var(--vp-c-brand-soft);
}

.hiw-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.hiw-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
