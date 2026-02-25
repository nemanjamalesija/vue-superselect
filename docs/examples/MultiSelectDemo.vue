<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
} from 'vue-superselect'

const selected = ref<string[]>([])
const skills = ['JavaScript', 'TypeScript', 'Vue', 'React', 'Node.js', 'Python', 'Go', 'Rust']

const display = computed(() =>
  selected.value.length === 0 ? '' : selected.value.join(', ')
)
</script>

<template>
  <div class="ms-demo">
    <div class="ms-layout">
      <SelectRoot v-model="selected" multiple id="docs-multi-basic">
        <div class="ms-select">
          <SelectControl class="ms-control">
            <SelectInput placeholder="Select skills..." class="ms-input" />
          </SelectControl>
          <SelectContent class="ms-content">
            <SelectOption
              v-for="skill in skills"
              :key="skill"
              :value="skill"
              :label="skill"
              v-slot="{ selected: isSelected, active }"
              class="ms-option"
              :class="{
                'ms-option--selected': isSelected,
                'ms-option--active': active,
              }"
            >
              <span class="ms-check">{{ isSelected ? '&#10003;' : '' }}</span>
              {{ skill }}
            </SelectOption>
          </SelectContent>
        </div>
      </SelectRoot>
      <p class="ms-result">
        Selected ({{ selected.length }}): <strong>{{ display || 'none' }}</strong>
      </p>
    </div>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.ms-demo {
  max-width: 100%;
}

.ms-layout {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.ms-select {
  position: relative;
  width: 360px;
  max-width: 100%;
  min-width: 0;
}

.ms-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.ms-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.ms-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.ms-input::placeholder {
  color: var(--vp-c-text-3);
}

.ms-content {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  max-height: 240px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
}

.ms-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.ms-option--active {
  background-color: var(--vp-c-brand-soft);
}

.ms-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.ms-check {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  font-size: 0.75rem;
  color: var(--vp-c-brand-1);
}

.ms-result {
  margin-top: 0.5rem;
  flex: 1;
  min-width: 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

@media (max-width: 900px) {
  .ms-layout {
    display: block;
  }

  .ms-result {
    margin-top: 0.75rem;
  }
}
</style>
