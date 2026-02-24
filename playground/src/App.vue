<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import { playgroundNavSections } from './router'
</script>

<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">Playground</p>
      <h1>Vue Superselect in motion</h1>
      <p>
        This local playground is grouped by shipped capabilities. Each route is a
        focused example you can use to validate behavior before docs-site work.
      </p>
    </section>

    <section class="docs-shell">
      <aside class="docs-nav">
        <section
          v-for="section in playgroundNavSections"
          :key="section.title"
          class="nav-section"
        >
          <h2 class="nav-title">{{ section.title }}</h2>
          <RouterLink
            v-for="item in section.items"
            :key="item.to"
            :to="item.to"
            class="nav-link"
          >
            <strong>{{ item.label }}</strong>
            <span>{{ item.summary }}</span>
          </RouterLink>
        </section>
      </aside>

      <section class="docs-content">
        <RouterView />
      </section>
    </section>
  </main>
</template>
