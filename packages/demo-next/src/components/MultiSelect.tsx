"use client";

import { useEffect, useRef } from "react";
import {
  MultiSelectLogic,
  multiSelect as cls,
  useLogic,
  type MultiSelectOption,
  type MultiSelectOptions,
} from "@component-library/react";

interface MultiSelectProps<T extends string> {
  label: string;
  placeholder?: string;
  options: MultiSelectOption<T>[];
  selectOptions?: Omit<MultiSelectOptions<T>, "options">;
}

export function MultiSelect<T extends string>({
  label,
  placeholder = "Select…",
  options,
  selectOptions = {},
}: MultiSelectProps<T>) {
  const [state, logic] = useLogic(
    () => new MultiSelectLogic<T>({ ...selectOptions, options }),
  );

  const { aria } = logic;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

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

  function getLabelForValue(value: T): string {
    return options.find((o) => o.value === value)?.label ?? value;
  }

  return (
    <div className={cls.root(state)}>
      <label className={cls.label} id={aria.labelId}>
        {label}
      </label>

      <div className={cls.wrapper}>
        <button
          ref={triggerRef}
          className={cls.trigger}
          type="button"
          role={aria.trigger.role}
          aria-haspopup={aria.trigger["aria-haspopup"]}
          aria-expanded={state.open}
          aria-controls={aria.trigger["aria-controls"]}
          aria-activedescendant={
            state.open && state.highlightedIndex >= 0
              ? aria.optionId(state.highlightedIndex)
              : undefined
          }
          aria-labelledby={aria.labelId}
          onClick={() => logic.toggleMenu()}
          onKeyDown={(e) =>
            logic.handleKeyDown(e as unknown as KeyboardEvent)
          }
          onFocus={() => logic.focus()}
          onBlur={() => logic.blur()}
        >
          {state.value.length > 0 ? (
            <span className={cls.tags}>
              {state.value.map((tag) => (
                <span key={tag} className={cls.tag}>
                  {getLabelForValue(tag)}
                  <button
                    className={cls.tagRemove}
                    tabIndex={-1}
                    aria-label={`Remove ${getLabelForValue(tag)}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      logic.deselect(tag);
                    }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </span>
          ) : (
            <span className={cls.placeholder}>{placeholder}</span>
          )}
          <span className={cls.chevron} aria-hidden="true">
            {state.open ? "▲" : "▼"}
          </span>
        </button>

        {state.open && (
          <ul
            ref={listboxRef}
            className={cls.dropdown}
            role={aria.listbox.role}
            id={aria.listbox.id}
            aria-multiselectable="true"
            aria-labelledby={aria.labelId}
          >
            {options.map((opt, i) => (
              <li
                key={String(opt.value)}
                id={aria.optionId(i)}
                className={cls.option({
                  highlighted: state.highlightedIndex === i,
                  selected: state.value.includes(opt.value),
                  disabled: opt.disabled,
                })}
                role="option"
                aria-selected={state.value.includes(opt.value)}
                aria-disabled={opt.disabled || undefined}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => logic.highlightIndex(i)}
                onClick={() => {
                  if (!opt.disabled) logic.toggleItem(opt.value);
                }}
              >
                <span className={cls.optionCheck} aria-hidden="true">
                  {state.value.includes(opt.value) ? "☑" : "☐"}
                </span>
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
