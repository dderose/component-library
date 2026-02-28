"use client";

import {
  RadioGroupLogic,
  radioGroup as cls,
  useLogic,
  type RadioGroupOptions,
} from "@component-library/react";

interface RadioGroupProps<T extends string> {
  legend: string;
  options: { value: T; label: string }[];
  radioOptions?: RadioGroupOptions<T>;
}

export function RadioGroup<T extends string>({
  legend,
  options,
  radioOptions = {},
}: RadioGroupProps<T>) {
  const [state, logic] = useLogic(
    () => new RadioGroupLogic<T>(radioOptions),
  );

  return (
    <div className={cls.root(state)}>
      <fieldset className={cls.fieldset}>
        <legend className={cls.legend}>{legend}</legend>
        {options.map(({ value, label }) => (
          <label key={value} className={cls.option}>
            <input
              type="radio"
              className={cls.input}
              name={legend}
              value={value}
              checked={state.value === value}
              onChange={() => logic.setValue(value)}
              onFocus={() => logic.focus()}
              onBlur={() => logic.blur()}
            />
            {label}
          </label>
        ))}
      </fieldset>

      {!state.validation.valid && state.touched && (
        <ul className={cls.errors}>
          {state.validation.errors.map((err, i) => (
            <li key={i} className={cls.error}>
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
