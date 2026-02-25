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
    <div v-if="title" class="demo-box__header">{{ title }}</div>
    <div class="demo-box__preview">
      <slot />
    </div>
    <div v-if="hasSource" class="demo-box__actions">
      <button @click="showSource = !showSource">
        {{ showSource ? 'Hide Source' : 'View Source' }}
      </button>
    </div>
    <div v-if="showSource" class="demo-box__source">
      <slot name="source" />
    </div>
  </div>
</template>
