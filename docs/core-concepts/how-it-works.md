# How It Works

vue-superselect provides two ways to build select components: **compound components** (recommended) and a **composable API**. Both share the same underlying state engine and differ only in how you consume it.

<script setup>
import HowItWorksCompoundDemo from '../examples/HowItWorksCompoundDemo.vue'
import HowItWorksComposableDemo from '../examples/HowItWorksComposableDemo.vue'
</script>

## API Style at a Glance

Both APIs work with either Vue style. Use this as the quick mental map, then inspect each demo's source tab for full markup.

:::tabs key:api-style
== Composition API
```vue
<script setup>
import { ref } from 'vue'
import { SelectRoot, SelectControl, SelectInput } from 'vue-superselect'
import { useSelect } from 'vue-superselect'

const selected = ref(null)
const { getRootProps, getInputProps } = useSelect({
  items: ['Apple', 'Banana', 'Cherry'],
})
</script>
```
== Options API
```vue
<script>
import { SelectRoot, SelectControl, SelectInput, useSelect } from 'vue-superselect'

export default {
  components: { SelectRoot, SelectControl, SelectInput },
  setup() {
    const api = useSelect({ items: ['Apple', 'Banana', 'Cherry'] })
    return { ...api }
  },
}
</script>
```
:::

## Compound Components

The primary API. Each component handles one responsibility, composed together declaratively in your template. `SelectRoot` manages all state internally and shares it with child components via Vue's provide/inject.

<DemoBox title="Compound Components">
  <ClientOnly>
    <HowItWorksCompoundDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/HowItWorksCompoundDemo.vue

  </template>
</DemoBox>

### How It Fits Together

```
SelectRoot           ← State container (provide)
├── SelectControl    ← Trigger wrapper (inject)
│   ├── SelectInput  ← Search field (inject)
│   ├── SelectTrigger← Toggle button (inject)
│   └── SelectClear  ← Clear button (inject)
├── SelectContent    ← Dropdown panel (inject)
│   ├── SelectOption ← Individual choice (inject)
│   └── SelectEmpty  ← No-results message (inject)
├── SelectTag        ← Multi-select tag (inject)
└── SelectLiveRegion ← Screen reader announcements (inject)
```

**SelectRoot** is the brain. It creates all the state (selected value, open/closed, search query, keyboard navigation, ARIA attributes) and provides it to every child component through Vue's `provide()`. You never have to pass props down manually.

Each child component calls `inject()` to access exactly what it needs. `SelectInput` reads and writes the search query. `SelectOption` registers itself in the collection and checks if it's selected. `SelectContent` reads the open state and renders only when the dropdown should be visible.

### Why Compound Components?

- **Declarative**: your template shows what the select looks like, not how it works
- **Flexible**: reorder, omit, or wrap any component. Don't need a clear button? Don't render `SelectClear`.
- **Type-safe**: each component has its own typed props and slots
- **Accessible by default**: ARIA attributes are wired automatically between components

## Composable API

For cases where compound components are too prescriptive, `useSelect()` gives you raw state and **prop getter functions** that you spread on your own elements.

<DemoBox title="Composable API with Prop Getters">
  <ClientOnly>
    <HowItWorksComposableDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/HowItWorksComposableDemo.vue

  </template>
</DemoBox>

### Prop Getters

`useSelect()` gives you prop getter functions (`getRootProps`, `getInputProps`, `getListboxProps`, `getOptionProps`) so you can keep all accessibility and keyboard behavior while rendering your own markup.

For full signatures, merge behavior, and return types, see:
- [API: Composable / Prop Getters](/api/composable#prop-getters)
- [API: Composable / Return Value](/api/composable#return-value)

### When to Use the Composable

- You need complete control over the DOM structure
- You are integrating with a design system that requires specific element nesting
- You are building a wrapper component that re-exports customized behavior

For most use cases, compound components are simpler and recommended.

## Choosing an API

| | Compound Components | Composable |
|---|---|---|
| **Setup** | Drop in components | Wire up prop getters |
| **Flexibility** | High (reorder/omit components) | Full (any DOM structure) |
| **Accessibility** | Automatic | Automatic via prop getters |
| **Learning curve** | Lower | Higher |
| **Best for** | Most applications | Design system integration |

Both APIs produce the same accessible, keyboard-navigable select with identical behavior. Choose based on how much control you need over the rendered markup.

## Next Steps

- [Controlled State](/core-concepts/controlled-state)
- [Accessibility](/core-concepts/accessibility)
- [Basic Select](/recipes/basic-select)
- [API Reference: Components](/api/components)
- [API Reference: Composable](/api/composable)
