# Modal

A production-ready headless modal dialog. `ModalLogic` manages the full lifecycle — open/close state machine, focus trapping, scroll lock, ARIA attributes, and focus restoration — while you own the markup, styling, and animations.

## Features

- **Status state machine** — `closed → opening → open → closing → closed` for animation support
- **Focus trap** — Tab / Shift+Tab stays within the dialog; focus moves to the first focusable element on open
- **Focus restore** — the element that was focused before the modal opened receives focus on close
- **Scroll lock** — page body scroll is locked while the modal is open (reference-counted, SSR-safe)
- **ARIA** — auto-generated `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`
- **Unique IDs** — each instance generates unique IDs for title and description elements
- **Escape to close** — configurable via `closeOnEscape`
- **Overlay dismiss** — configurable via `closeOnOverlayClick`
- **Framework-agnostic** — core logic has zero DOM/framework dependencies; DOM helpers are opt-in

## Quick start

### Headless (core only)

```ts
import { ModalLogic } from "@component-library/core";

const modal = new ModalLogic({
  closeOnEscape: true,
  closeOnOverlayClick: true,
  scrollLock: true,
  onOpen: () => console.log("opened"),
  onClose: () => console.log("closed"),
});

modal.subscribe((state) => {
  console.log(state.status, state.open, state.hasOpened);
});

// Access generated ARIA attributes
console.log(modal.aria.dialog);
// { role: "dialog", "aria-modal": "true", "aria-labelledby": "modal-1-title", ... }

modal.open();   // closed → opening → open
modal.close();  // open → closing → closed
modal.destroy();
```

### Svelte 5

```svelte
<script lang="ts">
  import { onMount } from "svelte";
  import { useLogic } from "@component-library/svelte";
  import { ModalLogic } from "@component-library/core";

  const logic = new ModalLogic({
    closeOnOverlayClick: true,
    closeOnEscape: true,
    scrollLock: true,
  });

  const state = useLogic(logic);
  const { aria } = logic;

  let dialogEl: HTMLDivElement | undefined;

  // Portal: render at document.body to escape stacking contexts.
  let portalTarget: HTMLDivElement | undefined;
  onMount(() => {
    portalTarget = document.createElement("div");
    document.body.appendChild(portalTarget);
    return () => portalTarget?.remove();
  });

  function handleDialogMount(node: HTMLDivElement) {
    dialogEl = node;
    logic.focusDialog(node);
  }

  function handleTransitionEnd(event: TransitionEvent) {
    if (event.propertyName === "opacity" && state.current.status === "closing") {
      logic.finishClose();
    }
  }
</script>

<button onclick={() => logic.open()}>Open Modal</button>

{#if state.current.open}
  <div
    class="overlay"
    class:open={state.current.status === "open"}
    role={aria.overlay.role}
    onclick={() => logic.handleOverlayClick()}
    onkeydown={(e) => logic.handleKeyDown(e, dialogEl)}
    ontransitionend={handleTransitionEnd}
  >
    <div
      class="modal"
      class:open={state.current.status === "open"}
      role={aria.dialog.role}
      aria-modal={aria.dialog["aria-modal"]}
      aria-labelledby={aria.dialog["aria-labelledby"]}
      aria-describedby={aria.dialog["aria-describedby"]}
      tabindex={-1}
      use:handleDialogMount
      onclick={(e) => e.stopPropagation()}
    >
      <h2 id={aria.titleId}>Title</h2>
      <p id={aria.descriptionId}>Description text.</p>
      <button onclick={() => logic.close()}>Close</button>
    </div>
  </div>
{/if}
```

### Svelte 5 — `<Modal>` wrapper component

The `@component-library/svelte` package includes a `<Modal>` wrapper that handles portal rendering, focus trapping, ARIA, and CSS transitions automatically:

```svelte
<script lang="ts">
  import { Modal } from "@component-library/svelte";
</script>

<Modal
  options={{ closeOnEscape: true, closeOnOverlayClick: true, scrollLock: true }}
  transitionDuration={200}
  panelClass="my-modal"
>
  {#snippet children({ aria, close })}
    <h2 id={aria.titleId}>Title</h2>
    <p id={aria.descriptionId}>Description text.</p>
    <button onclick={close}>Close</button>
  {/snippet}
</Modal>
```

The wrapper accepts `ariaOverrides` for custom roles (`alertdialog`), `aria-label` instead of `aria-labelledby`, or removing `aria-describedby`. Set `transitionDuration={0}` to disable transitions.

### React Native

```tsx
import { Modal as RNModal, View, Text, Pressable, StyleSheet } from "react-native";
import { useLogic } from "@component-library/react-native";
import { ModalLogic } from "@component-library/core";

function MyModal() {
  const [state, logic] = useLogic(
    () =>
      new ModalLogic({
        closeOnOverlayClick: true,
        scrollLock: false, // RN handles this natively
      })
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
        accessibilityViewIsModal={true}
        accessibilityLabel="Example dialog"
      >
        <Pressable
          style={styles.overlay}
          onPress={() => logic.handleOverlayClick()}
        >
          <View
            style={styles.modal}
            onStartShouldSetResponder={() => true}
            accessible
            accessibilityRole="none"
            accessibilityLabel="Dialog content"
          >
            <Text style={styles.title}>Title</Text>
            <Text>Description text.</Text>
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
| `initialOpen` | `boolean` | `false` | Whether the modal starts open. |
| `closeOnOverlayClick` | `boolean` | `true` | Close when `handleOverlayClick()` is called. |
| `closeOnEscape` | `boolean` | `true` | Close when `handleKeyDown()` receives Escape. |
| `scrollLock` | `boolean` | `true` | Lock page scroll while open. Uses `position: fixed` on body with scroll position preservation. |
| `onOpen` | `() => void` | — | Fired when status transitions to "opening". |
| `onClose` | `() => void` | — | Fired when status transitions to "closing". |

## State

| Property | Type | Description |
|---|---|---|
| `status` | `"closed" \| "opening" \| "open" \| "closing"` | Current lifecycle phase. Drive CSS classes/transitions from this. |
| `open` | `boolean` | `true` when status is "opening" or "open". Use to conditionally render the modal. |
| `hasOpened` | `boolean` | `true` after the modal has been opened at least once. Use for lazy rendering. |

### Status lifecycle

```
         open()               finishOpen()
closed ────────▶ opening ──────────────────▶ open
   ▲                                          │
   │              finishClose()      close()   │
   └──────────── closing ◀────────────────────┘
```

`finishOpen()` and `finishClose()` are called automatically via microtask if you don't call them yourself. For CSS transitions, listen for `transitionend` and call them manually to keep the modal visible during the animation.

## ARIA attributes (`modal.aria`)

Each `ModalLogic` instance generates a unique set of ARIA attributes. Spread these onto your elements:

| Property | Apply to | Value |
|---|---|---|
| `aria.overlay.role` | Backdrop element | `"presentation"` |
| `aria.dialog.role` | Dialog panel | `"dialog"` |
| `aria.dialog["aria-modal"]` | Dialog panel | `"true"` |
| `aria.dialog["aria-labelledby"]` | Dialog panel | Auto-generated ID |
| `aria.dialog["aria-describedby"]` | Dialog panel | Auto-generated ID |
| `aria.dialog.tabindex` | Dialog panel | `"-1"` (allows programmatic focus) |
| `aria.titleId` | Title element (`<h2>`, etc.) | Matches `aria-labelledby` |
| `aria.descriptionId` | Description/body element | Matches `aria-describedby` |

## Methods

| Method | Signature | Description |
|---|---|---|
| `open` | `() => void` | Opens the modal. Captures current focus, locks scroll, transitions to "opening". |
| `close` | `() => void` | Closes the modal. Transitions to "closing". |
| `finishOpen` | `() => void` | Advances "opening" → "open". Auto-called if you don't call it. |
| `finishClose` | `() => void` | Advances "closing" → "closed". Unlocks scroll, restores focus. Auto-called if you don't call it. |
| `toggle` | `() => void` | Toggles between open and closed. |
| `handleOverlayClick` | `() => void` | Call from backdrop click handler. Respects `closeOnOverlayClick`. |
| `handleKeyDown` | `(event: KeyboardEvent, dialogElement?: Element) => void` | Handles Escape (close) and Tab (focus trap). Pass the dialog element for focus trapping. |
| `focusDialog` | `(dialogElement: HTMLElement) => void` | Moves focus to the first focusable element inside the dialog, or the dialog itself. Call after mount. |
| `getState` | `() => ModalState` | Returns the current state snapshot. |
| `subscribe` | `(listener) => Unsubscribe` | Subscribe to state changes. |
| `destroy` | `() => void` | Releases scroll lock, clears subscribers. Called by framework adapters on unmount. |

## Exported helpers

These are standalone functions exported from `@component-library/core` for advanced use cases:

| Function | Description |
|---|---|
| `getFocusableElements(container)` | Returns all focusable `HTMLElement`s inside a container, in DOM order. |
| `trapFocus(event, container)` | Handles Tab/Shift+Tab to keep focus within a container. Returns `true` if handled. |
| `lockScroll()` | Locks body scroll. Reference-counted; safe to call multiple times. |
| `unlockScroll()` | Unlocks body scroll. Only removes the lock when count reaches zero. |
| `resetModalIdCounter()` | Resets the ID counter to zero (for deterministic tests). |

## Recipes

### CSS transitions

Use `status` to apply CSS classes, and call `finishClose()` manually when the exit transition ends:

```css
.overlay {
  background: rgba(0, 0, 0, 0);
  transition: background 200ms ease;
}
.overlay.open { background: rgba(0, 0, 0, 0.4); }

.modal {
  opacity: 0;
  transform: scale(0.95);
  transition: opacity 200ms ease, transform 200ms ease;
}
.modal.open { opacity: 1; transform: scale(1); }
```

```ts
// In your transitionend handler:
if (event.propertyName === "opacity" && state.status === "closing") {
  logic.finishClose();
}
```

Without this, the modal will auto-close via microtask — visible exit animations require intercepting `finishClose`.

### Confirmation dialog

```ts
let confirmed = false;

const modal = new ModalLogic({
  onClose: () => {
    if (confirmed) deleteItem();
    confirmed = false;
  },
});

function handleConfirm() {
  confirmed = true;
  modal.close();
}
```

### Non-dismissible modal

```ts
const modal = new ModalLogic({
  closeOnOverlayClick: false,
  closeOnEscape: false,
});
```

The user must use an explicit action (a button inside the modal) to close it.

### Lazy rendering with `hasOpened`

Defer mounting expensive content until the first open:

```svelte
{#if state.current.hasOpened}
  <div class="overlay" class:visible={state.current.open}>
    <ExpensiveComponent />
  </div>
{/if}
```

### Portal rendering

Modals should render outside the normal DOM tree to avoid z-index and `overflow: hidden` issues:

**Svelte:** Create a `<div>` on `document.body` in `onMount` and use Svelte's `{#if}` inside it (see full example above).

**React:** Use `createPortal` from `react-dom`:

```tsx
import { createPortal } from "react-dom";

function Modal() {
  const [state, logic] = useLogic(() => new ModalLogic());
  if (!state.open) return null;
  return createPortal(<div className="overlay">…</div>, document.body);
}
```

## Accessibility checklist

When building a modal with `ModalLogic`, ensure your implementation covers:

- [x] `role="dialog"` and `aria-modal="true"` on the dialog panel — provided by `modal.aria.dialog`
- [x] `aria-labelledby` pointing to the title — use `modal.aria.titleId` as the title's `id`
- [x] `aria-describedby` pointing to the description — use `modal.aria.descriptionId` as the body's `id`
- [x] Focus moves into the dialog on open — call `logic.focusDialog(element)` after mount
- [x] Focus is trapped inside the dialog — pass the dialog element to `logic.handleKeyDown(event, element)`
- [x] Focus returns to the trigger on close — handled automatically by `finishClose()`
- [x] Escape key closes the dialog — handled by `logic.handleKeyDown()`
- [x] Background content is inert — `aria-modal="true"` signals this to assistive tech; scroll lock prevents interaction
- [x] Backdrop has `role="presentation"` — provided by `modal.aria.overlay`

## How it works

```
┌──────────────┐       ┌───────────────────────┐       ┌──────────────────┐
│  ModalLogic  │──────▶│        Store           │──────▶│  useLogic (sub)  │
│  .open()     │       │  { status, open,       │       │  Svelte $state   │
│  .close()    │       │    hasOpened }          │       │  or React useSES │
│  .toggle()   │       └───────────────────────┘       └──────────────────┘
│  .focusDialog()                                            │
│  .handleKeyDown()    ┌───────────────────────┐             │
│                      │     modal.aria         │◀────── spread onto DOM
│                      │  { dialog, overlay,    │
│                      │    titleId, descId }   │
│                      └───────────────────────┘
│
│  DOM helpers (opt-in, imported separately):
│  ├── trapFocus(event, container)
│  ├── getFocusableElements(container)
│  ├── lockScroll() / unlockScroll()
│  └── resetModalIdCounter()
└──────────────────────────────────────────────
```

The logic class is framework-agnostic — it manages state through a `Store` and provides ARIA metadata and DOM helper functions. Framework adapters subscribe to the store and wire up the DOM:

1. **Portal** — the adapter mounts the modal at `document.body` (or equivalent)
2. **ARIA** — the adapter spreads `modal.aria` attributes onto the right elements
3. **Focus** — the adapter calls `focusDialog()` on mount and passes the dialog element to `handleKeyDown()` for trapping
4. **Scroll lock** — handled automatically by `open()` / `finishClose()` / `destroy()`
5. **Focus restore** — handled automatically by `finishClose()`
6. **Animations** — the adapter reads `state.status` to apply CSS classes and calls `finishOpen()` / `finishClose()` at transition boundaries
