# Component Library

A headless, framework-agnostic component library. Business logic lives in **pure TypeScript** (`@component-library/core`), with thin adapters for each framework. The core has zero DOM or framework dependencies — all state, validation, keyboard navigation, and ARIA live in plain TypeScript classes that any UI layer can subscribe to.

## Architecture

```
packages/
  core/              ← Pure TS: state, validation, keyboard nav, ARIA (no framework deps)
  css/               ← Framework-agnostic CSS: Moon Design System tokens + component styles
  svelte/            ← Svelte 5 adapter: useLogic, actions, wrapper components
  react/             ← React (web) adapter: useLogic hook
  react-native/      ← React Native adapter: useLogic hook
  demo-svelte/       ← SvelteKit demo site showcasing all components
  demo-react-native/ ← Expo demo app showcasing all components
```

**The pattern:** Each component has a `*Logic` class in core that manages state via an observable `Store`. Framework packages subscribe to that store using their native reactivity primitives — Svelte 5 runes (`$state`) or React's `useSyncExternalStore`. The logic classes handle keyboard navigation, ARIA attribute generation, validation, and all state transitions; the UI layer just wires up events and renders. The `@component-library/css` package provides Moon Design System styled CSS that works with any framework.

## Components

| Component | Core class | Features | Docs |
|---|---|---|---|
| TextField | `TextFieldLogic` | Validation, dirty/touched tracking, validateOnChange/Blur | [docs](docs/components/text-field.md) |
| Checkbox | `CheckboxLogic` | Toggle, validation, dirty/touched tracking | [docs](docs/components/checkbox.md) |
| RadioGroup | `RadioGroupLogic` | Single selection, validation, dirty/touched tracking | [docs](docs/components/radio-group.md) |
| Select | `SelectLogic` | Keyboard nav, ARIA combobox/listbox, highlight tracking, disabled options | [docs](docs/components/select.md) |
| MultiSelect | `MultiSelectLogic` | Keyboard nav, ARIA multiselectable, tag-style selection, Backspace removal | [docs](docs/components/multi-select.md) |
| Modal | `ModalLogic` | Status state machine (opening/open/closing/closed), focus trap, scroll lock, ARIA dialog | [docs](docs/components/modal.md) |
| Accordion | `AccordionLogic` | Keyboard nav, ARIA regions, single/multiple mode, collapsible constraint, disabled items | [docs](docs/components/accordion.md) |
| Button | `ButtonLogic` | Async loading state (prevents double-submit), disabled, pressed/focused tracking | [docs](docs/components/button.md) |

## Core utilities

| Utility | Description | Docs |
|---|---|---|
| `Store<T>` | Observable store with selector subscriptions and shallow equality | [docs](docs/core/store.md) |
| `DerivedStore<T>` | Read-only computed store derived from one or more parent stores | [docs](docs/core/store.md#derivedstore) |
| `runValidation` | Run an array of validation rules against a value, collecting all errors | [docs](docs/core/validation.md) |
| `shallowEquals` | Shallow equality for objects and arrays (useful with selector subscriptions) | [docs](docs/core/store.md#equality-helpers) |

## Svelte adapter

| Export | Type | Description |
|---|---|---|
| `useLogic(logic)` | Function | Bridges any `ComponentLogic` into Svelte 5 reactivity via `$state` |
| `portal` | Action | Moves element to `document.body` (escape overflow:hidden) |
| `focusTrap` | Action | Traps Tab/Shift+Tab focus within an element, restores on destroy |
| `clickOutside` | Action | Fires callback on clicks outside the element (supports enabled flag) |
| `Modal` | Component | Full-featured modal wrapper with transitions, focus trap, and ARIA |

## React Native adapter

| Export | Type | Description |
|---|---|---|
| `useLogic(factory)` | Hook | Bridges any `ComponentLogic` into React via `useSyncExternalStore` |

The React Native package also re-exports all core types and classes for convenience.

## Setup

```bash
bun install
```

## Demo

### Svelte

Run the SvelteKit demo site to see all components in action, including a multi-component contact form:

```bash
bun run --filter @component-library/demo-svelte dev
```

Pages: TextField, Checkbox, RadioGroup, Select, MultiSelect, Modal, Accordion, Button, Contact Form.

### React Native

Run the Expo demo app:

```bash
cd packages/demo-react-native
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or `w` for web.

## Test

The core package has a comprehensive test suite covering all components, utilities, keyboard navigation, ARIA, and state transitions (234 tests):

```bash
npx vitest run packages/core/tests   # run all core tests
npx vitest run packages/core/tests/select.test.ts   # single file
npx vitest --watch packages/core/tests   # watch mode
```

| Test file | Tests | Covers |
|---|---|---|
| `store.test.ts` | 27 | Store, selector subscriptions, DerivedStore, shallowEquals |
| `validation.test.ts` | 5 | runValidation, multi-rule error collection |
| `text-field.test.ts` | 15 | setValue, focus/blur, validateOnChange/Blur, reset |
| `checkbox.test.ts` | 11 | setChecked, toggle, validation, reset |
| `radio-group.test.ts` | 10 | setValue, validation, focus/blur, reset |
| `button.test.ts` | 17 | press, async loading, disableWhileLoading, pressed tracking |
| `select.test.ts` | 42 | Open/close, highlight, disabled skip, full keyboard nav, ARIA |
| `multi-select.test.ts` | 44 | select/deselect/toggle, keyboard nav, Backspace, ARIA |
| `modal.test.ts` | 22 | Lifecycle state machine, finishOpen/finishClose, callbacks, ARIA |
| `accordion.test.ts` | 41 | Expand/collapse, single/multiple mode, keyboard nav, disabled, ARIA |

## Usage

### Svelte 5

```svelte
<script lang="ts">
  import { useLogic, clickOutside } from "@component-library/svelte";
  import { SelectLogic } from "@component-library/core";
  import type { SelectOption } from "@component-library/core";

  const options: SelectOption[] = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
  ];

  const logic = new SelectLogic({ options });
  const state = useLogic(logic);
</script>

<div use:clickOutside={{ handler: () => logic.closeMenu(), enabled: state.current.open }}>
  <button
    {...logic.getTriggerAria()}
    onclick={() => logic.toggleMenu()}
    onkeydown={(e) => logic.handleKeyDown(e)}
  >
    {state.current.value ?? "Choose…"}
  </button>

  {#if state.current.open}
    <ul role={logic.aria.listbox.role} id={logic.aria.listbox.id}>
      {#each options as opt, i}
        <li
          id={logic.aria.optionId(i)}
          role="option"
          aria-selected={state.current.value === opt.value}
          class:highlighted={state.current.highlightedIndex === i}
          onclick={() => logic.setValue(opt.value)}
        >
          {opt.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>
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

### Headless (core only)

Use the logic classes directly for full control, or to integrate with any framework:

```ts
import { TextFieldLogic, required } from "@component-library/core";

const field = new TextFieldLogic({
  rules: [required()],
  validateOnBlur: true,
});

field.subscribe((state) => {
  console.log(state.value, state.validation);
});

field.setValue("hello");
field.blur();
field.validate();
```

### React (web)

```tsx
"use client";

import { useLogic } from "@component-library/react";
import { TextFieldLogic, textfield } from "@component-library/react";
import type { ValidationRule } from "@component-library/react";

const required = (): ValidationRule<string> => ({
  name: "required",
  validate: (v) => (v.trim() ? null : "Required"),
});

function MyField() {
  const [state, logic] = useLogic(
    () => new TextFieldLogic({ rules: [required()], validateOnBlur: true })
  );

  return (
    <div className={textfield.root(state)}>
      <label className={textfield.label}>Username</label>
      <input
        className={textfield.input}
        value={state.value}
        onChange={(e) => logic.setValue(e.target.value)}
        onFocus={() => logic.focus()}
        onBlur={() => logic.blur()}
      />
      {!state.validation.valid && state.touched && (
        <ul className={textfield.errors}>
          {state.validation.errors.map((err, i) => (
            <li key={i} className={textfield.error}>{err}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## Adding a new component

1. **Core:** Create `packages/core/src/components/my-component.ts` with a `MyComponentLogic` class implementing `ComponentLogic<TState>`
2. **Test:** Add `packages/core/tests/my-component.test.ts`
3. **Svelte:** Create a `.svelte` demo page or wrapper, use `useLogic()` to bridge
4. **React:** Create a `.tsx` component, use `useLogic()` from `@component-library/react`
5. **React Native:** Create a `.tsx` screen, use `useLogic()` from `@component-library/react-native`
6. **Export:** Add to each package's `index.ts`
7. **Docs:** Add `docs/components/my-component.md`

## Adding a new framework adapter

1. Create `packages/<framework>/`
2. Implement a `useLogic()` (or equivalent) that subscribes to a `ComponentLogic` instance and bridges it into the framework's reactivity
3. Build thin UI components on top (optional — consumers can use logic classes directly)
