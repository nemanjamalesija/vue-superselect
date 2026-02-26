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

interface Product {
  id: string
  name: string
  stock: number
}

const products: Product[] = [
  { id: 'keyboard', name: 'Mechanical Keyboard', stock: 12 },
  { id: 'mouse', name: 'Ergonomic Mouse', stock: 0 },
  { id: 'monitor', name: '4K Monitor', stock: 3 },
  { id: 'headset', name: 'Wireless Headset', stock: 0 },
  { id: 'webcam', name: 'HD Webcam', stock: 7 },
  { id: 'mic', name: 'USB Microphone', stock: 0 },
]
</script>

<template>
  <div class="dc-demo">
    <SelectRoot
      v-model="selected"
      :items="products"
      label-key="name"
      value-key="id"
    >
      <SelectControl class="dc-control">
        <SelectInput placeholder="Choose a product..." class="dc-input" />
      </SelectControl>
      <SelectContent class="dc-content">
        <SelectOption
          v-for="product in products"
          :key="product.id"
          v-slot="{ selected: isSelected, active, disabled }"
          :value="product.id"
          :label="product.name"
          :disabled="product.stock === 0"
          class="dc-option"
          :class="{
            'dc-option--selected': isSelected,
            'dc-option--active': active,
            'dc-option--disabled': disabled,
          }"
        >
          <span>{{ product.name }}</span>
          <span v-if="product.stock === 0" class="dc-stock dc-stock--out">Out of stock</span>
          <span v-else class="dc-stock">{{ product.stock }} left</span>
        </SelectOption>
      </SelectContent>
    </SelectRoot>
    <p v-if="selected" class="dc-result">Selected: <strong>{{ selected }}</strong></p>
    <p class="demo-note">This styling is for demos only. The library ships zero CSS</p>
  </div>
</template>

<style scoped>
.dc-demo {
  max-width: 360px;
}

.dc-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.dc-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.dc-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.dc-input::placeholder {
  color: var(--vp-c-text-3);
}

.dc-content {
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

.dc-option {
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

.dc-option--active {
  background-color: var(--vp-c-brand-soft);
}

.dc-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.dc-option--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.dc-stock {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.dc-stock--out {
  color: var(--vp-c-danger-1, #e53e3e);
}

.dc-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
