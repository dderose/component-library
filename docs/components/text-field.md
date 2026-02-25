# TextField

A headless text field with validation, dirty/touched tracking, and focus state.

## Features

- **Validation** — configurable rules with `validateOnChange` and `validateOnBlur`
- **State tracking** — `dirty` (value changed), `touched` (field blurred), `focused`
- **Reset** — restore to initial or custom value with all flags cleared

## Quick start

### Headless (core only)

```ts
import { TextFieldLogic, required, minLength } from "@component-library/core";

const field = new TextFieldLogic({
  rules: [required(), minLength(3)],
  validateOnBlur: true,
  validateOnChange: false,
});

field.subscribe((state) => {
  console.log(state.value, state.validation);
});

field.setValue("hi");
field.blur();
// validation.errors → ["Minimum length is 3"]
```

### Svelte 5

```svelte
<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { TextFieldLogic } from "@component-library/core";

  const logic = new TextFieldLogic({
    rules: [{ name: "required", validate: (v) => (v ? null : "Required") }],
  });
  const state = useLogic(logic);
</script>

<input
  type="text"
  value={state.current.value}
  oninput={(e) => logic.setValue(e.currentTarget.value)}
  onfocus={() => logic.focus()}
  onblur={() => logic.blur()}
/>

{#if !state.current.validation.valid && state.current.touched}
  <span role="alert">{state.current.validation.errors[0]}</span>
{/if}
```

### React Native

```tsx
import { useLogic } from "@component-library/react-native";
import { TextFieldLogic, required } from "@component-library/core";

function MyField() {
  const [state, logic] = useLogic(
    () => new TextFieldLogic({ rules: [required()] })
  );

  return (
    <TextInput
      value={state.value}
      onChangeText={(v) => logic.setValue(v)}
      onFocus={() => logic.focus()}
      onBlur={() => logic.blur()}
    />
  );
}
```

## API

### `TextFieldOptions`

| Property | Type | Default | Description |
|---|---|---|---|
| `initialValue` | `string` | `""` | Starting value |
| `rules` | `ValidationRule<string>[]` | `[]` | Validation rules |
| `validateOnChange` | `boolean` | `true` | Run validation on every `setValue()` |
| `validateOnBlur` | `boolean` | `true` | Run validation on `blur()` |

### `TextFieldState`

| Property | Type | Description |
|---|---|---|
| `value` | `string` | Current value |
| `touched` | `boolean` | `true` after first `blur()` |
| `dirty` | `boolean` | `true` after first `setValue()` |
| `focused` | `boolean` | `true` between `focus()` and `blur()` |
| `validation` | `ValidationResult` | `{ valid, errors }` |

### Methods

| Method | Description |
|---|---|
| `setValue(value)` | Update the value. Sets `dirty = true`. Validates if `validateOnChange`. |
| `focus()` | Set `focused = true` |
| `blur()` | Set `focused = false`, `touched = true`. Validates if `validateOnBlur`. |
| `reset(value?)` | Reset to given value (default `""`). Clears all flags and validation. |
| `validate()` | Run validation immediately. Returns `ValidationResult`. |
| `getState()` | Get current state snapshot |
| `subscribe(listener)` | Subscribe to state changes. Returns unsubscribe function. |
| `destroy()` | Clean up subscriptions |
