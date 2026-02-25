import { defineConfig } from 'vitepress'
import { tabsMarkdownPlugin } from 'vitepress-plugin-tabs'
import { resolve } from 'node:path'

export default defineConfig({
  title: 'vue-superselect',
  description: 'Headless Vue 3 select/combobox component library',
  base: '/vue-superselect/',
  ignoreDeadLinks: true,

  themeConfig: {
    search: {
      provider: 'local',
    },
    nav: [
      { text: 'Guide', link: '/getting-started/installation' },
      { text: 'API', link: '/api/components' },
      { text: 'Recipes', link: '/recipes/basic-select' },
    ],
    sidebar: {
      '/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Installation', link: '/getting-started/installation' },
            { text: 'Quick Start', link: '/getting-started/quick-start' },
          ],
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'How It Works', link: '/core-concepts/how-it-works' },
            {
              text: 'Controlled State',
              link: '/core-concepts/controlled-state',
            },
            { text: 'Accessibility', link: '/core-concepts/accessibility' },
          ],
        },
        {
          text: 'Recipes',
          items: [
            { text: 'Basic Select', link: '/recipes/basic-select' },
            { text: 'Multi-Select', link: '/recipes/multi-select' },
            { text: 'Custom Filtering', link: '/recipes/custom-filtering' },
            {
              text: 'Dropdown Positioning',
              link: '/recipes/dropdown-positioning',
            },
            { text: 'Disabled Options', link: '/recipes/disabled-options' },
            { text: 'Custom Rendering', link: '/recipes/custom-rendering' },
            {
              text: 'Programmatic Control',
              link: '/recipes/programmatic-control',
            },
          ],
        },
        {
          text: 'API Reference',
          items: [
            { text: 'Components', link: '/api/components' },
            { text: 'Composable', link: '/api/composable' },
          ],
        },
        {
          text: 'Migration',
          items: [
            { text: 'From vue-select', link: '/migration/from-vue-select' },
          ],
        },
      ],
    },
    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/nemanjamalesija/vue-superselect',
      },
    ],
  },

  markdown: {
    config(md) {
      md.use(tabsMarkdownPlugin)
    },
  },

  vite: {
    resolve: {
      dedupe: ['vue'],
      alias: {
        'vue-superselect': resolve(__dirname, '../../src/index.ts'),
      },
    },
    define: {
      __DEV__: 'true',
    },
  },
})
