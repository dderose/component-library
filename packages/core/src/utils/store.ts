import type { Listener, Unsubscribe } from "../types";

// ---- Equality helpers ----

/**
 * Default equality check — strict reference equality.
 * Used when no custom equality function is provided to selector subscriptions.
 */
export function defaultEquals<T>(a: T, b: T): boolean {
  return a === b;
}

/**
 * Shallow equality check for objects and arrays.
 * Compares own enumerable keys/values one level deep.
 * Useful as the `equals` argument for selector subscriptions
 * when your selector returns a new object/array each time.
 */
export function shallowEquals<T>(a: T, b: T): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;

  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  const keysA = Object.keys(a) as (keyof T)[];
  const keysB = Object.keys(b) as (keyof T)[];
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }

  return true;
}

// ---- Store ----

/**
 * Observable store with selector support. Framework adapters subscribe
 * to this and translate changes into their native reactivity system.
 *
 * Basic usage (full-state subscription, backward-compatible):
 *   store.subscribe(state => console.log(state));
 *
 * Selector subscription (only fires when the selected slice changes):
 *   store.subscribe(
 *     state => state.validation,
 *     validation => console.log(validation),
 *   );
 *
 * With custom equality:
 *   store.subscribe(
 *     state => ({ a: state.x, b: state.y }),
 *     slice => console.log(slice),
 *     shallowEquals,
 *   );
 */
export class Store<T> {
  private state: T;
  private listeners = new Set<Listener<T>>();
  private selectorListeners = new Set<SelectorSubscription<T, unknown>>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(updater: T | ((prev: T) => T)): void {
    const next = typeof updater === "function" ? (updater as (prev: T) => T)(this.state) : updater;

    // Shallow equality check — skip if same reference
    if (next === this.state) return;

    this.state = next;
    this.notify();
  }

  /**
   * Subscribe to all state changes (backward-compatible).
   */
  subscribe(listener: Listener<T>): Unsubscribe;

  /**
   * Subscribe to a slice of state. The listener only fires when the
   * selected value changes according to the equality function
   * (defaults to strict reference equality).
   *
   * @param selector  Picks the slice of state to watch.
   * @param listener  Called with the new slice value when it changes.
   * @param equals    Optional equality function. Defaults to `===`.
   *                   Use `shallowEquals` for object/array slices.
   */
  subscribe<S>(
    selector: (state: T) => S,
    listener: Listener<S>,
    equals?: (a: S, b: S) => boolean,
  ): Unsubscribe;

  subscribe<S>(
    selectorOrListener: Listener<T> | ((state: T) => S),
    listener?: Listener<S>,
    equals?: (a: S, b: S) => boolean,
  ): Unsubscribe {
    // Overload 1: full-state subscription
    if (listener === undefined) {
      const fullListener = selectorOrListener as Listener<T>;
      this.listeners.add(fullListener);
      return () => {
        this.listeners.delete(fullListener);
      };
    }

    // Overload 2: selector subscription
    const selector = selectorOrListener as (state: T) => S;
    const eq = equals ?? defaultEquals;

    const sub: SelectorSubscription<T, unknown> = {
      selector: selector as (state: T) => unknown,
      listener: listener as Listener<unknown>,
      equals: eq as (a: unknown, b: unknown) => boolean,
      previousValue: selector(this.state),
    };

    this.selectorListeners.add(sub);
    return () => {
      this.selectorListeners.delete(sub);
    };
  }

  private notify(): void {
    // Full-state listeners
    for (const listener of this.listeners) {
      listener(this.state);
    }

    // Selector listeners — only fire if the selected value changed
    for (const sub of this.selectorListeners) {
      const nextValue = sub.selector(this.state);
      if (!sub.equals(sub.previousValue, nextValue)) {
        sub.previousValue = nextValue;
        sub.listener(nextValue);
      }
    }
  }

  destroy(): void {
    this.listeners.clear();
    this.selectorListeners.clear();
  }
}

/** Internal bookkeeping for a selector subscription. */
interface SelectorSubscription<T, S> {
  selector: (state: T) => S;
  listener: Listener<S>;
  equals: (a: S, b: S) => boolean;
  previousValue: S;
}

// ---- DerivedStore ----

/**
 * A read-only store derived from one or more parent stores.
 *
 * Recomputes its value whenever a parent store changes, and only
 * notifies its own subscribers if the derived value actually changed.
 *
 * Single parent:
 *   const errors = DerivedStore.from(formStore, state => state.validation.errors);
 *
 * Multiple parents:
 *   const summary = DerivedStore.combine(
 *     [nameStore, emailStore],
 *     ([name, email]) => ({ name: name.value, email: email.value }),
 *   );
 */
export class DerivedStore<T> {
  private state: T;
  private listeners = new Set<Listener<T>>();
  private unsubscribers: Unsubscribe[] = [];
  private equals: (a: T, b: T) => boolean;

  private constructor(initialState: T, equals: (a: T, b: T) => boolean) {
    this.state = initialState;
    this.equals = equals;
  }

  /**
   * Create a derived store from a single parent store.
   *
   * @param parent   The source store.
   * @param derive   Maps the parent state to the derived value.
   * @param equals   Optional equality function (defaults to `===`).
   */
  static from<TParent, TDerived>(
    parent: Store<TParent>,
    derive: (state: TParent) => TDerived,
    equals?: (a: TDerived, b: TDerived) => boolean,
  ): DerivedStore<TDerived> {
    const eq = equals ?? defaultEquals;
    const initial = derive(parent.getState());
    const derived = new DerivedStore(initial, eq);

    const unsub = parent.subscribe((parentState) => {
      const next = derive(parentState);
      if (!derived.equals(derived.state, next)) {
        derived.state = next;
        derived.notify();
      }
    });

    derived.unsubscribers.push(unsub);
    return derived;
  }

  /**
   * Create a derived store from multiple parent stores.
   *
   * @param parents  An array of source stores.
   * @param derive   Maps an array of parent states to the derived value.
   * @param equals   Optional equality function (defaults to `===`).
   */
  static combine<TParents extends unknown[], TDerived>(
    parents: { [K in keyof TParents]: Store<TParents[K]> },
    derive: (states: TParents) => TDerived,
    equals?: (a: TDerived, b: TDerived) => boolean,
  ): DerivedStore<TDerived> {
    const eq = equals ?? defaultEquals;
    const getParentStates = () => parents.map((p) => p.getState()) as TParents;

    const initial = derive(getParentStates());
    const derived = new DerivedStore(initial, eq);

    for (const parent of parents) {
      const unsub = parent.subscribe(() => {
        const next = derive(getParentStates());
        if (!derived.equals(derived.state, next)) {
          derived.state = next;
          derived.notify();
        }
      });
      derived.unsubscribers.push(unsub);
    }

    return derived;
  }

  getState(): T {
    return this.state;
  }

  subscribe(listener: Listener<T>): Unsubscribe {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  destroy(): void {
    for (const unsub of this.unsubscribers) {
      unsub();
    }
    this.unsubscribers = [];
    this.listeners.clear();
  }
}
