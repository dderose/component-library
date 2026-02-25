# MultiSelect

A headless multi-select dropdown with keyboard navigation, ARIA attributes, highlight tracking, disabled option support, and validation.

## Features

- **Multi-selection** — select/deselect individual items, toggle, clear all
- **Keyboard navigation** — Arrow Up/Down to highlight, Enter/Space to toggle selection (keeps menu open), Escape to close, Home/End, Backspace to remove last item
- **ARIA** — `role="combobox"` on trigger, `role="listbox"` with `aria-multiselectable` on dropdown, `role="option"` on items with `aria-selected`, `aria-activedescendant` for highlighted option
- **Unique IDs** — auto-generated per instance
- **Highlight tracking** — `highlightedIndex` in state, skips disabled options
- **Disabled options** — options with `disabled: true` are skipped by keyboard and can't be toggled
- **Validation** — configurable rules with `validateOnChange` and `validateOnBlur`

## Quick start

### Headless (core only)

```ts
import { MultiSelectLogic } from "@component-library/core";
import type { MultiSelectOption } from "@component-library/core";

type Tag = "svelte" | "react" | "vue";

const options: MultiSelectOption<Tag>[] = [
  { value: "svelte", label: "Svelte" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
];

const multi = new MultiSelectLogic<Tag>({
  options,
  rules: [{ name: "min2", validate: (v) => (v.length >= 2 ? null : "Pick at least 2") }],
});

multi.select("svelte");
multi.select("react");
multi.validate(); // { valid: true, errors: [] }
multi.toggleItem("svelte"); // deselects svelte
```

### Svelte 5

```svelte
<script lang="ts">
  import { useLogic, clickOutside, portal } from "@component-library/svelte";
  import { MultiSelectLogic } from "@component-library/core";
  import type { MultiSelectOption } from "@component-library/core";

  const options: MultiSelectOption[] = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
    { value: "c", label: "Option C" },
  ];

  const logic = new MultiSelectLogic({ options });
  const state = useLogic(logic);
  const { aria } = logic;
</script>

<label id={aria.labelId}>Pick many</label>

<div use:clickOutside={{ handler: () => logic.closeMenu(), enabled: state.current.open }}>
  <button
    role={aria.trigger.role}
    aria-haspopup={aria.trigger["aria-haspopup"]}
    aria-expanded={state.current.open}
    aria-controls={aria.trigger["aria-controls"]}
    aria-labelledby={aria.labelId}
    onclick={() => logic.toggleMenu()}
    onkeydown={(e) => logic.handleKeyDown(e)}
  >
    {state.current.value.length} selected
  </button>

  {#if state.current.open}
    <ul
      role={aria.listbox.role}
      id={aria.listbox.id}
      aria-multiselectable="true"
      use:portal
    >
      {#each options as opt, i}
        <li
          id={aria.optionId(i)}
          role="option"
          aria-selected={state.current.value.includes(opt.value)}
          onmouseenter={() => logic.highlightIndex(i)}
          onclick={() => logic.toggleItem(opt.value)}
        >
          {state.current.value.includes(opt.value) ? "☑" : "☐"} {opt.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

## API

### `MultiSelectOption<T>`

| Property | Type | Description |
|---|---|---|
| `value` | `T` | Option value |
| `label` | `string` | Display label |
| `disabled` | `boolean?` | If `true`, option is skipped by keyboard and can't be toggled |

### `MultiSelectOptions<T>`

| Property | Type | Default | Description |
|---|---|---|---|
| `initialValue` | `T[]` | `[]` | Starting selected values |
| `options` | `MultiSelectOption<T>[]` | `[]` | Available options |
| `rules` | `ValidationRule<T[]>[]` | `[]` | Validation rules |
| `validateOnChange` | `boolean` | `true` | Run validation on value changes |
| `validateOnBlur` | `boolean` | `true` | Run validation on `blur()` |

### `MultiSelectState<T>`

| Property | Type | Description |
|---|---|---|
| `value` | `T[]` | Currently selected values |
| `open` | `boolean` | Whether the dropdown is open |
| `highlightedIndex` | `number` | Index of highlighted option (`-1` = none) |
| `touched` | `boolean` | `true` after first `blur()` |
| `dirty` | `boolean` | `true` after first value change |
| `focused` | `boolean` | `true` between `focus()` and `blur()` |
| `validation` | `ValidationResult` | `{ valid, errors }` |

### `MultiSelectAria`

Auto-generated ARIA attributes. Access via `logic.aria`.

| Property | Type | Description |
|---|---|---|
| `trigger` | `object` | Spread onto the trigger button |
| `listbox` | `object` | Spread onto the dropdown (includes `aria-multiselectable: "true"`) |
| `optionId(index)` | `(number) => string` | Returns the id for an option at a given index |
| `labelId` | `string` | Use as the `id` on your `<label>` element |

### Methods

| Method | Description |
|---|---|
| `setValue(value)` | Set the full value array |
| `select(item)` | Add an item if not already selected |
| `deselect(item)` | Remove an item if currently selected |
| `toggleItem(item)` | Toggle an item's selection state |
| `toggleHighlighted()` | Toggle the currently highlighted option |
| `clear()` | Remove all selections |
| `openMenu()` | Open dropdown. Highlights first enabled option. |
| `closeMenu()` | Close dropdown. Resets highlight. |
| `toggleMenu()` | Toggle open/close |
| `highlightIndex(index)` | Highlight a specific option |
| `handleKeyDown(event)` | Keyboard handler — attach to trigger's `keydown` event |
| `setOptions(options)` | Update the option list dynamically |
| `getOptions()` | Get current options |
| `getTriggerAria()` | Get live trigger ARIA props |
| `focus()` | Set `focused = true` |
| `blur()` | Closes menu, validates |
| `reset(value?)` | Reset to given value (default `[]`). Clears all flags. |
| `validate()` | Run validation immediately. Returns `ValidationResult`. |
| `getState()` | Get current state snapshot |
| `subscribe(listener)` | Subscribe to state changes. Returns unsubscribe function. |
| `destroy()` | Clean up subscriptions |

### Keyboard shortcuts

| Key | Menu closed | Menu open |
|---|---|---|
| `ArrowDown` | Open menu | Highlight next option |
| `ArrowUp` | Open menu | Highlight previous option |
| `Enter` / `Space` | Open menu | Toggle highlighted option (menu stays open) |
| `Escape` | — | Close menu |
| `Home` | — | Highlight first option |
| `End` | — | Highlight last option |
| `Backspace` | Remove last selected item | — |
| `Tab` | — | Close menu, move focus |
