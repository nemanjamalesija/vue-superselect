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

interface Language {
  id: string
  name: string
  icon: string
  category: string
}

const languages: Language[] = [
  { id: 'js', name: 'JavaScript', icon: 'JS', category: 'Frontend' },
  { id: 'ts', name: 'TypeScript', icon: 'TS', category: 'Frontend' },
  { id: 'vue', name: 'Vue', icon: 'V', category: 'Framework' },
  { id: 'react', name: 'React', icon: 'R', category: 'Framework' },
  { id: 'python', name: 'Python', icon: 'Py', category: 'Backend' },
  { id: 'go', name: 'Go', icon: 'Go', category: 'Backend' },
  { id: 'rust', name: 'Rust', icon: 'Rs', category: 'Systems' },
]
</script>

<template>
  <div class="cr-demo">
    <SelectRoot
      v-model="selected"
      :items="languages"
      label-key="name"
      value-key="id"
    >
      <SelectControl class="cr-control">
        <SelectInput placeholder="Pick a language..." class="cr-input" />
      </SelectControl>
      <SelectContent class="cr-content">
        <SelectOption
          v-for="lang in languages"
          :key="lang.id"
          :value="lang.id"
          :label="lang.name"
          v-slot="{ selected: isSelected, active }"
          class="cr-option"
          :class="{
            'cr-option--selected': isSelected,
            'cr-option--active': active,
          }"
        >
          <span class="cr-icon">{{ lang.icon }}</span>
          <span class="cr-info">
            <span class="cr-name">{{ lang.name }}</span>
            <span class="cr-category">{{ lang.category }}</span>
          </span>
          <span v-if="isSelected" class="cr-check">&#10003;</span>
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p v-if="selected" class="cr-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.cr-demo {
  max-width: 360px;
}

.cr-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.cr-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.cr-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.cr-input::placeholder {
  color: var(--vp-c-text-3);
}

.cr-content {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  max-height: 280px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
}

.cr-option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.cr-option--active {
  background-color: var(--vp-c-brand-soft);
}

.cr-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.cr-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  font-size: 0.6875rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

.cr-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.cr-name {
  font-size: 0.9375rem;
  line-height: 1.25;
}

.cr-category {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  line-height: 1.25;
}

.cr-check {
  font-size: 0.875rem;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.cr-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
