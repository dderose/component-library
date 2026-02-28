"use client";

import {
  TextFieldLogic,
  textfield,
  useLogic,
  type TextFieldOptions,
  type ValidationRule,
} from "@component-library/react";

interface TextFieldProps {
  label: string;
  placeholder?: string;
  type?: string;
  options?: TextFieldOptions;
}

export function TextField({
  label,
  placeholder,
  type = "text",
  options = {},
}: TextFieldProps) {
  const [state, logic] = useLogic(() => new TextFieldLogic(options));

  return (
    <div className={textfield.root(state)}>
      <label className={textfield.label}>{label}</label>
      <input
        className={textfield.input}
        type={type}
        placeholder={placeholder}
        value={state.value}
        onChange={(e) => logic.setValue(e.target.value)}
        onFocus={() => logic.focus()}
        onBlur={() => logic.blur()}
      />
      {!state.validation.valid && state.touched && (
        <ul className={textfield.errors}>
          {state.validation.errors.map((err, i) => (
            <li key={i} className={textfield.error}>
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Convenience: returns a logic ref for external validation */
export function useTextFieldLogic(options: TextFieldOptions = {}) {
  return useLogic(() => new TextFieldLogic(options));
}

// ---- Built-in validation rules ----

export const required = (): ValidationRule<string> => ({
  name: "required",
  validate: (v) => (v.trim() ? null : "This field is required"),
});

export const minLength = (min: number): ValidationRule<string> => ({
  name: "minLength",
  validate: (v) =>
    v.length >= min ? null : `Must be at least ${min} characters`,
});

export const maxLength = (max: number): ValidationRule<string> => ({
  name: "maxLength",
  validate: (v) =>
    v.length <= max ? null : `Must be at most ${max} characters`,
});

export const pattern = (re: RegExp, msg: string): ValidationRule<string> => ({
  name: "pattern",
  validate: (v) => (re.test(v) ? null : msg),
});
