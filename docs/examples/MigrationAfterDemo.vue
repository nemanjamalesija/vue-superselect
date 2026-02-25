<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectClear,
} from 'vue-superselect'

const selected = ref<string | null>(null)
const fruits = ['Apple', 'Banana', 'Cherry', 'Grape', 'Orange']
</script>

<template>
  <div class="migration-after">
    <SelectRoot v-model="selected">
      <SelectControl class="mig-control">
        <SelectInput placeholder="Pick a fruit..." class="mig-input" aria-label="Fruit" />
        <SelectClear v-if="selected" class="mig-clear" aria-label="Clear selection">
          <span aria-hidden="true">&times;</span>
        </SelectClear>
      </SelectControl>
      <SelectContent class="mig-content">
        <SelectOption
          v-for="fruit in fruits"
          :key="fruit"
          :value="fruit"
          :label="fruit"
          class="mig-option"
        />
      </SelectContent>
    </SelectRoot>

    <p v-if="selected" class="mig-result">
      Selected: <strong>{{ selected }}</strong>
    </p>
    <p class="demo-note">This styling is for demos only -- the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.migration-after {
  max-width: 400px;
}

.mig-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 8px 10px;
  background: var(--vp-c-bg);
  position: relative;
}

.mig-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.mig-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.mig-input::placeholder {
  color: var(--vp-c-text-3);
}

.mig-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-3);
  font-size: 1.125rem;
  padding: 0 2px;
  line-height: 1;
}

.mig-clear:hover {
  color: var(--vp-c-text-1);
}

.mig-content {
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

.mig-option {
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
}

.mig-option[data-highlighted='true'] {
  background-color: var(--vp-c-brand-soft);
}

.mig-option[data-selected='true'] {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.mig-result {
  margin-top: 8px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
