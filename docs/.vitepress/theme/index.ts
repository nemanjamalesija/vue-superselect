import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import DemoBox from './components/DemoBox.vue'
import PropTable from './components/PropTable.vue'
import LandingDemo from '../../examples/LandingDemo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-image': () => h('div', { class: 'landing-hero-demo' }, [h(LandingDemo, { hero: true })]),
    }),
  enhanceApp({ app }) {
    enhanceAppWithTabs(app)
    app.component('DemoBox', DemoBox)
    app.component('PropTable', PropTable)
  },
} satisfies Theme
