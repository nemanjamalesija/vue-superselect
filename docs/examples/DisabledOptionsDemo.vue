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

interface Drink {
  id: string
  name: string
  disabled: boolean
}

const drinks: Drink[] = [
  { id: 'coffee', name: 'Coffee', disabled: false },
  { id: 'tea', name: 'Tea', disabled: false },
  { id: 'espresso', name: 'Espresso', disabled: true },
  { id: 'latte', name: 'Latte', disabled: false },
  { id: 'matcha', name: 'Matcha', disabled: true },
  { id: 'cocoa', name: 'Hot Cocoa', disabled: false },
]
</script>

<template>
  <div class="do-demo">
    <SelectRoot
      v-model="selected"
      :items="drinks"
      label-key="name"
      value-key="id"
    >
      <SelectControl class="do-control">
        <SelectInput placeholder="Choose a drink..." class="do-input" />
      </SelectControl>
      <SelectContent class="do-content">
        <SelectOption
          v-for="drink in drinks"
          :key="drink.id"
          :value="drink.id"
          :label="drink.name"
          :disabled="drink.disabled"
          v-slot="{ selected: isSelected, active, disabled }"
          class="do-option"
          :class="{
            'do-option--selected': isSelected,
            'do-option--active': active,
            'do-option--disabled': disabled,
          }"
        >
          {{ drink.name }}
          <span v-if="disabled" class="do-badge">Unavailable</span>
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p v-if="selected" class="do-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.do-demo {
  max-width: 320px;
}

.do-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.do-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.do-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.do-input::placeholder {
  color: var(--vp-c-text-3);
}

.do-content {
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

.do-option {
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

.do-option--active {
  background-color: var(--vp-c-brand-soft);
}

.do-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.do-option--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.do-badge {
  font-size: 0.6875rem;
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-3);
}

.do-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
