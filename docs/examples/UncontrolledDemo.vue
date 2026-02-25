<script setup lang="ts">
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
} from 'vue-superselect'

const cities = ['Amsterdam', 'Berlin', 'Copenhagen', 'Dublin', 'Edinburgh']
</script>

<template>
  <div class="uc-demo">
    <SelectRoot :default-value="'Berlin'">
      <SelectControl class="uc-control">
        <SelectInput placeholder="Pick a city..." class="uc-input" />
      </SelectControl>
      <SelectContent class="uc-content">
        <SelectOption
          v-for="city in cities"
          :key="city"
          :value="city"
          :label="city"
          v-slot="{ selected, active }"
          class="uc-option"
          :class="{
            'uc-option--selected': selected,
            'uc-option--active': active,
          }"
        >
          {{ city }}
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p class="uc-note">No v-model — state is managed internally. Initial value set via <code>default-value</code>.</p>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.uc-demo {
  max-width: 320px;
}

.uc-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.uc-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.uc-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.uc-input::placeholder {
  color: var(--vp-c-text-3);
}

.uc-content {
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

.uc-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.uc-option--active {
  background-color: var(--vp-c-brand-soft);
}

.uc-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.uc-note {
  margin-top: 0.75rem;
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
}

.uc-note code {
  font-size: 0.8125rem;
  padding: 0.125rem 0.375rem;
  background-color: var(--vp-c-mute);
  border-radius: 3px;
}
</style>
