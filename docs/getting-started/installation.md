# Installation

## Package Manager

Install `vue-superselect` as a dependency in your Vue 3 project:

::: code-group

```sh [npm]
npm install vue-superselect
```

```sh [yarn]
yarn add vue-superselect
```

```sh [pnpm]
pnpm add vue-superselect
```

:::

## Peer Dependencies

**Vue 3.5+** is required as a peer dependency. If you are already using Vue 3.5 or later, no additional setup is needed.

### Floating UI (optional)

For automatic dropdown positioning with collision detection, install `@floating-ui/vue`:

::: code-group

```sh [npm]
npm install @floating-ui/vue
```

```sh [yarn]
yarn add @floating-ui/vue
```

```sh [pnpm]
pnpm add @floating-ui/vue
```

:::

If `@floating-ui/vue` is not installed, you can position the dropdown yourself using CSS. The library works without it.

## TypeScript

vue-superselect ships TypeScript declarations out of the box. No additional `@types` packages are needed.

The library is written with TypeScript strict mode and provides full generic inference for option types, values, and labels.

```ts
import { SelectRoot, SelectOption } from 'vue-superselect'
// Types are automatically inferred - no extra setup needed
```

## Browser Support

vue-superselect supports all modern browsers that Vue 3 supports:

- Chrome / Edge 88+
- Firefox 78+
- Safari 14+

## Next Steps

Once installed, head to the [Quick Start](/getting-started/quick-start) guide to build your first select component.
