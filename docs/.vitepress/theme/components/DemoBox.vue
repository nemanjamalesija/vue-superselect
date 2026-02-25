<script setup lang="ts">
import { ref, computed, useSlots } from 'vue'

defineProps<{
  title?: string
}>()

const showSource = ref(false)
const slots = useSlots()
const hasSource = computed(() => !!slots.source)
</script>

<template>
  <div class="demo-box">
    <div
      v-if="title || hasSource"
      class="demo-box__header"
      :class="{ 'demo-box__header--controls-only': hasSource && !title }"
    >
      <div v-if="title" class="demo-box__title">{{ title }}</div>
      <div v-if="hasSource" class="demo-box__view-toggle" role="group" aria-label="Demo view">
        <button
          type="button"
          class="demo-box__view-button"
          :class="{ 'is-active': !showSource }"
          :aria-pressed="!showSource"
          @click="showSource = false"
        >
          Preview
        </button>
        <button
          type="button"
          class="demo-box__view-button"
          :class="{ 'is-active': showSource }"
          :aria-pressed="showSource"
          @click="showSource = true"
        >
          Source
        </button>
      </div>
    </div>
    <div v-show="!hasSource || !showSource" class="demo-box__preview">
      <slot />
    </div>
    <div v-if="hasSource" v-show="showSource" class="demo-box__source">
      <slot name="source" />
    </div>
  </div>
</template>
