import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
import BasicSingleSelect from './examples/BasicSingleSelect.vue'
import UncontrolledDefaultsDemo from './examples/UncontrolledDefaultsDemo.vue'
import CustomFilterDebounceDemo from './examples/CustomFilterDebounceDemo.vue'
import LoopBehaviorDemo from './examples/LoopBehaviorDemo.vue'
import ProgrammaticControl from './examples/ProgrammaticControl.vue'
import MultiSelectFoundation from './examples/MultiSelectFoundation.vue'
import MultiSelectAllFeatures from './examples/MultiSelectAllFeatures.vue'
import ClearSemanticsDemo from './examples/ClearSemanticsDemo.vue'
import TagSlotOverrideDemo from './examples/TagSlotOverrideDemo.vue'
import ResolveLabelPreselectedDemo from './examples/ResolveLabelPreselectedDemo.vue'
import CaretOnlyInputTags from './examples/CaretOnlyInputTags.vue'
import DataAttributesDemo from './examples/DataAttributesDemo.vue'
import ScrollableContentDemo from './examples/ScrollableContentDemo.vue'
import FutureFeatures from './examples/FutureFeatures.vue'

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
        to: '/multi-all-features',
        label: 'All Features',
        summary: 'Tags, Backspace remove, clear-all, max, and hideSelected.',
      },
      {
        to: '/multi-foundation',
        label: 'Tag Foundation',
        summary: 'Inline tags with SelectTag, scoped-slot data, and Backspace remove.',
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
  { path: '/basic-single', component: BasicSingleSelect },
  { path: '/programmatic-control', component: ProgrammaticControl },
  { path: '/uncontrolled-defaults', component: UncontrolledDefaultsDemo },
  { path: '/custom-filter-debounce', component: CustomFilterDebounceDemo },
  { path: '/loop-disabled', component: LoopBehaviorDemo },
  { path: '/multi-all-features', component: MultiSelectAllFeatures },
  { path: '/multi-foundation', component: MultiSelectFoundation },
  { path: '/caret-only-input', component: CaretOnlyInputTags },
  { path: '/clear-semantics', component: ClearSemanticsDemo },
  { path: '/tag-slot-override', component: TagSlotOverrideDemo },
  { path: '/resolve-label', component: ResolveLabelPreselectedDemo },
  { path: '/data-attributes', component: DataAttributesDemo },
  { path: '/scrollable-content', component: ScrollableContentDemo },
  { path: '/future-features', component: FutureFeatures },
  { path: '/:pathMatch(.*)*', redirect: '/basic-single' },
]

export const playgroundRouter = createRouter({
  history: createWebHashHistory(),
  routes,
})
