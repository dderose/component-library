import type { Listener, Unsubscribe } from "../types";

/**
 * Minimal observable store. Framework adapters subscribe to this
 * and translate changes into their native reactivity system.
 *
 * This is intentionally simple — no middleware, no selectors.
 * Each component logic class owns one or more stores.
 */
export class Store<T> {
  private state: T;
  private listeners = new Set<Listener<T>>();

  constructor(initialState: T) {
    this.state = initialState;
  }

  getState(): T {
    return this.state;
  }

  setState(updater: T | ((prev: T) => T)): void {
    const next =
      typeof updater === "function"
        ? (updater as (prev: T) => T)(this.state)
        : updater;

    // Shallow equality check — skip if same reference
    if (next === this.state) return;

    this.state = next;
    this.notify();
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
    this.listeners.clear();
  }
}
