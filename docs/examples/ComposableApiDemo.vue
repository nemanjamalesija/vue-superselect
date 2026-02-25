<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { useSelect } from 'vue-superselect'
import type { CollectionItem } from 'vue-superselect'

const fruits = ['Apple', 'Banana', 'Blueberry', 'Cherry', 'Grape', 'Mango', 'Orange', 'Strawberry']

const {
  getRootProps,
  getInputProps,
  getListboxProps,
  getOptionProps,
  isOpen,
  value,
  visibleItems,
  registerItem,
  unregisterItem,
  isSelected,
} = useSelect<string>()

const items: CollectionItem<string>[] = fruits.map((fruit, i) => ({
  id: `fruit-${i}`,
  value: fruit,
  label: fruit,
  disabled: false,
  element: null,
}))

onMounted(() => items.forEach(registerItem))
onBeforeUnmount(() => items.forEach((item) => unregisterItem(item.id)))
</script>

<template>
  <div class="composable-demo">
    <div v-bind="getRootProps({ class: 'comp-root' })">
      <input v-bind="getInputProps({ class: 'comp-input', placeholder: 'Search fruits...' })" aria-label="Fruit search" />
      <ul v-if="isOpen" v-bind="getListboxProps({ class: 'comp-listbox' })">
        <li
          v-for="item in visibleItems"
          :key="item.id"
          v-bind="getOptionProps(item, { class: 'comp-option' })"
        >
          {{ item.label }}
          <span v-if="isSelected(item)" class="comp-check" aria-hidden="true">&#10003;</span>
        </li>
      </ul>
    </div>

    <p v-if="value" class="comp-result">
      Selected: <strong>{{ value }}</strong>
    </p>
    <p class="demo-note">This styling is for demos only -- the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.composable-demo {
  max-width: 400px;
}

.comp-root {
  position: relative;
}

.comp-input {
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 0.9375rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  outline: none;
}

.comp-input:focus {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.comp-input::placeholder {
  color: var(--vp-c-text-3);
}

.comp-listbox {
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
  list-style: none;
}

.comp-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
}

.comp-option[data-highlighted='true'] {
  background-color: var(--vp-c-brand-soft);
}

.comp-option[data-selected='true'] {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.comp-check {
  color: var(--vp-c-brand-1);
}

.comp-result {
  margin-top: 8px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
