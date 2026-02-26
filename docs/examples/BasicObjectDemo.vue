<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
} from 'vue-superselect'

interface Country {
  code: string
  name: string
}

const selected = ref<string | null>(null)
const countries: Country[] = [
  { code: 'au', name: 'Australia' },
  { code: 'br', name: 'Brazil' },
  { code: 'ca', name: 'Canada' },
  { code: 'de', name: 'Germany' },
  { code: 'fr', name: 'France' },
  { code: 'jp', name: 'Japan' },
  { code: 'uk', name: 'United Kingdom' },
]
</script>

<template>
  <div class="bo-demo">
    <SelectRoot
      v-model="selected"
      :items="countries"
      label-key="name"
      value-key="code"
    >
      <SelectControl class="bo-control">
        <SelectInput placeholder="Select a country..." class="bo-input" />
      </SelectControl>
      <SelectContent class="bo-content">
        <SelectOption
          v-for="country in countries"
          :key="country.code"
          v-slot="{ selected: isSelected, active }"
          :value="country.code"
          :label="country.name"
          class="bo-option"
          :class="{
            'bo-option--selected': isSelected,
            'bo-option--active': active,
          }"
        >
          {{ country.name }}
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p class="bo-result">
      Selected code: <strong>{{ selected ?? 'none' }}</strong>
    </p>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.bo-demo {
  max-width: 320px;
}

.bo-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.bo-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.bo-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.bo-input::placeholder {
  color: var(--vp-c-text-3);
}

.bo-content {
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

.bo-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.bo-option--active {
  background-color: var(--vp-c-brand-soft);
}

.bo-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.bo-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
