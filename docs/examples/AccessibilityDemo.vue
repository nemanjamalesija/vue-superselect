<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectLiveRegion,
} from 'vue-superselect'

const selected = ref<string | null>(null)
const languages = ['English', 'French', 'German', 'Italian', 'Japanese', 'Korean', 'Spanish']
</script>

<template>
  <div class="a11y-demo">
    <p class="a11y-hint">Try using only your keyboard: Tab to focus, type to filter, arrow keys to navigate, Enter to select, Escape to close.</p>

    <SelectRoot v-model="selected">
      <SelectControl class="a11y-control">
        <SelectInput placeholder="Select a language..." class="a11y-input" />
      </SelectControl>
      <SelectContent class="a11y-content">
        <SelectOption
          v-for="lang in languages"
          :key="lang"
          :value="lang"
          :label="lang"
          v-slot="{ selected: isSelected, active }"
          class="a11y-option"
          :class="{
            'a11y-option--selected': isSelected,
            'a11y-option--active': active,
          }"
        >
          {{ lang }}
        </SelectOption>
      </SelectContent>
      <SelectLiveRegion />
    </SelectRoot>

    <p v-if="selected" class="a11y-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.a11y-demo {
  max-width: 360px;
}

.a11y-hint {
  margin-bottom: 1rem;
  padding: 0.625rem 0.875rem;
  font-size: 0.8125rem;
  color: var(--vp-c-text-2);
  background-color: var(--vp-c-bg-soft);
  border-radius: 8px;
  border-left: 3px solid var(--vp-c-brand-1);
}

.a11y-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.a11y-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.a11y-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.a11y-input::placeholder {
  color: var(--vp-c-text-3);
}

.a11y-content {
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

.a11y-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.a11y-option--active {
  background-color: var(--vp-c-brand-soft);
}

.a11y-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.a11y-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
