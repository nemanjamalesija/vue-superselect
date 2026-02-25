<script setup lang="ts">
/**
 * Static display of typical vue-select usage.
 * vue-select is not installed -- this component renders
 * a visual representation of what vue-select code looks like.
 */
</script>

<template>
  <div class="migration-before">
    <h4>vue-select (v3)</h4>
    <div class="code-preview">
      <pre><code>&lt;v-select
  v-model="selected"
  :options="['Apple', 'Banana', 'Cherry']"
  placeholder="Pick a fruit..."
  clearable
/&gt;</code></pre>
    </div>
    <p class="migration-note">
      vue-select ships its own CSS and renders a fully styled dropdown.
    </p>
  </div>
</template>

<style scoped>
.migration-before {
  max-width: 400px;
  position: relative;
}

.migration-before h4 {
  margin: 0 0 8px;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}

.code-preview {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 12px 16px;
  font-family: var(--vp-font-family-mono);
  font-size: 0.8125rem;
  overflow-x: auto;
}

.code-preview pre {
  margin: 0;
}

.code-preview code {
  color: var(--vp-c-text-1);
}

.migration-note {
  margin-top: 8px;
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}
</style>
