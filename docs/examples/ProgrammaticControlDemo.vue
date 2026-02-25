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
const selectRef = ref<InstanceType<typeof SelectRoot> | null>(null)

const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Berlin', 'Toronto']
</script>

<template>
  <div class="pc-demo">
    <div class="pc-buttons">
      <button class="pc-btn" @click="selectRef?.open()">Open</button>
      <button class="pc-btn" @click="selectRef?.close()">Close</button>
      <button class="pc-btn" @click="selectRef?.toggle()">Toggle</button>
      <button class="pc-btn" @click="selectRef?.clear()">Clear</button>
      <button class="pc-btn" @click="selectRef?.focus()">Focus</button>
    </div>
    <SelectRoot ref="selectRef" v-model="selected">
      <SelectControl class="pc-control">
        <SelectInput placeholder="Pick a city..." class="pc-input" />
      </SelectControl>
      <SelectContent class="pc-content">
        <SelectOption
          v-for="city in cities"
          :key="city"
          :value="city"
          :label="city"
          v-slot="{ selected: isSelected, active }"
          class="pc-option"
          :class="{
            'pc-option--selected': isSelected,
            'pc-option--active': active,
          }"
        >
          {{ city }}
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p v-if="selected" class="pc-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.pc-demo {
  max-width: 360px;
}

.pc-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.pc-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.pc-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.pc-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.pc-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.pc-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.pc-input::placeholder {
  color: var(--vp-c-text-3);
}

.pc-content {
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

.pc-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.pc-option--active {
  background-color: var(--vp-c-brand-soft);
}

.pc-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.pc-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
