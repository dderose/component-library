# Component Library

A headless, framework-agnostic component library. Business logic lives in **pure TypeScript** (`@component-library/core`), with thin adapters for each framework.

## Architecture

```
packages/
  core/              ← Pure TS: state, validation, logic (no framework deps)
  svelte/            ← Svelte 5 adapter: useLogic, actions, wrapper components
  react-native/      ← React Native adapter: useLogic hook
  demo-svelte/       ← SvelteKit demo site showcasing all components
  demo-react-native/ ← Expo demo app showcasing all components
```

**The pattern:** Each component has a `*Logic` class in core that manages state via an observable `Store`. Framework packages subscribe to that store using their native reactivity primitives — Svelte 5 runes or React's `useSyncExternalStore`.

## Components

| Component | Core class | Features | Docs |
|---|---|---|---|
| TextField | `TextFieldLogic` | Validation, dirty/touched tracking | [docs](docs/components/text-field.md) |
| Checkbox | `CheckboxLogic` | Validation, dirty/touched tracking | [docs](docs/components/checkbox.md) |
| RadioGroup | `RadioGroupLogic` | Validation, dirty/touched tracking | [docs](docs/components/radio-group.md) |
| Select | `SelectLogic` | Keyboard nav, ARIA, highlight tracking, disabled options | [docs](docs/components/select.md) |
| MultiSelect | `MultiSelectLogic` | Keyboard nav, ARIA, multi-selection, tag removal | [docs](docs/components/multi-select.md) |
| Modal | `ModalLogic` | Status state machine, focus trap, scroll lock, ARIA | [docs](docs/components/modal.md) |
| Accordion | `AccordionLogic` | Keyboard nav, ARIA, animated expand/collapse, disabled items | [docs](docs/components/accordion.md) |

## Core utilities

| Utility | Description | Docs |
|---|---|---|
| `Store<T>` | Observable store with selector subscriptions | [docs](docs/core/store.md) |
| `DerivedStore<T>` | Read-only computed store from one or more parents | [docs](docs/core/store.md#derivedstore) |
| `runValidation` | Run validation rules against a value | [docs](docs/core/validation.md) |

## Svelte adapter

| Export | Type | Description |
|---|---|---|
| `useLogic(logic)` | Function | Bridges any `ComponentLogic` into Svelte 5 reactivity |
| `portal` | Action | Moves element to `document.body` (escape overflow:hidden) |
| `focusTrap` | Action | Traps focus within element, restores on destroy |
| `clickOutside` | Action | Fires callback on clicks outside the element |
| `Modal` | Component | Full-featured modal wrapper with transitions and ARIA |

## Setup

```bash
bun install
```

## Demo

### Svelte

Run the SvelteKit demo site to see all components in action:

```bash
bun run --filter @component-library/demo-svelte dev
```

### React Native

Run the Expo demo app:

```bash
cd packages/demo-react-native
npx expo start
```

Then press `i` for iOS simulator, `a` for Android emulator, or `w` for web.

## Test

```bash
bun test              # run all tests
bun test --cwd packages/core   # core only
```

## Usage

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
</script>

<button
  {...logic.getTriggerAria()}
  onclick={() => logic.toggleMenu()}
  onkeydown={(e) => logic.handleKeyDown(e)}
>
  {state.current.value ?? "Choose…"}
</button>
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

## Adding a new component

1. **Core:** Create `packages/core/src/components/my-component.ts` with a `MyComponentLogic` class implementing `ComponentLogic<TState>`
2. **Test:** Add `packages/core/tests/my-component.test.ts`
3. **Svelte:** Create a `.svelte` wrapper or use `useLogic()` directly
4. **React Native:** Create a `.tsx` wrapper or use `useLogic()` directly
5. **Export:** Add to each package's `index.ts`
6. **Docs:** Add `docs/components/my-component.md`

## Adding a new framework adapter

1. Create `packages/<framework>/`
2. Implement a `useLogic()` (or equivalent) that subscribes to a `ComponentLogic` instance and bridges it into the framework's reactivity
3. Build thin UI components on top (optional — consumers can use logic classes directly)
