<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectTag,
  SelectClear,
} from 'vue-superselect'

const selected = ref<string[]>([])
const maxSelections = 3
const toppings = ['Pepperoni', 'Mushrooms', 'Onions', 'Sausage', 'Peppers', 'Olives', 'Pineapple', 'Bacon']

const isAtMax = computed(() => selected.value.length >= maxSelections)
</script>

<template>
  <div class="mm-demo">
    <SelectRoot
      v-model="selected"
      multiple
      :max="maxSelections"
      hide-selected
    >
      <SelectControl v-slot="{ selectedItems, removeItem }" class="mm-control">
        <SelectTag
          v-for="item in selectedItems"
          :key="String(item.value)"
          :value="item.value"
          :label="item.label"
          class="mm-tag"
          @remove="removeItem"
        />
        <SelectInput
          :placeholder="isAtMax ? 'Max reached' : 'Pick up to 3 toppings...'"
          class="mm-input"
        />
        <SelectClear v-if="selected.length > 0" class="mm-clear">Clear</SelectClear>
      </SelectControl>
      <SelectContent class="mm-content">
        <SelectOption
          v-for="topping in toppings"
          :key="topping"
          :value="topping"
          :label="topping"
          v-slot="{ active, disabled }"
          class="mm-option"
          :class="{
            'mm-option--active': active,
            'mm-option--disabled': disabled,
          }"
        >
          {{ topping }}
          <span v-if="disabled" class="mm-option-badge">limit reached</span>
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p class="mm-status">
      {{ selected.length }}/{{ maxSelections }} selected
      <span v-if="isAtMax" class="mm-limit-note">(max reached)</span>
    </p>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.mm-demo {
  max-width: 400px;
  position: relative;
}

.mm-control {
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

.mm-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.mm-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.125rem 0.375rem;
  background: var(--vp-c-brand-soft);
  border-radius: 4px;
  font-size: 0.8125rem;
  color: var(--vp-c-brand-1);
}

.mm-tag [data-part="remove"] {
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

.mm-tag [data-part="remove"]:hover {
  background: var(--vp-c-brand-1);
  color: white;
}

.mm-input {
  flex: 1;
  min-width: 80px;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
  padding: 0.125rem 0.25rem;
}

.mm-input::placeholder {
  color: var(--vp-c-text-3);
}

.mm-clear {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}

.mm-clear:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.mm-content {
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

.mm-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.mm-option--active {
  background-color: var(--vp-c-brand-soft);
}

.mm-option--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mm-option-badge {
  font-size: 0.6875rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.mm-status {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.mm-limit-note {
  color: var(--vp-c-warning-1, #e5a200);
  font-weight: 500;
}
</style>
