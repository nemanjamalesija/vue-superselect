<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useSelect } from 'vue-superselect'

const colors = [
  { id: 'red', label: 'Red' },
  { id: 'orange', label: 'Orange' },
  { id: 'yellow', label: 'Yellow' },
  { id: 'green', label: 'Green' },
  { id: 'blue', label: 'Blue' },
  { id: 'indigo', label: 'Indigo' },
  { id: 'violet', label: 'Violet' },
]

const itemsRef = ref(colors)
const {
  getRootProps,
  getInputProps,
  getListboxProps,
  getOptionProps,
  visibleItems,
  value,
  isOpen,
  registerItem,
  unregisterItem,
} = useSelect<{ id: string; label: string }>({
  items: itemsRef,
  labelKey: 'label' as keyof { id: string; label: string },
  valueKey: 'id' as keyof { id: string; label: string },
})

onMounted(() => {
  colors.forEach((color, index) => {
    registerItem({
      id: `composable-color-${color.id}`,
      value: color.id,
      label: color.label,
      disabled: false,
      element: null,
    })
  })
})

onBeforeUnmount(() => {
  colors.forEach((color) => {
    unregisterItem(`composable-color-${color.id}`)
  })
})

const selectedLabel = computed(() => {
  if (!value.value) return null
  const match = colors.find((c) => c.id === value.value)
  return match?.label ?? null
})
</script>

<template>
  <div class="hiw-composable">
    <div v-bind="getRootProps()">
      <div class="hiw-control">
        <input
          v-bind="getInputProps()"
          placeholder="Pick a color..."
          class="hiw-input"
        />
      </div>
      <ul
        v-if="isOpen"
        v-bind="getListboxProps()"
        class="hiw-content"
      >
        <li
          v-for="item in visibleItems"
          :key="item.id"
          v-bind="getOptionProps(item)"
          class="hiw-option"
          :class="{
            'hiw-option--selected': item.value === value,
          }"
        >
          {{ item.label }}
        </li>
      </ul>
    </div>
    <p v-if="selectedLabel" class="hiw-result">Selected: <strong>{{ selectedLabel }}</strong></p>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.hiw-composable {
  max-width: 320px;
}

.hiw-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.hiw-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.hiw-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.hiw-input::placeholder {
  color: var(--vp-c-text-3);
}

.hiw-content {
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
  list-style: none;
  margin: 4px 0 0;
}

.hiw-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s;
}

.hiw-option[data-highlighted="true"] {
  background-color: var(--vp-c-brand-soft);
}

.hiw-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.hiw-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
