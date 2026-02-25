# How It Works

vue-superselect provides two ways to build select components: **compound components** (recommended) and a **composable API**. Both share the same underlying state engine — they differ only in how you consume it.

<script setup>
import HowItWorksCompoundDemo from '../examples/HowItWorksCompoundDemo.vue'
import HowItWorksComposableDemo from '../examples/HowItWorksComposableDemo.vue'
</script>

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

**SelectRoot** is the brain. It creates all the state — selected value, open/closed, search query, keyboard navigation, ARIA attributes — and provides it to every child component through Vue's `provide()`. You never have to pass props down manually.

Each child component calls `inject()` to access exactly what it needs. `SelectInput` reads and writes the search query. `SelectOption` registers itself in the collection and checks if it's selected. `SelectContent` reads the open state and renders only when the dropdown should be visible.

### Why Compound Components?

- **Declarative** — your template shows what the select looks like, not how it works
- **Flexible** — reorder, omit, or wrap any component. Don't need a clear button? Don't render `SelectClear`.
- **Type-safe** — each component has its own typed props and slots
- **Accessible by default** — ARIA attributes are wired automatically between components

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

The composable returns getter functions — `getRootProps()`, `getInputProps()`, `getListboxProps()`, and `getOptionProps()` — that generate the correct HTML attributes, ARIA properties, and event handlers for each element.

```ts
const { getRootProps, getInputProps, getListboxProps, getOptionProps } = useSelect({
  items: options,
  labelKey: 'label',
  valueKey: 'id',
})
```

Spread these on your own elements:

```vue-html
<div v-bind="getRootProps()">
  <input v-bind="getInputProps()" />
  <ul v-bind="getListboxProps()">
    <li v-for="item in visibleItems" :key="item.id" v-bind="getOptionProps(item)">
      {{ item.label }}
    </li>
  </ul>
</div>
```

You can pass your own props to any getter and they will be merged:

```ts
getInputProps({ class: 'my-input', placeholder: 'Search...' })
```

### When to Use the Composable

- You need complete control over the DOM structure
- You are integrating with a design system that requires specific element nesting
- You are building a wrapper component that re-exports customized behavior

For most use cases, compound components are simpler and recommended.

## Choosing an API

| | Compound Components | Composable |
|---|---|---|
| **Setup** | Drop in components | Wire up prop getters |
| **Flexibility** | High — reorder/omit components | Full — any DOM structure |
| **Accessibility** | Automatic | Automatic via prop getters |
| **Learning curve** | Lower | Higher |
| **Best for** | Most applications | Design system integration |

Both APIs produce the same accessible, keyboard-navigable select with identical behavior. Choose based on how much control you need over the rendered markup.

## Next Steps

- [Controlled State](/core-concepts/controlled-state) — understand v-model binding and state patterns
- [Accessibility](/core-concepts/accessibility) — keyboard navigation and screen reader support
- [Basic Select](/recipes/basic-select) — build your first select step by step
- [API Reference: Components](/api/components) — full prop, slot, and event docs
- [API Reference: Composable](/api/composable) — `useSelect()` return values and options
