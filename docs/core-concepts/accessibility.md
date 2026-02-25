# Accessibility

vue-superselect implements the [WAI-ARIA Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) out of the box. Every component automatically applies the correct ARIA attributes, keyboard interactions, and screen reader announcements without any configuration.

<script setup>
import AccessibilityDemo from '../examples/AccessibilityDemo.vue'
</script>

<DemoBox title="Fully Accessible Select">
  <ClientOnly>
    <AccessibilityDemo />
  </ClientOnly>
  <template #source>

<<< ../examples/AccessibilityDemo.vue

  </template>
</DemoBox>

## Keyboard Navigation

All keyboard interactions follow the WAI-ARIA combobox specification:

| Key | Action |
|-----|--------|
| **Arrow Down** | Open dropdown (if closed), move highlight to next option |
| **Arrow Up** | Open dropdown (if closed), move highlight to previous option |
| **Enter** | Select the highlighted option, close dropdown (single select) |
| **Escape** | Close dropdown. If already closed, clear the input text. |
| **Tab** | Close dropdown and move focus to the next focusable element |
| **Backspace** | When input is empty in multi-select, remove the last selected tag |
| **Home** | Move highlight to the first option |
| **End** | Move highlight to the last option |

By default, keyboard navigation loops. Pressing Arrow Down on the last option wraps to the first. Disable with `:loop="false"` on `SelectRoot`.

The `select-on-tab` prop changes Tab behavior: instead of just closing, it selects the highlighted option first, then closes and moves focus.

## ARIA Attributes

The component tree automatically applies the correct roles and attributes:

### Input (Combobox)

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `combobox` | Identifies the input as a combobox |
| `aria-expanded` | `true` / `false` | Whether the dropdown is open |
| `aria-controls` | listbox id | Points to the dropdown element |
| `aria-activedescendant` | option id | Points to the currently highlighted option |
| `aria-autocomplete` | `list` | Indicates filtering behavior |

### Dropdown (Listbox)

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `listbox` | Identifies the dropdown as a list of options |
| `aria-multiselectable` | `true` (when `multiple`) | Indicates multi-select capability |

### Options

| Attribute | Value | Purpose |
|-----------|-------|---------|
| `role` | `option` | Identifies each item as a selectable option |
| `aria-selected` | `true` / `false` | Whether this option is currently selected |
| `aria-disabled` | `true` / `false` | Whether this option is disabled |

You do not need to set any of these attributes manually. They are applied by the components automatically.

## Screen Reader Announcements

Add `SelectLiveRegion` to enable screen reader announcements:

```vue-html
<SelectRoot v-model="selected">
  <SelectControl>
    <SelectInput placeholder="Pick a fruit..." />
  </SelectControl>
  <SelectContent>
    <SelectOption v-for="fruit in fruits" :key="fruit" :value="fruit" :label="fruit">
      {{ fruit }}
    </SelectOption>
  </SelectContent>
  <SelectLiveRegion />
</SelectRoot>
```

`SelectLiveRegion` uses an `aria-live="polite"` region to announce state changes to screen readers:

- When an option is selected: *"Apple selected"*
- When an option is removed (multi-select): *"Apple removed"*
- When the selection is cleared: *"Selection cleared"*
- Result count updates as the user types to filter

### Custom Messages (i18n)

Override the default English messages by providing a `messages` object:

```ts
import { defaultSelectMessages } from 'vue-superselect'

const frenchMessages = {
  ...defaultSelectMessages,
  selected: (label: string) => `${label} selectionne`,
  removed: (label: string) => `${label} supprime`,
  cleared: () => 'Selection effacee',
}
```

Pass custom messages through the composable API or context when building custom wrappers.

## Data Attributes for Styling

Every option element receives data attributes that reflect its current state. Use these for CSS styling instead of relying on class names:

| Attribute | Values | When |
|-----------|--------|------|
| `data-selected` | `"true"` / `"false"` | Whether the option is selected |
| `data-highlighted` | `"true"` / `"false"` | Whether the option is keyboard-highlighted |
| `data-disabled` | `"true"` / `"false"` | Whether the option is disabled |
| `data-state` | `"open"` / `"closed"` | On the root element, whether dropdown is open |

Example CSS using data attributes:

```css
[data-highlighted="true"] {
  background-color: #e0f2fe;
}

[data-selected="true"] {
  font-weight: 600;
  color: #0369a1;
}

[data-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
```

The `SelectContent` element also receives positioning attributes when using Floating UI:

| Attribute | Example Values | Purpose |
|-----------|----------------|---------|
| `data-side` | `"top"`, `"bottom"`, `"left"`, `"right"` | Which side the dropdown opened on |
| `data-align` | `"start"`, `"center"`, `"end"` | Alignment relative to the trigger |

## Focus Management

- Clicking the control area focuses the input
- Selecting an option (single select) returns focus to the input and closes the dropdown
- Selecting an option (multi-select) keeps focus in the input and the dropdown open
- Pressing Escape returns focus to the input
- Tab moves focus out of the component naturally

Focus is trapped within the component while the dropdown is open. Arrow keys navigate options, not the page.

## Testing Accessibility

To verify accessibility in your application:

1. **Keyboard-only test**: navigate the entire select without a mouse
2. **Screen reader test**: listen for announcements with VoiceOver (macOS), NVDA (Windows), or Orca (Linux)
3. **Inspect ARIA**: use browser DevTools to verify `role`, `aria-expanded`, and `aria-activedescendant` update correctly
4. **axe/Lighthouse**: run automated accessibility audits

## Next Steps

- [How It Works](/core-concepts/how-it-works)
- [Controlled State](/core-concepts/controlled-state)
- [Basic Select](/recipes/basic-select)
