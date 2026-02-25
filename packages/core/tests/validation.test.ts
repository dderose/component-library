import { describe, expect, it } from "vitest";
import { runValidation, type ValidationRule } from "../src/utils/validation";

const required = (): ValidationRule<string> => ({
  name: "required",
  validate: (v) => (v.trim() ? null : "Required"),
});

const minLength = (min: number): ValidationRule<string> => ({
  name: "minLength",
  validate: (v) => (v.length >= min ? null : `Min ${min} chars`),
});

describe("runValidation", () => {
  it("returns valid with no rules", () => {
    const result = runValidation("anything", []);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("returns valid when all rules pass", () => {
    const result = runValidation("hello", [required(), minLength(3)]);
    expect(result).toEqual({ valid: true, errors: [] });
  });

  it("returns errors for failing rules", () => {
    const result = runValidation("", [required(), minLength(3)]);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Required");
    expect(result.errors).toContain("Min 3 chars");
  });

  it("collects all errors, not just the first", () => {
    const result = runValidation("ab", [required(), minLength(5), minLength(10)]);
    expect(result.valid).toBe(false);
    expect(result.errors).toHaveLength(2);
  });

  it("works with boolean rules", () => {
    const mustBeTrue: ValidationRule<boolean> = {
      name: "mustBeTrue",
      validate: (v) => (v ? null : "Must accept"),
    };
    expect(runValidation(true, [mustBeTrue])).toEqual({ valid: true, errors: [] });
    expect(runValidation(false, [mustBeTrue]).valid).toBe(false);
  });
});
