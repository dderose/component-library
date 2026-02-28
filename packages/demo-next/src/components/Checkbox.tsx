"use client";

import {
  CheckboxLogic,
  checkbox,
  useLogic,
  type CheckboxOptions,
} from "@component-library/react";

interface CheckboxProps {
  label: string;
  options?: CheckboxOptions;
}

export function Checkbox({ label, options = {} }: CheckboxProps) {
  const [state, logic] = useLogic(() => new CheckboxLogic(options));

  return (
    <label className={checkbox.root(state)}>
      <input
        type="checkbox"
        className={checkbox.input}
        checked={state.checked}
        onChange={() => logic.toggle()}
        onFocus={() => logic.focus()}
        onBlur={() => logic.blur()}
      />
      <span className={checkbox.label}>{label}</span>
    </label>
  );
}
