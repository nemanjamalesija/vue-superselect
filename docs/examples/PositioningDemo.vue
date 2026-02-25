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
const frameworks = ['Vue', 'React', 'Svelte', 'Solid', 'Angular', 'Lit', 'Ember', 'Qwik']
</script>

<template>
  <div class="pos-demo">
    <SelectRoot v-model="selected">
      <SelectControl class="pos-control">
        <SelectInput placeholder="Select a framework..." class="pos-input" />
      </SelectControl>
      <SelectContent placement="bottom-start" class="pos-content">
        <SelectOption
          v-for="fw in frameworks"
          :key="fw"
          :value="fw"
          :label="fw"
          v-slot="{ selected: isSelected, active }"
          class="pos-option"
          :class="{
            'pos-option--selected': isSelected,
            'pos-option--active': active,
          }"
        >
          {{ fw }}
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p v-if="selected" class="pos-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.pos-demo {
  max-width: 320px;
  position: relative;
}

.pos-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.pos-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.pos-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.pos-input::placeholder {
  color: var(--vp-c-text-3);
}

.pos-content {
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

.pos-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.pos-option--active {
  background-color: var(--vp-c-brand-soft);
}

.pos-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.pos-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
