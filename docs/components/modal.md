# Modal

A headless modal dialog component. `ModalLogic` manages open/close state, overlay dismiss, and keyboard handling — you provide the markup and styling.

## Quick start

### Headless (core only)

```ts
import { ModalLogic } from "@component-library/core";

const modal = new ModalLogic({
  closeOnEscape: true,
  closeOnOverlayClick: true,
  onOpen: () => console.log("opened"),
  onClose: () => console.log("closed"),
});

modal.subscribe((state) => {
  console.log(state.open, state.hasOpened);
});

modal.open();
modal.close();
modal.toggle();
modal.destroy();
```

### Svelte 5

```svelte
<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { ModalLogic } from "@component-library/core";

  const logic = new ModalLogic({
    closeOnOverlayClick: true,
    closeOnEscape: true,
  });

  const state = useLogic(logic);
</script>

<svelte:window onkeydown={(e) => logic.handleKeyDown(e)} />

<button onclick={() => logic.open()}>Open Modal</button>

{#if state.current.open}
  <div class="overlay" onclick={() => logic.handleOverlayClick()}>
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <h2>My Modal</h2>
      <p>Modal content goes here.</p>
      <button onclick={() => logic.close()}>Close</button>
    </div>
  </div>
{/if}
```

### React Native

```tsx
import { Modal as RNModal, View, Text, Pressable } from "react-native";
import { useLogic } from "@component-library/react-native";
import { ModalLogic } from "@component-library/core";

function MyModal() {
  const [state, logic] = useLogic(
    () => new ModalLogic({ closeOnOverlayClick: true })
  );

  return (
    <>
      <Pressable onPress={() => logic.open()}>
        <Text>Open Modal</Text>
      </Pressable>

      <RNModal
        visible={state.open}
        transparent
        animationType="fade"
        onRequestClose={() => logic.close()}
      >
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)" }}
          onPress={() => logic.handleOverlayClick()}
        >
          <View
            style={{
              margin: "auto",
              backgroundColor: "#fff",
              borderRadius: 8,
              padding: 24,
              width: "85%",
            }}
            onStartShouldSetResponder={() => true}
          >
            <Text>Modal content goes here.</Text>
            <Pressable onPress={() => logic.close()}>
              <Text>Close</Text>
            </Pressable>
          </View>
        </Pressable>
      </RNModal>
    </>
  );
}
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `initialOpen` | `boolean` | `false` | Whether the modal starts in the open state. |
| `closeOnOverlayClick` | `boolean` | `true` | Close when `handleOverlayClick()` is called (i.e. the backdrop is clicked). |
| `closeOnEscape` | `boolean` | `true` | Close when `handleKeyDown()` receives an Escape key event. |
| `onOpen` | `() => void` | — | Callback fired after the modal opens. |
| `onClose` | `() => void` | — | Callback fired after the modal closes. |

## State

| Property | Type | Description |
|---|---|---|
| `open` | `boolean` | Whether the modal is currently visible. |
| `hasOpened` | `boolean` | Whether the modal has been opened at least once. Useful for lazy rendering — you can defer mounting heavy content until the first open. |

## Methods

| Method | Signature | Description |
|---|---|---|
| `open` | `() => void` | Opens the modal. No-op if already open. Fires `onOpen`. |
| `close` | `() => void` | Closes the modal. No-op if already closed. Fires `onClose`. |
| `toggle` | `() => void` | Toggles between open and closed. |
| `handleOverlayClick` | `() => void` | Call from the backdrop click handler. Closes the modal only if `closeOnOverlayClick` is `true`. |
| `handleKeyDown` | `(event: { key: string }) => void` | Call from a `keydown` handler. Closes the modal if `closeOnEscape` is `true` and the key is `Escape`. |
| `getState` | `() => ModalState` | Returns the current state snapshot. |
| `subscribe` | `(listener: (state: ModalState) => void) => () => void` | Subscribes to state changes. Returns an unsubscribe function. |
| `destroy` | `() => void` | Clears all subscribers. Called automatically by framework adapters on unmount. |

## Recipes

### Confirmation dialog

Use the `onClose` callback to distinguish between confirm and cancel actions:

```ts
let confirmed = false;

const modal = new ModalLogic({
  onClose: () => {
    if (confirmed) {
      deleteItem();
    }
    confirmed = false;
  },
});

// In your confirm button handler:
function handleConfirm() {
  confirmed = true;
  modal.close();
}

// In your cancel button handler:
function handleCancel() {
  modal.close();
}
```

### Lazy rendering with `hasOpened`

Avoid mounting expensive content until the user actually opens the modal:

```svelte
{#if state.current.hasOpened}
  <!-- This content stays in the DOM after first open (hidden via CSS) -->
  <div class="overlay" class:visible={state.current.open}>
    <div class="modal">
      <ExpensiveComponent />
    </div>
  </div>
{/if}
```

### Non-dismissible modal

Prevent the user from closing the modal via overlay or Escape — they must use an explicit action:

```ts
const modal = new ModalLogic({
  closeOnOverlayClick: false,
  closeOnEscape: false,
});
```

### Stacked modals

Each `ModalLogic` instance manages its own state independently, so stacking works naturally:

```ts
const outerModal = new ModalLogic();
const innerModal = new ModalLogic();

// Open the outer modal, then open the inner one on top.
// Closing the inner modal leaves the outer one open.
outerModal.open();
innerModal.open();
innerModal.close(); // outer is still open
```

## How it works

`ModalLogic` implements the `ComponentLogic<ModalState>` interface. It owns a single `Store<ModalState>` instance and exposes actions that update the store. Framework adapters (`useLogic` in Svelte and React) subscribe to the store and translate changes into reactive UI updates.

```
┌──────────────┐       ┌───────────┐       ┌──────────────────┐
│  ModalLogic  │──────▶│   Store   │──────▶│  useLogic (sub)  │
│  .open()     │       │  { open,  │       │  Svelte $state   │
│  .close()    │       │ hasOpened}│       │  or React useSES │
│  .toggle()   │       └───────────┘       └──────────────────┘
└──────────────┘
```

The logic class is completely framework-agnostic. It doesn't know about the DOM, React, or Svelte — it only manages a plain object through a `Store`. This means you can:

- Unit test it with zero framework dependencies
- Use it in Node.js, web workers, or any JS runtime
- Swap frameworks without rewriting business logic
