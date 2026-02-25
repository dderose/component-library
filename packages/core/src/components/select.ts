import type { ComponentLogic } from "../types";
import { generateId } from "../utils/id";
import { Store } from "../utils/store";
import { runValidation, type ValidationResult, type ValidationRule } from "../utils/validation";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface SelectState<T extends string = string> {
  value: T | null;
  open: boolean;
  /** Index of the currently highlighted option (-1 = none). */
  highlightedIndex: number;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
  validation: ValidationResult;
}

export interface SelectAria {
  /** Props for the trigger button. */
  trigger: {
    role: "combobox";
    "aria-haspopup": "listbox";
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-activedescendant": string;
    "aria-labelledby"?: string;
  };
  /** Props for the listbox container. */
  listbox: {
    role: "listbox";
    id: string;
    "aria-labelledby"?: string;
  };
  /** Returns the id for an option at the given index. */
  optionId: (index: number) => string;
  /** The label element id (set this as the id on your <label>). */
  labelId: string;
}

export interface SelectOptions<T extends string = string> {
  initialValue?: T | null;
  options?: SelectOption<T>[];
  rules?: ValidationRule<T | null>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// ---- Logic class ----

export class SelectLogic<T extends string = string> implements ComponentLogic<SelectState<T>> {
  private store: Store<SelectState<T>>;
  private rules: ValidationRule<T | null>[];
  private validateOnChange: boolean;
  private validateOnBlur: boolean;
  private selectOptions: SelectOption<T>[];

  /** Generated ARIA IDs and attributes for this instance. */
  readonly aria: SelectAria;

  constructor(options: SelectOptions<T> = {}) {
    const {
      initialValue = null,
      options: selectOptions = [],
      rules = [],
      validateOnChange = true,
      validateOnBlur = true,
    } = options;

    this.selectOptions = selectOptions;
    this.rules = rules;
    this.validateOnChange = validateOnChange;
    this.validateOnBlur = validateOnBlur;

    const instanceId = generateId("select");
    this.aria = {
      trigger: {
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": false,
        "aria-controls": `${instanceId}-listbox`,
        "aria-activedescendant": "",
        "aria-labelledby": `${instanceId}-label`,
      },
      listbox: {
        role: "listbox",
        id: `${instanceId}-listbox`,
        "aria-labelledby": `${instanceId}-label`,
      },
      optionId: (index: number) => `${instanceId}-option-${index}`,
      labelId: `${instanceId}-label`,
    };

    this.store = new Store<SelectState<T>>({
      value: initialValue,
      open: false,
      highlightedIndex: -1,
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  }

  // ---- Read ----

  getState() {
    return this.store.getState();
  }

  subscribe(listener: (state: SelectState<T>) => void) {
    return this.store.subscribe(listener);
  }

  getOptions(): SelectOption<T>[] {
    return this.selectOptions;
  }

  /**
   * Returns the live ARIA attributes for the trigger, incorporating
   * current state (expanded, activedescendant).
   */
  getTriggerAria(): SelectAria["trigger"] {
    const { open, highlightedIndex } = this.store.getState();
    return {
      ...this.aria.trigger,
      "aria-expanded": open,
      "aria-activedescendant":
        open && highlightedIndex >= 0 ? this.aria.optionId(highlightedIndex) : "",
    };
  }

  // ---- Actions ----

  setOptions(options: SelectOption<T>[]): void {
    this.selectOptions = options;
  }

  setValue(value: T): void {
    this.store.setState((prev) => {
      const next: SelectState<T> = {
        ...prev,
        value,
        dirty: true,
        touched: true,
        open: false,
        highlightedIndex: -1,
      };
      if (this.validateOnChange) {
        next.validation = runValidation(value, this.rules);
      }
      return next;
    });
  }

  openMenu(): void {
    // Highlight the currently selected option, or the first option.
    const selectedIndex = this.selectOptions.findIndex(
      (o) => o.value === this.store.getState().value && !o.disabled,
    );
    const firstEnabled = this.selectOptions.findIndex((o) => !o.disabled);

    this.store.setState((prev) => ({
      ...prev,
      open: true,
      highlightedIndex: selectedIndex >= 0 ? selectedIndex : firstEnabled,
    }));
  }

  closeMenu(): void {
    this.store.setState((prev) => {
      const next: SelectState<T> = {
        ...prev,
        open: false,
        highlightedIndex: -1,
        touched: true,
      };
      if (this.validateOnBlur) {
        next.validation = runValidation(prev.value, this.rules);
      }
      return next;
    });
  }

  toggleMenu(): void {
    if (this.store.getState().open) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  highlightIndex(index: number): void {
    const opt = this.selectOptions[index];
    if (!opt || opt.disabled) return;

    this.store.setState((prev) => ({
      ...prev,
      highlightedIndex: index,
    }));
  }

  /** Select the currently highlighted option. */
  selectHighlighted(): void {
    const { highlightedIndex, open } = this.store.getState();
    if (!open || highlightedIndex < 0) return;

    const opt = this.selectOptions[highlightedIndex];
    if (opt && !opt.disabled) {
      this.setValue(opt.value);
    }
  }

  private findNextEnabled(from: number, direction: 1 | -1): number {
    const len = this.selectOptions.length;
    let index = from;
    for (let i = 0; i < len; i++) {
      index = (index + direction + len) % len;
      if (!this.selectOptions[index]?.disabled) return index;
    }
    return -1;
  }

  /**
   * Keyboard handler for the select.
   * Attach to the trigger element's keydown event.
   *
   * Supported keys:
   * - ArrowDown / ArrowUp: move highlight (opens menu if closed)
   * - Enter / Space: select highlighted or toggle menu
   * - Escape: close menu
   * - Home / End: jump to first / last option
   */
  handleKeyDown(event: KeyboardEvent): void {
    const { open, highlightedIndex } = this.store.getState();

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        if (!open) {
          this.openMenu();
        } else {
          const next = this.findNextEnabled(highlightedIndex, 1);
          if (next >= 0) this.highlightIndex(next);
        }
        break;
      }

      case "ArrowUp": {
        event.preventDefault();
        if (!open) {
          this.openMenu();
        } else {
          const prev = this.findNextEnabled(highlightedIndex, -1);
          if (prev >= 0) this.highlightIndex(prev);
        }
        break;
      }

      case "Enter":
      case " ": {
        event.preventDefault();
        if (open) {
          this.selectHighlighted();
        } else {
          this.openMenu();
        }
        break;
      }

      case "Escape": {
        if (open) {
          event.preventDefault();
          this.closeMenu();
        }
        break;
      }

      case "Home": {
        if (open) {
          event.preventDefault();
          const first = this.findNextEnabled(-1, 1);
          if (first >= 0) this.highlightIndex(first);
        }
        break;
      }

      case "End": {
        if (open) {
          event.preventDefault();
          const last = this.findNextEnabled(this.selectOptions.length, -1);
          if (last >= 0) this.highlightIndex(last);
        }
        break;
      }

      case "Tab": {
        // Allow Tab to close the menu and move focus naturally.
        if (open) {
          this.closeMenu();
        }
        break;
      }
    }
  }

  focus(): void {
    this.store.setState((prev) => ({ ...prev, focused: true }));
  }

  blur(): void {
    this.store.setState((prev) => {
      // Don't close the menu on blur — the menu stays open so that
      // option clicks can register before the element is removed.
      // clickOutside / Tab / Escape handle closing instead.
      const next: SelectState<T> = {
        ...prev,
        focused: false,
        touched: true,
      };
      if (this.validateOnBlur && !prev.open) {
        next.validation = runValidation(prev.value, this.rules);
      }
      return next;
    });
  }

  reset(value: T | null = null): void {
    this.store.setState({
      value,
      open: false,
      highlightedIndex: -1,
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  }

  validate(): ValidationResult {
    const result = runValidation(this.getState().value, this.rules);
    this.store.setState((prev) => ({ ...prev, validation: result }));
    return result;
  }

  destroy(): void {
    this.store.destroy();
  }
}
