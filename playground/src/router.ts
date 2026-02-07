import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import BasicSinglePage from './pages/BasicSinglePage.vue'
import UncontrolledDefaultsPage from './pages/UncontrolledDefaultsPage.vue'
import CustomFilterDebouncePage from './pages/CustomFilterDebouncePage.vue'
import LoopBehaviorPage from './pages/LoopBehaviorPage.vue'
import ProgrammaticControlPage from './pages/ProgrammaticControlPage.vue'
import MultiFoundationPage from './pages/MultiFoundationPage.vue'
import ClearSemanticsPage from './pages/ClearSemanticsPage.vue'
import TagSlotOverridePage from './pages/TagSlotOverridePage.vue'
import ResolveLabelPage from './pages/ResolveLabelPage.vue'
import CaretOnlyPage from './pages/CaretOnlyPage.vue'
import DataAttributesPage from './pages/DataAttributesPage.vue'
import ScrollableContentPage from './pages/ScrollableContentPage.vue'
import FutureFeaturesPage from './pages/FutureFeaturesPage.vue'

export interface PlaygroundNavItem {
  to: string
  label: string
  summary: string
}

export interface PlaygroundNavSection {
  title: string
  items: PlaygroundNavItem[]
}

export const playgroundNavSections: PlaygroundNavSection[] = [
  {
    title: 'Core',
    items: [
      {
        to: '/basic-single',
        label: 'Basic Single Select',
        summary: 'Search, keyboard nav, selection, and clear button.',
      },
      {
        to: '/programmatic-control',
        label: 'Programmatic Control',
        summary: 'Drive open/close/toggle via SelectRoot exposed methods.',
      },
      {
        to: '/uncontrolled-defaults',
        label: 'Uncontrolled Defaults',
        summary: 'Use defaultValue/defaultOpen without v-model control.',
      },
      {
        to: '/custom-filter-debounce',
        label: 'Custom Filter + Debounce',
        summary: 'Swap filter logic and delay query updates.',
      },
      {
        to: '/loop-disabled',
        label: 'Loop Disabled',
        summary: 'Stop keyboard navigation at first/last option.',
      },
    ],
  },
  {
    title: 'Multi Select',
    items: [
      {
        to: '/multi-foundation',
        label: 'Tag Foundation',
        summary: 'Inline tags with SelectTag + scoped-slot selected items.',
      },
      {
        to: '/caret-only-input',
        label: 'Caret-only Input',
        summary: 'Keep keyboard/filter behavior while rendering only caret.',
      },
      {
        to: '/clear-semantics',
        label: 'Clear Semantics',
        summary: 'Compare SelectClear behavior in single vs multi modes.',
      },
      {
        to: '/tag-slot-override',
        label: 'Tag Slot Override',
        summary: 'Render fully custom tag markup with SelectTag slot API.',
      },
      {
        to: '/resolve-label',
        label: 'Resolve Label',
        summary: 'Map preselected IDs to labels before first open.',
      },
    ],
  },
  {
    title: 'Styling',
    items: [
      {
        to: '/data-attributes',
        label: 'Data Attributes',
        summary: 'Style by data-state/selected/highlighted/disabled hooks.',
      },
      {
        to: '/scrollable-content',
        label: 'Scrollable Content',
        summary: 'Long list with internal overflow scroll via scoped CSS.',
      },
    ],
  },
  {
    title: 'Roadmap',
    items: [
      {
        to: '/future-features',
        label: 'Future Features',
        summary: 'Planned API sketches for upcoming phases.',
      },
    ],
  },
]

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/basic-single' },
  { path: '/basic-single', component: BasicSinglePage },
  { path: '/programmatic-control', component: ProgrammaticControlPage },
  { path: '/uncontrolled-defaults', component: UncontrolledDefaultsPage },
  { path: '/custom-filter-debounce', component: CustomFilterDebouncePage },
  { path: '/loop-disabled', component: LoopBehaviorPage },
  { path: '/multi-foundation', component: MultiFoundationPage },
  { path: '/caret-only-input', component: CaretOnlyPage },
  { path: '/clear-semantics', component: ClearSemanticsPage },
  { path: '/tag-slot-override', component: TagSlotOverridePage },
  { path: '/resolve-label', component: ResolveLabelPage },
  { path: '/data-attributes', component: DataAttributesPage },
  { path: '/scrollable-content', component: ScrollableContentPage },
  { path: '/future-features', component: FutureFeaturesPage },
  { path: '/:pathMatch(.*)*', redirect: '/basic-single' },
]

export const playgroundRouter = createRouter({
  history: createWebHashHistory(),
  routes,
})
