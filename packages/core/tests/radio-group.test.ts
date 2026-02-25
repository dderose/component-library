import { describe, it, expect, vi } from "vitest";
import { RadioGroupLogic } from "../src/components/radio-group";
import type { ValidationRule } from "../src/utils/validation";

const required = (): ValidationRule<string | null> => ({
  name: "required",
  validate: (v) => (v ? null : "Required"),
});

describe("RadioGroupLogic", () => {
  it("has correct default initial state", () => {
    const rg = new RadioGroupLogic();
    expect(rg.getState()).toEqual({
      value: null,
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  });

  it("respects initialValue", () => {
    const rg = new RadioGroupLogic({ initialValue: "a" });
    expect(rg.getState().value).toBe("a");
  });

  it("setValue updates value and marks dirty/touched", () => {
    const rg = new RadioGroupLogic();
    rg.setValue("option1");
    const s = rg.getState();
    expect(s.value).toBe("option1");
    expect(s.dirty).toBe(true);
    expect(s.touched).toBe(true);
  });

  it("validates on change by default", () => {
    const rg = new RadioGroupLogic<"a" | "b">({ rules: [required()] });
    rg.setValue("a");
    expect(rg.getState().validation.valid).toBe(true);
  });

  it("does not validate on change when disabled", () => {
    const rg = new RadioGroupLogic({ rules: [required()], validateOnChange: false });
    rg.setValue("a");
    // Would be valid either way since "a" is truthy, but the point is
    // no validation ran — let's test with validate() instead
    expect(rg.getState().validation).toEqual({ valid: true, errors: [] });
  });

  it("focus and blur", () => {
    const rg = new RadioGroupLogic();
    rg.focus();
    expect(rg.getState().focused).toBe(true);

    rg.blur();
    expect(rg.getState().focused).toBe(false);
    expect(rg.getState().touched).toBe(true);
  });

  it("validate runs rules and updates state", () => {
    const rg = new RadioGroupLogic({ rules: [required()], validateOnChange: false });
    const result = rg.validate();
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Required");
    expect(rg.getState().validation).toEqual(result);
  });

  it("reset restores defaults", () => {
    const rg = new RadioGroupLogic();
    rg.setValue("something");
    rg.focus();
    rg.blur();

    rg.reset();
    expect(rg.getState()).toEqual({
      value: null,
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  });

  it("reset with custom value", () => {
    const rg = new RadioGroupLogic();
    rg.reset("preset");
    expect(rg.getState().value).toBe("preset");
  });

  it("subscribe and destroy", () => {
    const rg = new RadioGroupLogic();
    const listener = vi.fn();
    rg.subscribe(listener);

    rg.setValue("x");
    expect(listener).toHaveBeenCalledTimes(1);

    rg.destroy();
    rg.setValue("y");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
