<script setup lang="ts">
/**
 * Example: Future feature sketches.
 *
 * Why this exists:
 * - Captures intent without implying the APIs are final.
 * - Helps us align upcoming phases with concrete UI examples.
 *
 * How to use:
 * - Treat these as read-only pseudo-code.
 * - Update the snippets as soon as a real implementation lands.
 */

const futureExamples = [
  {
    title: 'Outside click dismiss (planned 06-02)',
    description:
      'Close dropdown when pointer/focus leaves while preserving current selection.',
    code: `<SelectRoot v-model="value" dismissOnOutsideInteraction>
  <SelectControl>
    <SelectInput />
  </SelectControl>
  <SelectContent />
</SelectRoot>`,
  },
  {
    title: 'Option groups (planned)',
    description:
      'Group options with headings and separators while preserving DOM order.',
    code: `<SelectContent>
  <SelectGroup label="Fruits">
    <SelectOption value="apple" label="Apple" />
  </SelectGroup>
  <SelectGroup label="Vegetables">
    <SelectOption value="carrot" label="Carrot" />
  </SelectGroup>
</SelectContent>`,
  },
  {
    title: 'Advanced positioning tuning (future)',
    description:
      'Expose offset and viewport-padding tuning once the baseline Phase 5 API stabilizes. Note: placement and collisionStrategy are already available now.',
    code: `<SelectContent
  placement="bottom-start"
  collisionStrategy="none"
  :positioning="{ offset: 8, viewportPadding: 12 }"
>
  <SelectOption value="small" label="Small" />
</SelectContent>`,
  },
  {
    title: 'Async filtering (planned)',
    description:
      'Load results on demand with a loading state and cached query results.',
    code: `const { query, results, loading } = useAsyncSelect(fetcher)

<SelectInput placeholder="Search" />
<SelectContent>
  <SelectLoading v-if="loading" />
  <SelectOption v-for="item in results" :value="item.id" />
</SelectContent>`,
  },
]
</script>

<template>
  <section class="card">
    <header>
      <h2>Future features (sketches)</h2>
      <p>
        These are intentional placeholders so you can see where the library is
        headed without implying the APIs are finalized.
      </p>
    </header>

    <div class="future-grid">
      <article v-for="example in futureExamples" :key="example.title">
        <h3>{{ example.title }}</h3>
        <p class="note">{{ example.description }}</p>
        <pre class="code-block">{{ example.code }}</pre>
      </article>
    </div>
  </section>
</template>
