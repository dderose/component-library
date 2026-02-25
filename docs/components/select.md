# Select

A headless single-select dropdown with keyboard navigation, ARIA attributes, highlight tracking, disabled option support, and validation.

## Features

- **Keyboard navigation** — Arrow Up/Down to highlight, Enter/Space to select, Escape to close, Home/End for first/last, Tab to close and move focus
- **ARIA** — `role="combobox"` on trigger, `role="listbox"` on dropdown, `role="option"` on items with `aria-selected` and `aria-disabled`, `aria-activedescendant` for highlighted option
- **Unique IDs** — auto-generated per instance, linking trigger, listbox, options, and label
- **Highlight tracking** — `highlightedIndex` in state, skips disabled options
- **Disabled options** — options with `disabled: true` are skipped by keyboard and can't be selected
- **Validation** — configurable rules with `validateOnChange` and `validateOnBlur`

## Quick start

### Headless (core only)

```ts
import { SelectLogic } from "@component-library/core";
import type { SelectOption } from "@component-library/core";

type Fruit = "apple" | "banana" | "cherry";

const options: SelectOption<Fruit>[] = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry", disabled: true },
];

const select = new SelectLogic<Fruit>({
  options,
  rules: [{ name: "required", validate: (v) => (v ? null : "Required") }],
});

select.openMenu();         // open dropdown, highlight first option
select.handleKeyDown(event); // delegate keyboard events
select.setValue("apple");  // select + close
```

### Svelte 5

```svelte
<script lang="ts">
  import { useLogic, clickOutside, portal } from "@component-library/svelte";
  import { SelectLogic } from "@component-library/core";
  import type { SelectOption } from "@component-library/core";

  const options: SelectOption[] = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ];

  const logic = new SelectLogic({ options });
  const state = useLogic(logic);
  const { aria } = logic;
</script>

<label id={aria.labelId}>Pick one</label>

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
    {state.current.value ?? "Choose…"}
  </button>

  {#if state.current.open}
    <ul role={aria.listbox.role} id={aria.listbox.id} use:portal>
      {#each options as opt, i}
        <li
          id={aria.optionId(i)}
          role="option"
          aria-selected={state.current.value === opt.value}
          onmouseenter={() => logic.highlightIndex(i)}
          onclick={() => logic.setValue(opt.value)}
        >
          {opt.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>
```

## API

### `SelectOption<T>`

| Property | Type | Description |
|---|---|---|
| `value` | `T` | Option value |
| `label` | `string` | Display label |
| `disabled` | `boolean?` | If `true`, option is skipped by keyboard and can't be selected |

### `SelectOptions<T>`

| Property | Type | Default | Description |
|---|---|---|---|
| `initialValue` | `T \| null` | `null` | Starting value |
| `options` | `SelectOption<T>[]` | `[]` | Available options |
| `rules` | `ValidationRule<T \| null>[]` | `[]` | Validation rules |
| `validateOnChange` | `boolean` | `true` | Run validation on `setValue()` |
| `validateOnBlur` | `boolean` | `true` | Run validation on `blur()` |

### `SelectState<T>`

| Property | Type | Description |
|---|---|---|
| `value` | `T \| null` | Currently selected value |
| `open` | `boolean` | Whether the dropdown is open |
| `highlightedIndex` | `number` | Index of highlighted option (`-1` = none) |
| `touched` | `boolean` | `true` after first `blur()` |
| `dirty` | `boolean` | `true` after first `setValue()` |
| `focused` | `boolean` | `true` between `focus()` and `blur()` |
| `validation` | `ValidationResult` | `{ valid, errors }` |

### `SelectAria`

Auto-generated ARIA attributes. Access via `logic.aria`.

| Property | Type | Description |
|---|---|---|
| `trigger` | `object` | Spread onto the trigger button: `role`, `aria-haspopup`, `aria-expanded`, `aria-controls`, `aria-activedescendant`, `aria-labelledby` |
| `listbox` | `object` | Spread onto the dropdown: `role`, `id`, `aria-labelledby` |
| `optionId(index)` | `(number) => string` | Returns the id for an option at a given index |
| `labelId` | `string` | Use as the `id` on your `<label>` element |

### Methods

| Method | Description |
|---|---|
| `setValue(value)` | Select a value. Closes menu. Sets `dirty` and `touched`. |
| `openMenu()` | Open dropdown. Highlights selected option or first enabled option. |
| `closeMenu()` | Close dropdown. Resets highlight. |
| `toggleMenu()` | Toggle open/close |
| `highlightIndex(index)` | Highlight a specific option (used for mouse hover) |
| `selectHighlighted()` | Select the currently highlighted option |
| `handleKeyDown(event)` | Keyboard handler — attach to trigger's `keydown` event |
| `setOptions(options)` | Update the option list dynamically |
| `getOptions()` | Get current options |
| `getTriggerAria()` | Get live trigger ARIA props (incorporates current expanded/highlight state) |
| `focus()` | Set `focused = true` |
| `blur()` | Set `focused = false`, `touched = true`. Closes menu. Validates if configured. |
| `reset(value?)` | Reset to given value (default `null`). Clears all flags. |
| `validate()` | Run validation immediately. Returns `ValidationResult`. |
| `getState()` | Get current state snapshot |
| `subscribe(listener)` | Subscribe to state changes. Returns unsubscribe function. |
| `destroy()` | Clean up subscriptions |

### Keyboard shortcuts

| Key | Menu closed | Menu open |
|---|---|---|
| `ArrowDown` | Open menu | Highlight next option |
| `ArrowUp` | Open menu | Highlight previous option |
| `Enter` / `Space` | Open menu | Select highlighted option |
| `Escape` | — | Close menu |
| `Home` | — | Highlight first option |
| `End` | — | Highlight last option |
| `Tab` | — | Close menu, move focus |
