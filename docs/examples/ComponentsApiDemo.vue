<script setup lang="ts">
import { ref } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectTag,
  SelectTrigger,
  SelectClear,
  SelectEmpty,
  SelectLiveRegion,
} from 'vue-superselect'

interface Fruit {
  name: string
  emoji: string
}

const fruits: Fruit[] = [
  { name: 'Apple', emoji: '\uD83C\uDF4E' },
  { name: 'Banana', emoji: '\uD83C\uDF4C' },
  { name: 'Blueberry', emoji: '\uD83E\uDED0' },
  { name: 'Cherry', emoji: '\uD83C\uDF52' },
  { name: 'Grape', emoji: '\uD83C\uDF47' },
  { name: 'Mango', emoji: '\uD83E\uDD6D' },
  { name: 'Orange', emoji: '\uD83C\uDF4A' },
  { name: 'Strawberry', emoji: '\uD83C\uDF53' },
]

const selected = ref<string[]>([])
</script>

<template>
  <div class="components-demo">
    <SelectRoot
      v-model="selected"
      :items="fruits"
      label-key="name"
      value-key="name"
      multiple
      :max="3"
    >
      <SelectControl class="demo-control" v-slot="{ selectedItems, removeItem }">
        <SelectTag
          v-for="item in selectedItems"
          :key="String(item.value)"
          :value="item.value"
          :label="item.label"
          @remove="removeItem(item.value)"
          class="demo-tag"
        />
        <SelectInput placeholder="Pick up to 3 fruits..." class="demo-input" aria-label="Fruit picker" />
        <SelectClear class="demo-clear" aria-label="Clear selection">
          <span aria-hidden="true">&times;</span>
        </SelectClear>
        <SelectTrigger class="demo-trigger" aria-label="Toggle dropdown">
          <span aria-hidden="true">&#9662;</span>
        </SelectTrigger>
      </SelectControl>

      <SelectContent class="demo-content">
        <SelectOption
          v-for="fruit in fruits"
          :key="fruit.name"
          :value="fruit"
          :label="fruit.name"
          class="demo-option"
          v-slot="{ selected: isSelected }"
        >
          <span class="demo-option__emoji">{{ fruit.emoji }}</span>
          <span class="demo-option__label">{{ fruit.name }}</span>
          <span v-if="isSelected" class="demo-option__check" aria-hidden="true">&#10003;</span>
        </SelectOption>
        <SelectEmpty class="demo-empty">No fruits found</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <p v-if="selected.length" class="demo-result">
      Selected: {{ selected.join(', ') }}
    </p>
    <p class="demo-note">This styling is for demos only -- the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.components-demo {
  max-width: 400px;
}

.demo-control {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 8px;
  background: var(--vp-c-bg);
  min-height: 42px;
  position: relative;
}

.demo-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.demo-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 0.8125rem;
}

.demo-tag button {
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
}

.demo-input {
  flex: 1;
  min-width: 80px;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.demo-input::placeholder {
  color: var(--vp-c-text-3);
}

.demo-clear,
.demo-trigger {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--vp-c-text-3);
  font-size: 1rem;
  padding: 0 2px;
  line-height: 1;
}

.demo-clear:hover,
.demo-trigger:hover {
  color: var(--vp-c-text-1);
}

.demo-content {
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

.demo-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
}

.demo-option[data-highlighted='true'] {
  background-color: var(--vp-c-brand-soft);
}

.demo-option[data-selected='true'] {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.demo-option[data-disabled='true'] {
  opacity: 0.5;
  cursor: not-allowed;
}

.demo-option__emoji {
  font-size: 1.125rem;
}

.demo-option__check {
  margin-left: auto;
  color: var(--vp-c-brand-1);
}

.demo-empty {
  padding: 12px;
  text-align: center;
  color: var(--vp-c-text-3);
  font-size: 0.875rem;
}

.demo-result {
  margin-top: 8px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
