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
const fruits = [
  'Apple',
  'Banana',
  'Blueberry',
  'Cherry',
  'Grape',
  'Mango',
  'Orange',
  'Strawberry',
]
</script>

<template>
  <div class="landing-demo">
    <h2>See it in action</h2>
    <div class="landing-demo__container">
      <SelectRoot v-model="selected">
        <SelectControl class="landing-control">
          <SelectInput placeholder="Pick a fruit..." class="landing-input" />
        </SelectControl>
        <SelectContent class="landing-content">
          <SelectOption
            v-for="fruit in fruits"
            :key="fruit"
            :value="fruit"
            :label="fruit"
            v-slot="{ isSelected, isHighlighted }"
            class="landing-option"
            :class="{
              'landing-option--selected': isSelected,
              'landing-option--highlighted': isHighlighted,
            }"
          >
            {{ fruit }}
          </SelectOption>
        </SelectContent>
      </SelectRoot>
      <p v-if="selected" class="landing-demo__result">
        Selected: <strong>{{ selected }}</strong>
      </p>
    </div>
    <p class="demo-note">
      This styling is for demos only — the library ships zero CSS
    </p>
  </div>
</template>

<style scoped>
.landing-demo {
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}

.landing-demo h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--vp-c-text-1);
}

.landing-demo__container {
  text-align: left;
  position: relative;
}

.landing-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.landing-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.landing-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.landing-input::placeholder {
  color: var(--vp-c-text-3);
}

.landing-content {
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
  max-height: 240px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
}

.landing-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.landing-option--highlighted {
  background-color: var(--vp-c-brand-soft);
}

.landing-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.landing-demo__result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  text-align: center;
}
</style>
