# Checkbox

A headless checkbox with validation, dirty/touched tracking, and focus state.

## Features

- **Validation** — configurable rules with `validateOnChange` and `validateOnBlur`
- **State tracking** — `dirty`, `touched`, `focused`
- **Toggle** — convenience method to flip checked state

## Quick start

```ts
import { CheckboxLogic } from "@component-library/core";

const checkbox = new CheckboxLogic({
  initialChecked: false,
  rules: [
    { name: "mustAccept", validate: (v) => (v ? null : "You must accept the terms") },
  ],
});

checkbox.toggle();         // checked → true
checkbox.validate();       // { valid: true, errors: [] }
```

### Svelte 5

```svelte
<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { CheckboxLogic } from "@component-library/core";

  const logic = new CheckboxLogic({ initialChecked: false });
  const state = useLogic(logic);
</script>

<label>
  <input
    type="checkbox"
    checked={state.current.checked}
    onchange={() => logic.toggle()}
    onfocus={() => logic.focus()}
    onblur={() => logic.blur()}
  />
  Accept terms
</label>
```

## API

### `CheckboxOptions`

| Property | Type | Default | Description |
|---|---|---|---|
| `initialChecked` | `boolean` | `false` | Starting checked state |
| `rules` | `ValidationRule<boolean>[]` | `[]` | Validation rules |
| `validateOnChange` | `boolean` | `true` | Run validation on `setChecked()` / `toggle()` |
| `validateOnBlur` | `boolean` | `true` | Run validation on `blur()` |

### `CheckboxState`

| Property | Type | Description |
|---|---|---|
| `checked` | `boolean` | Current checked state |
| `touched` | `boolean` | `true` after first `blur()` |
| `dirty` | `boolean` | `true` after first `setChecked()` or `toggle()` |
| `focused` | `boolean` | `true` between `focus()` and `blur()` |
| `validation` | `ValidationResult` | `{ valid, errors }` |

### Methods

| Method | Description |
|---|---|
| `setChecked(checked)` | Set the checked state. Sets `dirty = true`. |
| `toggle()` | Flip the checked state |
| `focus()` | Set `focused = true` |
| `blur()` | Set `focused = false`, `touched = true` |
| `reset(checked?)` | Reset to given value (default `false`). Clears all flags. |
| `validate()` | Run validation immediately. Returns `ValidationResult`. |
| `getState()` | Get current state snapshot |
| `subscribe(listener)` | Subscribe to state changes. Returns unsubscribe function. |
| `destroy()` | Clean up subscriptions |
