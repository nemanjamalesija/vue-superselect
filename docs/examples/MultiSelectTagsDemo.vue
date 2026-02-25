<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectTag,
} from 'vue-superselect'

interface TeamMember {
  id: string
  name: string
}

const selected = ref<string[]>([])
const members: TeamMember[] = [
  { id: 'alice', name: 'Alice' },
  { id: 'bob', name: 'Bob' },
  { id: 'charlie', name: 'Charlie' },
  { id: 'diana', name: 'Diana' },
  { id: 'eve', name: 'Eve' },
  { id: 'frank', name: 'Frank' },
]
</script>

<template>
  <div class="mt-demo">
    <SelectRoot
      v-model="selected"
      id="docs-multi-tags"
      multiple
      :items="members"
      label-key="name"
      value-key="id"
    >
      <SelectControl v-slot="{ selectedItems, removeItem }" class="mt-control">
        <SelectTag
          v-for="item in selectedItems"
          :key="String(item.value)"
          :value="item.value"
          :label="item.label"
          class="mt-tag"
          @remove="removeItem"
        />
        <SelectInput placeholder="Add members..." class="mt-input" />
      </SelectControl>
      <SelectContent class="mt-content">
        <SelectOption
          v-for="member in members"
          :key="member.id"
          :value="member.id"
          :label="member.name"
          v-slot="{ selected: isSelected, active }"
          class="mt-option"
          :class="{
            'mt-option--selected': isSelected,
            'mt-option--active': active,
          }"
        >
          {{ member.name }}
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p class="mt-hint">Press Backspace in an empty input to remove the last tag.</p>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.mt-demo {
  max-width: 400px;
}

.mt-control {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.375rem 0.5rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
  min-height: 40px;
}

.mt-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.mt-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.125rem 0.375rem;
  background: var(--vp-c-brand-soft);
  border-radius: 4px;
  font-size: 0.8125rem;
  color: var(--vp-c-brand-1);
}

.mt-tag [data-part="remove"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--vp-c-brand-1);
  cursor: pointer;
  border-radius: 2px;
  font-size: 0.75rem;
}

.mt-tag [data-part="remove"]:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.mt-input {
  flex: 1;
  min-width: 80px;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
  padding: 0.125rem 0.25rem;
}

.mt-input::placeholder {
  color: var(--vp-c-text-3);
}

.mt-content {
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

.mt-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.mt-option--active {
  background-color: var(--vp-c-brand-soft);
}

.mt-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.mt-hint {
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
}
</style>
