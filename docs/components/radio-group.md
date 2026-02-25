# RadioGroup

A headless radio group with validation, dirty/touched tracking, and focus state. Generic over the value type.

## Features

- **Type-safe values** — generic `T extends string` keeps values typed
- **Validation** — configurable rules with `validateOnChange` and `validateOnBlur`
- **State tracking** — `dirty`, `touched`, `focused`
- **Nullable** — value starts as `null` until a selection is made

## Quick start

```ts
import { RadioGroupLogic } from "@component-library/core";

type Size = "sm" | "md" | "lg";

const group = new RadioGroupLogic<Size>({
  rules: [{ name: "required", validate: (v) => (v ? null : "Please select a size") }],
});

group.setValue("md");
group.validate(); // { valid: true, errors: [] }
```

### Svelte 5

```svelte
<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { RadioGroupLogic } from "@component-library/core";

  type Color = "red" | "green" | "blue";
  const options: { value: Color; label: string }[] = [
    { value: "red", label: "Red" },
    { value: "green", label: "Green" },
    { value: "blue", label: "Blue" },
  ];

  const logic = new RadioGroupLogic<Color>();
  const state = useLogic(logic);
</script>

<fieldset>
  <legend>Pick a color</legend>
  {#each options as opt}
    <label>
      <input
        type="radio"
        name="color"
        value={opt.value}
        checked={state.current.value === opt.value}
        onchange={() => logic.setValue(opt.value)}
      />
      {opt.label}
    </label>
  {/each}
</fieldset>
```

## API

### `RadioGroupOptions<T>`

| Property | Type | Default | Description |
|---|---|---|---|
| `initialValue` | `T \| null` | `null` | Starting value |
| `rules` | `ValidationRule<T \| null>[]` | `[]` | Validation rules |
| `validateOnChange` | `boolean` | `true` | Run validation on `setValue()` |
| `validateOnBlur` | `boolean` | `true` | Run validation on `blur()` |

### `RadioGroupState<T>`

| Property | Type | Description |
|---|---|---|
| `value` | `T \| null` | Currently selected value |
| `touched` | `boolean` | `true` after first `blur()` |
| `dirty` | `boolean` | `true` after first `setValue()` |
| `focused` | `boolean` | `true` between `focus()` and `blur()` |
| `validation` | `ValidationResult` | `{ valid, errors }` |

### Methods

| Method | Description |
|---|---|
| `setValue(value)` | Set the selected value. Sets `dirty = true`. |
| `focus()` | Set `focused = true` |
| `blur()` | Set `focused = false`, `touched = true` |
| `reset(value?)` | Reset to given value (default `null`). Clears all flags. |
| `validate()` | Run validation immediately. Returns `ValidationResult`. |
| `getState()` | Get current state snapshot |
| `subscribe(listener)` | Subscribe to state changes. Returns unsubscribe function. |
| `destroy()` | Clean up subscriptions |
