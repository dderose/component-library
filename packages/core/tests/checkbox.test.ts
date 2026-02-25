import { describe, expect, it, vi } from "vitest";
import { CheckboxLogic } from "../src/components/checkbox";
import type { ValidationRule } from "../src/utils/validation";

const mustAccept: ValidationRule<boolean> = {
  name: "mustAccept",
  validate: (v) => (v ? null : "Must accept"),
};

describe("CheckboxLogic", () => {
  it("has correct default initial state", () => {
    const cb = new CheckboxLogic();
    expect(cb.getState()).toEqual({
      checked: false,
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  });

  it("respects initialChecked", () => {
    const cb = new CheckboxLogic({ initialChecked: true });
    expect(cb.getState().checked).toBe(true);
  });

  it("setChecked updates state", () => {
    const cb = new CheckboxLogic();
    cb.setChecked(true);
    const s = cb.getState();
    expect(s.checked).toBe(true);
    expect(s.dirty).toBe(true);
    expect(s.touched).toBe(true);
  });

  it("toggle flips checked state", () => {
    const cb = new CheckboxLogic();
    cb.toggle();
    expect(cb.getState().checked).toBe(true);
    cb.toggle();
    expect(cb.getState().checked).toBe(false);
  });

  it("validates on change by default", () => {
    const cb = new CheckboxLogic({ rules: [mustAccept] });
    cb.setChecked(false);
    expect(cb.getState().validation.valid).toBe(false);

    cb.setChecked(true);
    expect(cb.getState().validation.valid).toBe(true);
  });

  it("does not validate on change when disabled", () => {
    const cb = new CheckboxLogic({ rules: [mustAccept], validateOnChange: false });
    cb.setChecked(false);
    expect(cb.getState().validation.valid).toBe(true);
  });

  it("focus and blur", () => {
    const cb = new CheckboxLogic();
    cb.focus();
    expect(cb.getState().focused).toBe(true);

    cb.blur();
    expect(cb.getState().focused).toBe(false);
    expect(cb.getState().touched).toBe(true);
  });

  it("validate runs rules", () => {
    const cb = new CheckboxLogic({ rules: [mustAccept], validateOnChange: false });
    const result = cb.validate();
    expect(result.valid).toBe(false);
    expect(cb.getState().validation).toEqual(result);
  });

  it("reset restores defaults", () => {
    const cb = new CheckboxLogic();
    cb.setChecked(true);
    cb.focus();
    cb.blur();

    cb.reset();
    expect(cb.getState()).toEqual({
      checked: false,
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  });

  it("reset with custom value", () => {
    const cb = new CheckboxLogic();
    cb.reset(true);
    expect(cb.getState().checked).toBe(true);
  });

  it("subscribe and destroy", () => {
    const cb = new CheckboxLogic();
    const listener = vi.fn();
    cb.subscribe(listener);

    cb.toggle();
    expect(listener).toHaveBeenCalledTimes(1);

    cb.destroy();
    cb.toggle();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
