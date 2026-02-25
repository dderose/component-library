# Component Library

A headless, framework-agnostic component library. Business logic lives in **pure TypeScript** (`@component-library/core`), with thin adapters for each framework.

## Architecture

```
packages/
  core/            ← Pure TS: state, validation, logic (no framework deps)
  svelte/          ← Svelte 5 components + useLogic adapter
  react-native/    ← React Native components + useLogic hook
  demo-svelte/     ← SvelteKit demo site showcasing all components
```

**The pattern:** Each component has a `*Logic` class in core that manages state via an observable `Store`. Framework packages subscribe to that store using their native reactivity primitives — Svelte runes or React's `useSyncExternalStore`.

## Components

| Component | Core class | Docs |
|---|---|---|
| Modal | `ModalLogic` | [docs/components/modal.md](docs/components/modal.md) |
| TextField | `TextFieldLogic` | — |
| Checkbox | `CheckboxLogic` | — |
| RadioGroup | `RadioGroupLogic` | — |
| Select | `SelectLogic` | — |
| MultiSelect | `MultiSelectLogic` | — |
| Accordion | `AccordionLogic` | — |

## Setup

```bash
bun install
```

## Demo

Run the Svelte demo site to see all components in action:

```bash
bun run --filter @component-library/demo-svelte dev
```

## Test

```bash
bun test              # run all tests
bun test --cwd packages/core   # core only
```

## Usage

### Svelte

```svelte
<script lang="ts">
  import { TextField, required, minLength } from "@component-library/svelte";
</script>

<TextField
  label="Username"
  placeholder="Enter username"
  options={{
    rules: [required(), minLength(3)],
  }}
/>
```

### React Native

```tsx
import { TextField, required, minLength } from "@component-library/react-native";

function MyForm() {
  return (
    <TextField
      label="Username"
      placeholder="Enter username"
      options={{
        rules: [required(), minLength(3)],
      }}
    />
  );
}
```

### Using core logic directly (headless)

For full control, use the logic class directly and build your own UI:

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
3. **Svelte:** Create a `.svelte` wrapper that uses `useLogic()`
4. **React Native:** Create a `.tsx` wrapper that uses `useLogic()`
5. **Export:** Add to each package's `index.ts`

## Adding a new framework adapter

1. Create `packages/<framework>/`
2. Implement a `useLogic()` (or equivalent) that subscribes to a `ComponentLogic` instance and bridges it into the framework's reactivity
3. Build thin UI components on top
