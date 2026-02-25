<script setup lang="ts">
import { ref, useId } from 'vue'
import {
  SelectRoot,
  SelectControl,
  SelectInput,
  SelectContent,
  SelectOption,
} from 'vue-superselect'

const selected = ref<string | null>(null)
const fruits = [
  'Apple',
  'Banana',
  'Blueberry',
  'Cherry',
  'Grape',
  'Mango',
  'Orange',
  'Strawberry',
]

const props = withDefaults(defineProps<{
  hero?: boolean
}>(), {
  hero: false,
})

const inputId = `landing-demo-input-${useId()}`
</script>

<template>
  <div class="landing-demo" :class="{ 'landing-demo--hero': props.hero }">
    <label class="landing-demo__title" :for="inputId">See it in action</label>
    <div class="landing-demo__container">
      <SelectRoot v-model="selected">
        <SelectControl class="landing-control">
          <SelectInput :id="inputId" placeholder="Pick a fruit..." class="landing-input" />
        </SelectControl>
        <SelectContent
          class="landing-content"
          placement="bottom-start"
          collisionStrategy="none"
        >
          <SelectOption
            v-for="fruit in fruits"
            :key="fruit"
            :value="fruit"
            :label="fruit"
            v-slot="{ selected: isSelected, active }"
            class="landing-option"
            :class="{
              'landing-option--selected': isSelected,
              'landing-option--active': active,
            }"
          >
            {{ fruit }}
          </SelectOption>
        </SelectContent>
      </SelectRoot>
      <p v-if="selected" class="landing-demo__result">
        Selected: <strong>{{ selected }}</strong>
      </p>
    </div>
    <p v-if="!props.hero" class="demo-note">
      This styling is for demos only. The library ships zero CSS
    </p>
  </div>
</template>

<style scoped>
.landing-demo {
  max-width: 400px;
  margin: 2rem auto;
  text-align: center;
}

.landing-demo--hero {
  width: 100%;
  max-width: none;
  margin: 0;
  text-align: left;
}

.landing-demo__title {
  display: block;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--vp-c-text-1);
  text-align: center;
  cursor: pointer;
}

.landing-demo--hero .landing-demo__title {
  font-size: 0.9375rem;
  font-weight: 600;
  margin-bottom: 0.625rem;
  text-align: left;
  line-height: 1.4;
  color: var(--vp-c-text-2);
}

.landing-demo__container {
  text-align: left;
  position: relative;
}

.landing-control {
  display: flex;
  align-items: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  background: transparent;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.landing-demo--hero .landing-control {
  background: var(--vp-c-bg-soft);
}

.landing-control:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.landing-input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.9375rem;
  background: transparent;
  color: var(--vp-c-text-1);
}

.landing-input::placeholder {
  color: var(--vp-c-text-3);
}

.landing-content {
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -2px rgba(0, 0, 0, 0.1);
  min-width: var(--superselect-trigger-width, 100%);
  width: var(--superselect-trigger-width, 100%);
  max-height: 240px;
  overflow-y: auto;
  z-index: 50;
  padding: 4px;
}

.landing-option {
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9375rem;
  color: var(--vp-c-text-1);
  transition: background-color 0.15s, color 0.15s, box-shadow 0.15s;
}

.landing-option:hover,
.landing-option--active,
.landing-option[data-highlighted='true'] {
  background-color: var(--vp-c-brand-soft);
}

.landing-option--selected {
  font-weight: 600;
  color: var(--vp-c-brand-1);
  box-shadow: inset 2px 0 0 var(--vp-c-brand-1);
}

.landing-demo__result {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
  text-align: center;
}

.landing-demo--hero .landing-demo__result {
  text-align: left;
  margin-top: 0.625rem;
  font-size: 0.8125rem;
}
</style>
