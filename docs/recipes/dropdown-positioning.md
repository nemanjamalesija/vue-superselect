# Dropdown Positioning

`SelectContent` handles its own positioning. When `@floating-ui/vue` is installed, the dropdown uses smart positioning that automatically flips and shifts to stay visible within the viewport. Without it, the dropdown falls back to CSS absolute positioning.

<script setup>
import PositioningDemo from '../examples/PositioningDemo.vue'
import PositioningTeleportDemo from '../examples/PositioningTeleportDemo.vue'
</script>

## Default Positioning

By default, the dropdown opens below the input aligned to the start edge (`bottom-start`).

<DemoBox title="Default Positioning">
  <ClientOnly>
    <PositioningDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/PositioningDemo.vue

  </template>
</DemoBox>

### Placement Options

Control where the dropdown appears with the `placement` prop on `SelectContent`:

```vue-html
<SelectContent placement="bottom-start">
  <!-- ... -->
</SelectContent>
```

Available placements:

| Placement | Description |
|-----------|-------------|
| `bottom-start` | Below, aligned to start (default) |
| `bottom` | Below, centered |
| `bottom-end` | Below, aligned to end |
| `top-start` | Above, aligned to start |
| `top` | Above, centered |
| `top-end` | Above, aligned to end |

When `@floating-ui/vue` is installed, the dropdown automatically flips to the opposite side if there isn't enough room (e.g., `bottom-start` flips to `top-start` near the bottom of the viewport).

### Floating UI vs CSS Fallback

vue-superselect treats `@floating-ui/vue` as an **optional peer dependency**:

- **With `@floating-ui/vue` installed:** Smart positioning with automatic flip and shift. The dropdown measures available space and repositions itself to stay visible.
- **Without `@floating-ui/vue`:** CSS fallback with `position: absolute`. The dropdown opens at the specified placement and does not reposition.

Install it if you need smart positioning:

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

No code changes are needed — `SelectContent` detects the package automatically and switches to smart positioning.

### Collision Strategy

When using Floating UI, control how the dropdown handles collisions with the `collision-strategy` prop:

```vue-html
<SelectContent placement="bottom-start" collision-strategy="flip">
  <!-- ... -->
</SelectContent>
```

| Strategy | Description |
|----------|-------------|
| `flip` | Flip to the opposite side if not enough room (default) |
| `none` | Stay at the specified placement regardless of available space |

## Teleport for Overflow Containers

When a select is inside a container with `overflow: hidden` or `overflow: auto`, the dropdown gets clipped. Use the `teleport` prop to render the dropdown outside the container.

<DemoBox title="Teleport for Overflow Escape">
  <ClientOnly>
    <PositioningTeleportDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/PositioningTeleportDemo.vue

  </template>
</DemoBox>

### Teleport Options

```vue-html
<!-- No teleport (default) — dropdown is inline -->
<SelectContent :teleport="false">

<!-- Teleport to body -->
<SelectContent :teleport="true">

<!-- Teleport to a specific selector -->
<SelectContent teleport="#my-container">
```

| Value | Behavior |
|-------|----------|
| `false` | Dropdown renders inline (default) |
| `true` | Dropdown teleports to `<body>` |
| `"#selector"` | Dropdown teleports to the specified element |

When teleported to `<body>` with `@floating-ui/vue` installed, the dropdown remains visually positioned next to the input — it just lives in a different part of the DOM to escape overflow clipping.

::: tip Scoped styles and teleport
When using `teleport`, the dropdown content is rendered outside your component's DOM tree. Scoped styles (`<style scoped>`) will not apply to teleported content. Use global styles or CSS classes without the `scoped` attribute for the dropdown.
:::

### Force Absolute

The `force-absolute` prop disables Floating UI positioning and uses plain CSS `position: absolute` instead:

```vue-html
<SelectContent force-absolute>
  <!-- ... -->
</SelectContent>
```

This is useful when you want the dropdown to be positioned relative to a custom teleport target rather than the input.

### Data Attributes for Styling

`SelectContent` exposes data attributes based on its current position:

```css
/* Style based on which side the dropdown opened on */
[data-side="top"] {
  border-bottom: 2px solid var(--brand);
}

[data-side="bottom"] {
  border-top: 2px solid var(--brand);
}
```

| Attribute | Values |
|-----------|--------|
| `data-side` | `"top"`, `"bottom"`, `"left"`, `"right"` |
| `data-align` | `"start"`, `"center"`, `"end"` |

## Summary

| Scenario | Configuration |
|----------|---------------|
| Simple dropdown | Default — no props needed |
| Specific placement | `placement="top-start"` |
| Inside scrollable container | `:teleport="true"` |
| Fixed placement (no flip) | `collision-strategy="none"` |
| Custom teleport target | `teleport="#my-panel"` |
| No Floating UI available | Works with CSS fallback automatically |

## Next Steps

- [Basic Select](/recipes/basic-select) — start with the simplest select patterns
- [Multi-Select](/recipes/multi-select) — multi-select with tags and limits
- [Accessibility](/core-concepts/accessibility) — keyboard navigation and screen reader support
