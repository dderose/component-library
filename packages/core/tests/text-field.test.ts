import { describe, it, expect, vi } from "vitest";
import { TextFieldLogic, type TextFieldState } from "../src/components/text-field";
import type { ValidationRule } from "../src/utils/validation";

const required = (): ValidationRule<string> => ({
  name: "required",
  validate: (v) => (v.trim() ? null : "Required"),
});

const minLength = (min: number): ValidationRule<string> => ({
  name: "minLength",
  validate: (v) => (v.length >= min ? null : `Min ${min} chars`),
});

describe("TextFieldLogic", () => {
  // ---- Initial state ----

  it("has correct default initial state", () => {
    const field = new TextFieldLogic();
    expect(field.getState()).toEqual({
      value: "",
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  });

  it("respects initialValue", () => {
    const field = new TextFieldLogic({ initialValue: "hello" });
    expect(field.getState().value).toBe("hello");
  });

  // ---- setValue ----

  it("setValue updates value and marks dirty", () => {
    const field = new TextFieldLogic();
    field.setValue("test");
    const s = field.getState();
    expect(s.value).toBe("test");
    expect(s.dirty).toBe(true);
  });

  it("setValue validates when validateOnChange is true (default)", () => {
    const field = new TextFieldLogic({ rules: [minLength(5)] });
    field.setValue("ab");
    expect(field.getState().validation.valid).toBe(false);

    field.setValue("abcde");
    expect(field.getState().validation.valid).toBe(true);
  });

  it("setValue does not validate when validateOnChange is false", () => {
    const field = new TextFieldLogic({ rules: [required()], validateOnChange: false });
    field.setValue("");
    expect(field.getState().validation.valid).toBe(true);
  });

  // ---- focus / blur ----

  it("focus sets focused to true", () => {
    const field = new TextFieldLogic();
    field.focus();
    expect(field.getState().focused).toBe(true);
  });

  it("blur sets focused to false and touched to true", () => {
    const field = new TextFieldLogic();
    field.focus();
    field.blur();
    const s = field.getState();
    expect(s.focused).toBe(false);
    expect(s.touched).toBe(true);
  });

  it("blur validates when validateOnBlur is true (default)", () => {
    const field = new TextFieldLogic({
      rules: [required()],
      validateOnChange: false,
      validateOnBlur: true,
    });
    field.setValue("");
    expect(field.getState().validation.valid).toBe(true); // not validated yet

    field.blur();
    expect(field.getState().validation.valid).toBe(false);
  });

  it("blur does not validate when validateOnBlur is false", () => {
    const field = new TextFieldLogic({
      rules: [required()],
      validateOnChange: false,
      validateOnBlur: false,
    });
    field.blur();
    expect(field.getState().validation.valid).toBe(true);
  });

  // ---- validate ----

  it("validate runs all rules and returns the result", () => {
    const field = new TextFieldLogic({
      rules: [required(), minLength(5)],
      validateOnChange: false,
    });
    field.setValue("ab");

    const result = field.validate();
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(1); // min length fails, required passes
    expect(field.getState().validation).toEqual(result);
  });

  // ---- reset ----

  it("reset restores to clean state", () => {
    const field = new TextFieldLogic({ rules: [required()] });
    field.setValue("hello");
    field.focus();
    field.blur();

    field.reset();
    expect(field.getState()).toEqual({
      value: "",
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  });

  it("reset with custom value", () => {
    const field = new TextFieldLogic();
    field.reset("new default");
    expect(field.getState().value).toBe("new default");
  });

  // ---- subscribe ----

  it("notifies subscribers on state changes", () => {
    const field = new TextFieldLogic();
    const listener = vi.fn();
    field.subscribe(listener);

    field.setValue("x");
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ value: "x" }));
  });

  it("unsubscribe stops notifications", () => {
    const field = new TextFieldLogic();
    const listener = vi.fn();
    const unsub = field.subscribe(listener);

    unsub();
    field.setValue("x");
    expect(listener).not.toHaveBeenCalled();
  });

  // ---- destroy ----

  it("destroy stops all notifications", () => {
    const field = new TextFieldLogic();
    const listener = vi.fn();
    field.subscribe(listener);

    field.destroy();
    field.setValue("x");
    expect(listener).not.toHaveBeenCalled();
  });
});
