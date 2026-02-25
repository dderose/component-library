# Store

`Store<T>` is the core observable state container. Every `*Logic` class owns one and framework adapters subscribe to it.

## Basic usage

```ts
import { Store } from "@component-library/core";

const store = new Store({ count: 0, label: "clicks" });

const unsub = store.subscribe((state) => {
  console.log(state.count);
});

store.setState({ count: 1, label: "clicks" });     // full replacement
store.setState((prev) => ({ ...prev, count: 2 })); // updater function

unsub();        // unsubscribe
store.destroy(); // remove all listeners
```

## Shallow equality

`setState` skips notification if the new state is the same reference as the old state. To avoid unnecessary re-renders, only call `setState` when something actually changed.

## Selector subscriptions

Subscribe to a derived slice of state. The listener only fires when the selected value changes:

```ts
import { Store, shallowEquals } from "@component-library/core";

const store = new Store({ name: "Ada", scores: [100, 95] });

// Only fires when `name` changes
store.subscribe(
  (state) => state.name,          // selector
  (name) => console.log(name),    // listener
);

// Shallow equality for objects/arrays
store.subscribe(
  (state) => state.scores,
  (scores) => console.log(scores),
  shallowEquals,                   // equality function
);
```

### Overloaded signatures

```ts
// Simple: listener receives full state
store.subscribe(listener: (state: T) => void): Unsubscribe

// Selector: listener receives selected slice
store.subscribe(
  selector: (state: T) => S,
  listener: (selected: S) => void,
  equals?: (a: S, b: S) => boolean  // default: ===
): Unsubscribe
```

## API

| Method | Description |
|---|---|
| `getState()` | Get current state |
| `setState(updater)` | Set state (value or updater function). Notifies listeners if reference changed. |
| `subscribe(listener)` | Subscribe to all state changes |
| `subscribe(selector, listener, equals?)` | Subscribe to a slice of state |
| `destroy()` | Remove all listeners |

## Equality helpers

```ts
import { defaultEquals, shallowEquals } from "@component-library/core";
```

| Function | Description |
|---|---|
| `defaultEquals(a, b)` | Strict reference equality (`===`) |
| `shallowEquals(a, b)` | One-level-deep comparison for objects and arrays |

---

# DerivedStore

`DerivedStore<T>` is a read-only store computed from one or more parent stores. It recomputes when parents change and only notifies subscribers when the derived value changes.

## Single parent

```ts
import { Store, DerivedStore } from "@component-library/core";

const store = new Store({ firstName: "Ada", lastName: "Lovelace" });

const fullName = DerivedStore.from(
  store,
  (state) => `${state.firstName} ${state.lastName}`,
);

fullName.subscribe((name) => console.log(name));
// "Ada Lovelace"
```

## Multiple parents

```ts
import { Store, DerivedStore } from "@component-library/core";

const userStore = new Store({ name: "Ada" });
const settingsStore = new Store({ theme: "dark" });

const combined = DerivedStore.combine(
  [userStore, settingsStore],
  ([user, settings]) => `${user.name} (${settings.theme})`,
);

combined.subscribe((val) => console.log(val));
// "Ada (dark)"
```

## Custom equality

```ts
import { DerivedStore, shallowEquals } from "@component-library/core";

const errors = DerivedStore.from(
  formStore,
  (state) => state.validation.errors,
  shallowEquals, // only notify when the errors array actually changes
);
```

## API

| Method | Description |
|---|---|
| `DerivedStore.from(parent, derive, equals?)` | Create from a single parent store |
| `DerivedStore.combine(parents, derive, equals?)` | Create from multiple parent stores |
| `getState()` | Get current derived value |
| `subscribe(listener)` | Subscribe to derived value changes |
| `destroy()` | Unsubscribe from all parents |

`DerivedStore` implements the same read interface as `Store`, so it works with `useLogic` in both Svelte and React adapters.
