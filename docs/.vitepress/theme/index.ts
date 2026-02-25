import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { enhanceAppWithTabs } from 'vitepress-plugin-tabs/client'
import DemoBox from './components/DemoBox.vue'
import PropTable from './components/PropTable.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    enhanceAppWithTabs(app)
    app.component('DemoBox', DemoBox)
    app.component('PropTable', PropTable)
  },
} satisfies Theme
