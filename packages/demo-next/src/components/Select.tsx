"use client";

import { useEffect, useRef } from "react";
import {
  SelectLogic,
  select as cls,
  useLogic,
  useStableId,
  type SelectOption,
  type SelectOptions,
} from "@component-library/react";

interface SelectProps<T> {
  label: string;
  placeholder?: string;
  options: SelectOption<T>[];
  selectOptions?: Omit<SelectOptions<T>, "options">;
}

export function Select<T>({
  label,
  placeholder = "Select…",
  options,
  selectOptions = {},
}: SelectProps<T>) {
  const id = useStableId();
  const [state, logic] = useLogic(
    () => new SelectLogic<T>({ ...selectOptions, id, options }),
  );

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  const triggerAria = logic.getTriggerAria();

  // Close on outside click
  useEffect(() => {
    if (!state.open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        listboxRef.current?.contains(e.target as Node)
      )
        return;
      logic.closeMenu();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [state.open, logic]);

  const selectedLabel = state.value != null
    ? options.find((o) => o.value === state.value)?.label
    : null;

  return (
    <div
      className={cls.root({
        open: state.open,
        focused: state.focused,
        touched: state.touched,
        dirty: state.dirty,
        validation: state.validation,
      })}
    >
      <label className={cls.label}>{label}</label>
      <div className={cls.wrapper}>
        <button
          ref={triggerRef}
          className={cls.trigger}
          type="button"
          role={triggerAria.role}
          aria-haspopup={triggerAria["aria-haspopup"]}
          aria-expanded={state.open}
          aria-controls={triggerAria["aria-controls"]}
          onClick={() => logic.toggleMenu()}
          onKeyDown={(e) =>
            logic.handleKeyDown(e.nativeEvent)
          }
          onFocus={() => logic.focus()}
          onBlur={() => logic.blur()}
        >
          {selectedLabel ? (
            <span className={cls.value}>{selectedLabel}</span>
          ) : (
            <span className={cls.placeholder}>{placeholder}</span>
          )}
          <span className={cls.chevron} aria-hidden="true">
            ▾
          </span>
        </button>

        {state.open && (
          <ul
            ref={listboxRef}
            className={cls.dropdown}
            role="listbox"
            id={triggerAria["aria-controls"]}
          >
            {options.map((opt, i) => (
              <li
                key={String(opt.value)}
                className={cls.option({
                  highlighted: state.highlightedIndex === i,
                  selected: state.value === opt.value,
                  disabled: opt.disabled,
                })}
                role="option"
                aria-selected={state.value === opt.value}
                aria-disabled={opt.disabled || undefined}
                onMouseEnter={() => logic.highlightIndex(i)}
                onClick={() => {
                  if (!opt.disabled) {
                    logic.setValue(opt.value);
                    logic.closeMenu();
                  }
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>

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
