# Playground

This is a local sandbox for exploring the headless select components during
active development. It is intentionally **not** part of the published package.

## Quick start

From the repo root:

```bash
npm install
cd playground
npm run dev
```

The Vite config aliases `vue-superselect` to `../src`, so you are always
previewing the latest source code without building.

## How to read the examples

Each example is a teaching artifact: it documents the UI problem, shows how the
components map to that problem, and highlights the data/ARIA wiring that the
library provides.

Examples live in `playground/src/examples/`:

- `BasicSingleSelect.vue`
  - Shows the full single-select stack: root, control, input, trigger, clear,
    content, option, empty, live region.
  - Demonstrates filtering, keyboard navigation, selection, and open state.
- `ProgrammaticControl.vue`
  - Uses the `SelectRoot` exposed API (`open`, `close`, `toggle`) to drive the
    UI from external buttons.
- `DataAttributesDemo.vue`
  - Styles options using `data-state`, `data-selected`, `data-highlighted`, and
    `data-disabled` instead of hand-rolled state flags.
- `FutureFeatures.vue`
  - Sketches planned APIs (multi-select, grouping, floating positioning, async
    filtering) in read-only form to communicate intent.

If you add a new feature, add a matching example here with a short written
explanation and a code snippet, even if the example is just a placeholder.
