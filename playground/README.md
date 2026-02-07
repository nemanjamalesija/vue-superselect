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

## Routed sections

The playground now uses `vue-router` and is organized in docs-like sections:

- Core
- Multi Select
- Styling
- Roadmap

Routes are hash-based with a flat path structure (`/#/basic-single`,
`/#/multi-foundation`, `/#/data-attributes`, etc.) so each example is a direct
page target.

## How to read the examples

Each example is a teaching artifact: it documents the UI problem, shows how the
components map to that problem, and highlights the data/ARIA wiring that the
library provides.

Examples live in `playground/src/examples/`:

- `BasicSingleSelect.vue`
  - Shows the full single-select stack: root, control, input, trigger, clear,
    content, option, empty, live region.
  - Demonstrates filtering, keyboard navigation, selection, and open state.
- `UncontrolledDefaultsDemo.vue`
  - Demonstrates `defaultValue` and `defaultOpen` without wiring v-model.
  - Useful when parent code does not need to actively control state.
- `CustomFilterDebounceDemo.vue`
  - Demonstrates `SelectRoot.filter` with custom matching rules.
  - Demonstrates `SelectRoot.debounce` for delayed filtering updates.
- `LoopBehaviorDemo.vue`
  - Demonstrates `SelectRoot.loop={false}` keyboard behavior.
  - Arrow navigation stops at edges instead of wrapping.
- `ProgrammaticControl.vue`
  - Uses the `SelectRoot` exposed API (`open`, `close`, `toggle`) to drive the
    UI from external buttons.
- `MultiSelectFoundation.vue`
  - Shows current Phase 04-02 behavior: `multiple` array v-model with in-control
    tags rendered through `SelectControl` scoped slot data + `SelectTag`.
  - Demonstrates accessible remove buttons (`aria-label`, `type="button"`) and
    live region announcements for add/remove.
- `ClearSemanticsDemo.vue`
  - Compares `SelectClear` semantics side-by-side:
    single mode clears to `null`, multi mode clears to `[]`.
- `TagSlotOverrideDemo.vue`
  - Demonstrates custom chip/tag markup through the `SelectTag` default slot.
  - Keeps remove behavior wired through `SelectTag` slot props + `remove` event.
- `ResolveLabelPreselectedDemo.vue`
  - Demonstrates `SelectRoot.resolveLabel` for stable labels when selected values
    are preloaded IDs and content has not mounted yet.
- `CaretOnlyInputTags.vue`
  - Shows a tags-first visual style where only a caret-like input area is
    visible next to tags.
  - Keeps the real input mounted so filtering, keyboard, and ARIA still work.
- `DataAttributesDemo.vue`
  - Styles options using `data-state`, `data-selected`, `data-highlighted`, and
    `data-disabled` instead of hand-rolled state flags.
- `ScrollableContentDemo.vue`
  - Demonstrates long-list overflow behavior with `max-height` + `overflow-y`.
  - Keeps scroll CSS local in `<style scoped>` so it can be copied as-is.
- `FutureFeatures.vue`
  - Sketches still-pending APIs (Backspace tag removal, grouping, floating
    positioning, async filtering) in read-only form to communicate intent.

If you add a new feature, add a matching example here with a short written
explanation and a code snippet, even if the example is just a placeholder.
