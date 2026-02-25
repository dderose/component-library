import { describe, expect, it, vi } from "vitest";
import { DerivedStore, defaultEquals, Store, shallowEquals } from "../src/utils/store";

// ---- Store ----

describe("Store", () => {
  it("returns initial state", () => {
    const store = new Store({ count: 0 });
    expect(store.getState()).toEqual({ count: 0 });
  });

  it("sets state with a value", () => {
    const store = new Store({ count: 0 });
    store.setState({ count: 5 });
    expect(store.getState()).toEqual({ count: 5 });
  });

  it("sets state with an updater function", () => {
    const store = new Store({ count: 0 });
    store.setState((prev) => ({ count: prev.count + 1 }));
    expect(store.getState()).toEqual({ count: 1 });
  });

  it("skips update if same reference", () => {
    const initial = { count: 0 };
    const store = new Store(initial);
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState(initial);
    expect(listener).not.toHaveBeenCalled();
  });

  it("notifies listeners on state change", () => {
    const store = new Store({ count: 0 });
    const listener = vi.fn();
    store.subscribe(listener);

    store.setState({ count: 1 });
    expect(listener).toHaveBeenCalledWith({ count: 1 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("unsubscribes correctly", () => {
    const store = new Store({ count: 0 });
    const listener = vi.fn();
    const unsub = store.subscribe(listener);

    unsub();
    store.setState({ count: 1 });
    expect(listener).not.toHaveBeenCalled();
  });

  it("supports multiple listeners", () => {
    const store = new Store(0);
    const a = vi.fn();
    const b = vi.fn();
    store.subscribe(a);
    store.subscribe(b);

    store.setState(1);
    expect(a).toHaveBeenCalledWith(1);
    expect(b).toHaveBeenCalledWith(1);
  });

  it("destroy clears all listeners", () => {
    const store = new Store(0);
    const listener = vi.fn();
    store.subscribe(listener);

    store.destroy();
    store.setState(1);
    expect(listener).not.toHaveBeenCalled();
  });

  // ---- Selector subscriptions ----

  it("selector subscription fires when selected slice changes", () => {
    const store = new Store({ a: 1, b: "hello" });
    const listener = vi.fn();
    store.subscribe((s) => s.a, listener);

    store.setState({ a: 2, b: "hello" });
    expect(listener).toHaveBeenCalledWith(2);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("selector subscription does NOT fire when unrelated state changes", () => {
    const store = new Store({ a: 1, b: "hello" });
    const listener = vi.fn();
    store.subscribe((s) => s.a, listener);

    store.setState({ a: 1, b: "world" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("selector subscription with shallowEquals", () => {
    const store = new Store({ items: [1, 2, 3], label: "test" });
    const listener = vi.fn();
    store.subscribe((s) => s.items, listener, shallowEquals);

    // Same items, different reference — should NOT fire
    store.setState({ items: [1, 2, 3], label: "changed" });
    expect(listener).not.toHaveBeenCalled();

    // Different items — should fire
    store.setState({ items: [1, 2, 3, 4], label: "changed" });
    expect(listener).toHaveBeenCalledWith([1, 2, 3, 4]);
  });

  it("destroy clears selector listeners too", () => {
    const store = new Store({ a: 1 });
    const listener = vi.fn();
    store.subscribe((s) => s.a, listener);

    store.destroy();
    store.setState({ a: 2 });
    expect(listener).not.toHaveBeenCalled();
  });
});

// ---- DerivedStore ----

describe("DerivedStore", () => {
  describe("from (single parent)", () => {
    it("computes initial value", () => {
      const parent = new Store({ count: 5 });
      const derived = DerivedStore.from(parent, (s) => s.count * 2);
      expect(derived.getState()).toBe(10);
    });

    it("updates when parent changes", () => {
      const parent = new Store({ count: 5 });
      const derived = DerivedStore.from(parent, (s) => s.count * 2);
      const listener = vi.fn();
      derived.subscribe(listener);

      parent.setState({ count: 10 });
      expect(derived.getState()).toBe(20);
      expect(listener).toHaveBeenCalledWith(20);
    });

    it("does not fire when derived value is unchanged", () => {
      const parent = new Store({ a: 1, b: "x" });
      const derived = DerivedStore.from(parent, (s) => s.a);
      const listener = vi.fn();
      derived.subscribe(listener);

      parent.setState({ a: 1, b: "y" });
      expect(listener).not.toHaveBeenCalled();
    });

    it("destroy stops updates", () => {
      const parent = new Store({ count: 1 });
      const derived = DerivedStore.from(parent, (s) => s.count);
      const listener = vi.fn();
      derived.subscribe(listener);

      derived.destroy();
      parent.setState({ count: 2 });
      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("combine (multiple parents)", () => {
    it("computes initial value from multiple parents", () => {
      const a = new Store(1);
      const b = new Store(2);
      const derived = DerivedStore.combine([a, b], ([va, vb]) => va + vb);
      expect(derived.getState()).toBe(3);
    });

    it("updates when any parent changes", () => {
      const a = new Store(1);
      const b = new Store(10);
      const derived = DerivedStore.combine([a, b], ([va, vb]) => va + vb);
      const listener = vi.fn();
      derived.subscribe(listener);

      a.setState(5);
      expect(derived.getState()).toBe(15);
      expect(listener).toHaveBeenCalledWith(15);

      b.setState(20);
      expect(derived.getState()).toBe(25);
      expect(listener).toHaveBeenCalledWith(25);
    });

    it("destroy stops tracking all parents", () => {
      const a = new Store(1);
      const b = new Store(2);
      const derived = DerivedStore.combine([a, b], ([va, vb]) => va + vb);
      const listener = vi.fn();
      derived.subscribe(listener);

      derived.destroy();
      a.setState(100);
      b.setState(200);
      expect(listener).not.toHaveBeenCalled();
    });
  });
});

// ---- Equality helpers ----

describe("defaultEquals", () => {
  it("uses strict reference equality", () => {
    expect(defaultEquals(1, 1)).toBe(true);
    expect(defaultEquals(1, 2)).toBe(false);
    const obj = { a: 1 };
    expect(defaultEquals(obj, obj)).toBe(true);
    expect(defaultEquals(obj, { a: 1 })).toBe(false);
  });
});

describe("shallowEquals", () => {
  it("returns true for same reference", () => {
    const obj = { a: 1 };
    expect(shallowEquals(obj, obj)).toBe(true);
  });

  it("returns true for objects with same keys and values", () => {
    expect(shallowEquals({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
  });

  it("returns false for different values", () => {
    expect(shallowEquals({ a: 1 }, { a: 2 })).toBe(false);
  });

  it("returns false for different key counts", () => {
    expect(shallowEquals({ a: 1 }, { a: 1, b: 2 } as any)).toBe(false);
  });

  it("compares arrays", () => {
    expect(shallowEquals([1, 2, 3], [1, 2, 3])).toBe(true);
    expect(shallowEquals([1, 2], [1, 2, 3])).toBe(false);
    expect(shallowEquals([1, 2, 3], [1, 2, 4])).toBe(false);
  });

  it("handles null/undefined", () => {
    expect(shallowEquals(null, null)).toBe(true);
    expect(shallowEquals(null, { a: 1 })).toBe(false);
    expect(shallowEquals({ a: 1 }, null)).toBe(false);
  });

  it("handles non-objects", () => {
    expect(shallowEquals(1 as any, 1 as any)).toBe(true);
    expect(shallowEquals("a" as any, "b" as any)).toBe(false);
  });
});
