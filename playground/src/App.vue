<script setup lang="ts">
/**
 * Playground shell:
 * - Keeps example composition in one place.
 * - Lets you scan multiple scenarios quickly.
 */
import BasicSingleSelect from './examples/BasicSingleSelect.vue'
import ProgrammaticControl from './examples/ProgrammaticControl.vue'
import DataAttributesDemo from './examples/DataAttributesDemo.vue'
import FutureFeatures from './examples/FutureFeatures.vue'
</script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Playground</p>
      <h1>Vue Superselect in motion</h1>
      <p>
        This local playground lets you explore the current headless select
        components and see how upcoming features might be shaped. Everything here
        runs against the source in this repo, so it stays in sync as we build.
      </p>
    </section>

    <section class="grid">
      <BasicSingleSelect />
      <ProgrammaticControl />
      <DataAttributesDemo />
    </section>

    <FutureFeatures />
  </main>
</template>
