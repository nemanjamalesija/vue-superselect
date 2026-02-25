<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useSelect } from 'vue-superselect'

interface Color {
  id: string
  label: string
  hex: string
}

const colors: Color[] = [
  { id: 'red', label: 'Red', hex: '#ef4444' },
  { id: 'orange', label: 'Orange', hex: '#f97316' },
  { id: 'yellow', label: 'Yellow', hex: '#eab308' },
  { id: 'green', label: 'Green', hex: '#22c55e' },
  { id: 'blue', label: 'Blue', hex: '#3b82f6' },
  { id: 'purple', label: 'Purple', hex: '#a855f7' },
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
  open,
  close,
  toggle,
  clear,
  focus,
  registerItem,
  unregisterItem,
} = useSelect<Color>({
  items: itemsRef,
  labelKey: 'label' as keyof Color,
  valueKey: 'id' as keyof Color,
})

onMounted(() => {
  colors.forEach((color) => {
    registerItem({
      id: `pe-color-${color.id}`,
      value: color.id,
      label: color.label,
      disabled: false,
      element: null,
    })
  })
})

onBeforeUnmount(() => {
  colors.forEach((color) => {
    unregisterItem(`pe-color-${color.id}`)
  })
})

const selectedLabel = computed(() => {
  if (!value.value) return null
  return colors.find((c) => c.id === value.value)?.label ?? null
})

const selectedHex = computed(() => {
  if (!value.value) return null
  return colors.find((c) => c.id === value.value)?.hex ?? null
})

function selectRandom() {
  const random = colors[Math.floor(Math.random() * colors.length)]
  value.value = random.id
}
</script>

<template>
  <div class="pe-demo">
    <div class="pe-buttons">
      <button class="pe-btn" @click="open()">Open</button>
      <button class="pe-btn" @click="close()">Close</button>
      <button class="pe-btn" @click="toggle()">Toggle</button>
      <button class="pe-btn" @click="clear()">Clear</button>
      <button class="pe-btn" @click="focus()">Focus</button>
      <button class="pe-btn pe-btn--accent" @click="selectRandom()">Random</button>
    </div>
    <div v-bind="getRootProps()">
      <div class="pe-control">
        <input
          v-bind="getInputProps()"
          placeholder="Pick a color..."
          class="pe-input"
        />
      </div>
      <ul
        v-if="isOpen"
        v-bind="getListboxProps()"
        class="pe-content"
      >
        <li
          v-for="item in visibleItems"
          :key="item.id"
          v-bind="getOptionProps(item)"
          class="pe-option"
          :class="{ 'pe-option--selected': item.value === value }"
        >
          <span
            class="pe-swatch"
            :style="{ background: colors.find(c => c.id === item.value)?.hex }"
          ></span>
          {{ item.label }}
        </li>
      </ul>
    </div>
    <p v-if="selectedLabel" class="pe-result">
      Selected:
      <span class="pe-swatch-inline" :style="{ background: selectedHex }"></span>
      <strong>{{ selectedLabel }}</strong>
    </p>
    <p class="demo-note">This styling is for demos only — the library ships zero CSS</p>
  </div>
</template>

<style scoped>
.pe-demo {
  max-width: 360px;
}

.pe-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.75rem;
}

.pe-btn {
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

.pe-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.pe-btn--accent {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.pe-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: var(--vp-c-bg);
  transition: border-color 0.2s;
}

.pe-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.pe-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.pe-input::placeholder {
  color: var(--vp-c-text-3);
}

.pe-content {
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

.pe-option {
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

.pe-option[data-highlighted="true"] {
  background-color: var(--vp-c-brand-soft);
}

.pe-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
}

.pe-swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.pe-swatch-inline {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 3px;
  vertical-align: middle;
  margin-right: 4px;
}

.pe-result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
