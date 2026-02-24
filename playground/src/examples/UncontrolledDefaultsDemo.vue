<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  SelectRoot,
  SelectInput,
  SelectContent,
  SelectOption,
  SelectControl,
  SelectTrigger,
  SelectClear,
  SelectEmpty,
  SelectLiveRegion,
} from 'vue-superselect'

/**
 * Example: Uncontrolled defaults.
 *
 * Why this exists:
 * - Demonstrates `defaultValue` and `defaultOpen` usage.
 * - Shows that state can be internally managed without v-model bindings.
 */

type FrameworkOption = {
  id: string
  label: string
}

const options: FrameworkOption[] = [
  { id: 'vue', label: 'Vue' },
  { id: 'react', label: 'React' },
  { id: 'solid', label: 'Solid' },
  { id: 'svelte', label: 'Svelte' },
  { id: 'qwik', label: 'Qwik' },
]

const defaultValue = 'vue'
const defaultOpen = true

const observedValue = ref<string | null>(defaultValue)
const observedOpen = ref(defaultOpen)

const onValueChange = (value: unknown) => {
  observedValue.value = typeof value === 'string' ? value : null
}

const onOpenChange = (open: boolean) => {
  observedOpen.value = open
}

const selectedLabel = computed(() => {
  const match = options.find((option) => option.id === observedValue.value)
  return match?.label ?? 'Pick framework'
})
</script>

<template>
  <section class="card">
    <header>
      <h2>Uncontrolled defaults</h2>
      <p>
        Uses `defaultValue` and `defaultOpen` without controlling state via
        v-model.
      </p>
    </header>

    <SelectRoot
      id="playground-uncontrolled-defaults"
      :default-value="defaultValue"
      :default-open="defaultOpen"
      @update:model-value="onValueChange"
      @update:open="onOpenChange"
    >
      <SelectControl class="control">
        <SelectInput class="input" placeholder="Search frameworks" />
        <SelectTrigger class="trigger">{{ selectedLabel }}</SelectTrigger>
        <SelectClear v-if="observedValue !== null" class="clear">Clear</SelectClear>
      </SelectControl>

      <SelectContent force-absolute class="content">
        <SelectOption
          v-for="option in options"
          :id="`defaults-${option.id}`"
          :key="option.id"
          :value="option.id"
          :label="option.label"
          class="option"
        >
          {{ option.label }}
        </SelectOption>

        <SelectEmpty class="empty">No framework match</SelectEmpty>
      </SelectContent>

      <SelectLiveRegion />
    </SelectRoot>

    <div class="meta">
      <div>defaultValue: {{ defaultValue }}</div>
      <div>defaultOpen: {{ defaultOpen }}</div>
      <div>Observed value: {{ observedValue ?? 'null' }}</div>
      <div>Observed open: {{ observedOpen }}</div>
    </div>
  </section>
</template>
