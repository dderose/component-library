# Validation

The validation system uses simple rule objects to validate any value. Rules are used by `TextFieldLogic`, `CheckboxLogic`, `RadioGroupLogic`, `SelectLogic`, and `MultiSelectLogic`.

## ValidationRule

A rule is an object with a `name` and a `validate` function that returns `null` (valid) or an error string:

```ts
interface ValidationRule<T> {
  name: string;
  validate: (value: T) => string | null;
}
```

## runValidation

Runs all rules against a value and returns a result:

```ts
import { runValidation } from "@component-library/core";

const rules = [
  { name: "required", validate: (v: string) => (v ? null : "Required") },
  { name: "minLength", validate: (v: string) => (v.length >= 3 ? null : "Too short") },
];

const result = runValidation("hi", rules);
// { valid: false, errors: ["Too short"] }
```

## ValidationResult

```ts
interface ValidationResult {
  valid: boolean;
  errors: string[];
}
```

If all rules pass, `valid` is `true` and `errors` is empty. If any rule fails, `valid` is `false` and `errors` contains all failure messages (not just the first).

## Writing custom rules

Rules are plain objects, so you can write factory functions:

```ts
function maxLength(max: number): ValidationRule<string> {
  return {
    name: "maxLength",
    validate: (v) => (v.length <= max ? null : `Maximum ${max} characters`),
  };
}

function pattern(regex: RegExp, message: string): ValidationRule<string> {
  return {
    name: "pattern",
    validate: (v) => (regex.test(v) ? null : message),
  };
}

// For arrays (MultiSelect)
function minSelected(min: number): ValidationRule<string[]> {
  return {
    name: "minSelected",
    validate: (v) => (v.length >= min ? null : `Select at least ${min}`),
  };
}

// For booleans (Checkbox)
function mustAccept(): ValidationRule<boolean> {
  return {
    name: "mustAccept",
    validate: (v) => (v ? null : "You must accept"),
  };
}
```

## Usage with components

Pass rules to any logic class that supports them:

```ts
const field = new TextFieldLogic({
  rules: [required(), minLength(3), maxLength(100)],
  validateOnChange: true,   // validate on every setValue()
  validateOnBlur: true,     // validate on blur()
});

// Manual validation
const result = field.validate();
```

Validation timing is controlled by `validateOnChange` and `validateOnBlur` options. You can also call `validate()` manually at any time (e.g., on form submit).
