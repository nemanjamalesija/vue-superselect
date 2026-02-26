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
const regions = ['North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania']
</script>

<template>
  <div class="pt-demo">
    <p class="pt-hint">This select is inside an <code>overflow: hidden</code> container. The dropdown uses <code>teleport</code> to escape clipping.</p>
    <div class="pt-overflow-box">
      <p class="pt-box-label">overflow: hidden container</p>
      <SelectRoot v-model="selected">
        <SelectControl class="pt-control">
          <SelectInput placeholder="Select a region..." class="pt-input" />
        </SelectControl>
        <SelectContent
          :teleport="true"
          placement="bottom-start"
          class="pt-content"
        >
          <SelectOption
            v-for="region in regions"
            :key="region"
            v-slot="{ selected: isSelected, active }"
            :value="region"
            :label="region"
            class="pt-option"
            :class="{
              'pt-option--selected': isSelected,
              'pt-option--active': active,
            }"
          >
            {{ region }}
          </SelectOption>
        </SelectContent>
      </SelectRoot>
    </div>
    <p v-if="selected" class="pt-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.pt-demo {
  max-width: 400px;
}

.pt-hint {
  margin-bottom: 0.75rem;
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
}

.pt-hint code {
  font-size: 0.8125rem;
  padding: 0.125rem 0.375rem;
  background-color: var(--vp-c-mute);
  border-radius: 3px;
}

.pt-overflow-box {
  border: 2px dashed var(--vp-c-divider);
  border-radius: 8px;
  padding: 1rem;
  height: 100px;
  overflow: hidden;
  position: relative;
}

.pt-box-label {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}

.pt-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.pt-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.pt-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.pt-input::placeholder {
  color: var(--vp-c-text-3);
}

.pt-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>

<style>
/* Teleported content needs global styles since it escapes the component scope */
.pt-content {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
}

.pt-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
}

.pt-option:hover,
.pt-option--active {
  background-color: var(--vp-c-brand-soft);
}

.pt-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  box-shadow: inset 2px 0 0 var(--vp-c-brand-1);
}
</style>
