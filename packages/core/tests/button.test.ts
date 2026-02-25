import { describe, expect, it, vi } from "vitest";
import { ButtonLogic } from "../src/components/button";

describe("ButtonLogic", () => {
  it("has correct default initial state", () => {
    const btn = new ButtonLogic();
    expect(btn.getState()).toEqual({
      loading: false,
      disabled: false,
      pressed: false,
      focused: false,
    });
  });

  it("respects initial disabled", () => {
    const btn = new ButtonLogic({ disabled: true });
    expect(btn.getState().disabled).toBe(true);
    expect(btn.isDisabled()).toBe(true);
  });

  // ---- press ----

  it("press calls onClick handler", () => {
    const onClick = vi.fn();
    const btn = new ButtonLogic({ onClick });

    btn.press();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("press is ignored when disabled", () => {
    const onClick = vi.fn();
    const btn = new ButtonLogic({ onClick, disabled: true });

    btn.press();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("press does nothing without onClick", async () => {
    const btn = new ButtonLogic();
    // Should not throw
    await expect(btn.press()).resolves.toBeUndefined();
  });

  // ---- async loading ----

  it("async onClick sets loading state", async () => {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
      resolve = r;
    });
    const btn = new ButtonLogic({ onClick: () => promise });

    const states: boolean[] = [];
    btn.subscribe((s) => states.push(s.loading));

    const pressPromise = btn.press();
    expect(btn.getState().loading).toBe(true);

    resolve();
    await pressPromise;
    expect(btn.getState().loading).toBe(false);
    expect(states).toEqual([true, false]);
  });

  it("loading sets isDisabled when disableWhileLoading is true (default)", async () => {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
      resolve = r;
    });
    const btn = new ButtonLogic({ onClick: () => promise });

    btn.press();
    expect(btn.isDisabled()).toBe(true);

    resolve();
    await promise;
    // Need to wait for the finally block
    await new Promise((r) => setTimeout(r, 0));
    expect(btn.isDisabled()).toBe(false);
  });

  it("loading does NOT set isDisabled when disableWhileLoading is false", async () => {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
      resolve = r;
    });
    const btn = new ButtonLogic({
      onClick: () => promise,
      disableWhileLoading: false,
    });

    btn.press();
    expect(btn.getState().loading).toBe(true);
    expect(btn.isDisabled()).toBe(false);

    resolve();
    await promise;
  });

  it("ignores press while loading", async () => {
    let callCount = 0;
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
      resolve = r;
    });
    const btn = new ButtonLogic({
      onClick: () => {
        callCount++;
        return promise;
      },
    });

    btn.press(); // First click — starts loading
    btn.press(); // Should be ignored
    btn.press(); // Should be ignored

    expect(callCount).toBe(1);
    resolve();
    await promise;
  });

  it("loading resets and error propagates if onClick rejects", async () => {
    const btn = new ButtonLogic({
      onClick: async () => {
        throw new Error("fail");
      },
    });

    await expect(btn.press()).rejects.toThrow("fail");
    expect(btn.getState().loading).toBe(false);
  });

  // ---- setDisabled ----

  it("setDisabled updates state", () => {
    const btn = new ButtonLogic();
    btn.setDisabled(true);
    expect(btn.getState().disabled).toBe(true);
    expect(btn.isDisabled()).toBe(true);

    btn.setDisabled(false);
    expect(btn.isDisabled()).toBe(false);
  });

  // ---- setOnClick ----

  it("setOnClick replaces the handler", () => {
    const first = vi.fn();
    const second = vi.fn();
    const btn = new ButtonLogic({ onClick: first });

    btn.setOnClick(second);
    btn.press();
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  // ---- focus / blur ----

  it("focus and blur", () => {
    const btn = new ButtonLogic();
    btn.focus();
    expect(btn.getState().focused).toBe(true);

    btn.blur();
    expect(btn.getState().focused).toBe(false);
  });

  // ---- pointerDown / pointerUp ----

  it("pointerDown / pointerUp track pressed state", () => {
    const btn = new ButtonLogic();
    btn.pointerDown();
    expect(btn.getState().pressed).toBe(true);

    btn.pointerUp();
    expect(btn.getState().pressed).toBe(false);
  });

  it("pointerDown is ignored when disabled", () => {
    const btn = new ButtonLogic({ disabled: true });
    btn.pointerDown();
    expect(btn.getState().pressed).toBe(false);
  });

  // ---- reset ----

  it("reset restores defaults", async () => {
    const btn = new ButtonLogic({
      disabled: true,
      onClick: async () => {},
    });
    btn.focus();
    btn.reset();

    expect(btn.getState()).toEqual({
      loading: false,
      disabled: false,
      pressed: false,
      focused: false,
    });
  });

  // ---- destroy ----

  it("destroy stops notifications", () => {
    const btn = new ButtonLogic();
    const listener = vi.fn();
    btn.subscribe(listener);

    btn.destroy();
    btn.setDisabled(true);
    expect(listener).not.toHaveBeenCalled();
  });
});
