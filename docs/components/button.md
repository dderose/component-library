# Button

A headless button with async loading state management, disabled control, and pressed/focused tracking. The key value over a plain `<button>` is automatic loading state for async click handlers — preventing double-submits without manual state management.

## Features

- **Async loading** — if `onClick` returns a Promise, the button enters loading state until it settles, ignoring clicks in the meantime
- **Disabled** — explicit disabled state via `setDisabled()`, plus automatic disable while loading (`disableWhileLoading`, default `true`)
- **Pressed tracking** — `pressed` state between `pointerDown()` and `pointerUp()` for custom active styles
- **Focus tracking** — `focused` state for custom focus styles

## Quick start

### Headless (core only)

```ts
import { ButtonLogic } from "@component-library/core";

const button = new ButtonLogic({
  onClick: async () => {
    await fetch("/api/save", { method: "POST" });
  },
});

button.subscribe((state) => {
  console.log(state.loading, state.disabled);
});

await button.press(); // loading → true → fetch → loading → false
```

### Svelte 5

```svelte
<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { ButtonLogic } from "@component-library/core";

  const logic = new ButtonLogic({
    onClick: async () => {
      await saveData();
    },
  });
  const state = useLogic(logic);
</script>

<button
  disabled={logic.isDisabled()}
  onclick={() => logic.press()}
>
  {#if state.current.loading}
    Saving…
  {:else}
    Save
  {/if}
</button>
```

### React Native

```tsx
import { useLogic } from "@component-library/react-native";
import { ButtonLogic } from "@component-library/core";

function SaveButton() {
  const [state, logic] = useLogic(
    () => new ButtonLogic({
      onClick: async () => { await saveData(); },
    })
  );

  return (
    <Pressable
      disabled={logic.isDisabled()}
      onPress={() => logic.press()}
    >
      <Text>{state.loading ? "Saving…" : "Save"}</Text>
    </Pressable>
  );
}
```

## API

### `ButtonOptions`

| Property | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Initial disabled state |
| `onClick` | `() => void \| Promise<void>` | — | Click handler. If it returns a Promise, button enters loading state. |
| `disableWhileLoading` | `boolean` | `true` | Automatically disable the button while loading |

### `ButtonState`

| Property | Type | Description |
|---|---|---|
| `loading` | `boolean` | `true` while an async onClick is in progress |
| `disabled` | `boolean` | Explicit disabled state |
| `pressed` | `boolean` | `true` between `pointerDown()` and `pointerUp()` |
| `focused` | `boolean` | `true` between `focus()` and `blur()` |

### Methods

| Method | Description |
|---|---|
| `press()` | Trigger the click handler. Returns a Promise. Ignored while disabled or loading. |
| `isDisabled()` | Returns `true` if explicitly disabled OR if loading with `disableWhileLoading`. |
| `setDisabled(disabled)` | Set the disabled state |
| `setOnClick(handler)` | Replace the click handler |
| `focus()` | Set `focused = true` |
| `blur()` | Set `focused = false` |
| `pointerDown()` | Set `pressed = true` (ignored while disabled) |
| `pointerUp()` | Set `pressed = false` |
| `reset()` | Reset all state to defaults |
| `getState()` | Get current state snapshot |
| `subscribe(listener)` | Subscribe to state changes. Returns unsubscribe function. |
| `destroy()` | Clean up subscriptions |
