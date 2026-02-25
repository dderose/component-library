import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";
import {
  runValidation,
  type ValidationResult,
  type ValidationRule,
} from "../utils/validation";

// ---- ID generation ----

let idCounter = 0;

function generateId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

export function resetMultiSelectIdCounter(): void {
  idCounter = 0;
}

// ---- State & Options ----

export interface MultiSelectOption<T extends string = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface MultiSelectState<T extends string = string> {
  value: T[];
  open: boolean;
  /** Index of the currently highlighted option (-1 = none). */
  highlightedIndex: number;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
  validation: ValidationResult;
}

export interface MultiSelectAria {
  /** Props for the trigger button. */
  trigger: {
    role: "combobox";
    "aria-haspopup": "listbox";
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-activedescendant": string;
    "aria-labelledby"?: string;
    "aria-multiselectable"?: undefined;
  };
  /** Props for the listbox container. */
  listbox: {
    role: "listbox";
    id: string;
    "aria-multiselectable": "true";
    "aria-labelledby"?: string;
  };
  /** Returns the id for an option at the given index. */
  optionId: (index: number) => string;
  /** The label element id. */
  labelId: string;
}

export interface MultiSelectOptions<T extends string = string> {
  initialValue?: T[];
  options?: MultiSelectOption<T>[];
  rules?: ValidationRule<T[]>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// ---- Logic class ----

export class MultiSelectLogic<T extends string = string>
  implements ComponentLogic<MultiSelectState<T>>
{
  private store: Store<MultiSelectState<T>>;
  private rules: ValidationRule<T[]>[];
  private validateOnChange: boolean;
  private validateOnBlur: boolean;
  private selectOptions: MultiSelectOption<T>[];

  /** Generated ARIA IDs and attributes for this instance. */
  readonly aria: MultiSelectAria;

  constructor(options: MultiSelectOptions<T> = {}) {
    const {
      initialValue = [],
      options: selectOptions = [],
      rules = [],
      validateOnChange = true,
      validateOnBlur = true,
    } = options;

    this.selectOptions = selectOptions;
    this.rules = rules;
    this.validateOnChange = validateOnChange;
    this.validateOnBlur = validateOnBlur;

    const instanceId = generateId("multiselect");
    this.aria = {
      trigger: {
        role: "combobox",
        "aria-haspopup": "listbox",
        "aria-expanded": false,
        "aria-controls": `${instanceId}-listbox`,
        "aria-activedescendant": "",
        "aria-labelledby": `${instanceId}-label`,
        "aria-multiselectable": undefined,
      },
      listbox: {
        role: "listbox",
        id: `${instanceId}-listbox`,
        "aria-multiselectable": "true",
        "aria-labelledby": `${instanceId}-label`,
      },
      optionId: (index: number) => `${instanceId}-option-${index}`,
      labelId: `${instanceId}-label`,
    };

    this.store = new Store<MultiSelectState<T>>({
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

  subscribe(listener: (state: MultiSelectState<T>) => void) {
    return this.store.subscribe(listener);
  }

  getOptions(): MultiSelectOption<T>[] {
    return this.selectOptions;
  }

  /**
   * Returns the live ARIA attributes for the trigger, incorporating
   * current state (expanded, activedescendant).
   */
  getTriggerAria(): MultiSelectAria["trigger"] {
    const { open, highlightedIndex } = this.store.getState();
    return {
      ...this.aria.trigger,
      "aria-expanded": open,
      "aria-activedescendant":
        open && highlightedIndex >= 0
          ? this.aria.optionId(highlightedIndex)
          : "",
    };
  }

  // ---- Actions ----

  setOptions(options: MultiSelectOption<T>[]): void {
    this.selectOptions = options;
  }

  setValue(value: T[]): void {
    this.store.setState((prev) => {
      const next: MultiSelectState<T> = { ...prev, value, dirty: true, touched: true };
      if (this.validateOnChange) {
        next.validation = runValidation(value, this.rules);
      }
      return next;
    });
  }

  /** Add an item if not already selected. */
  select(item: T): void {
    const { value } = this.store.getState();
    if (!value.includes(item)) {
      this.setValue([...value, item]);
    }
  }

  /** Remove an item if currently selected. */
  deselect(item: T): void {
    const { value } = this.store.getState();
    if (value.includes(item)) {
      this.setValue(value.filter((v) => v !== item));
    }
  }

  /** Toggle an item's selection state. */
  toggleItem(item: T): void {
    if (this.store.getState().value.includes(item)) {
      this.deselect(item);
    } else {
      this.select(item);
    }
  }

  /** Toggle the currently highlighted option. */
  toggleHighlighted(): void {
    const { highlightedIndex, open } = this.store.getState();
    if (!open || highlightedIndex < 0) return;

    const opt = this.selectOptions[highlightedIndex];
    if (opt && !opt.disabled) {
      this.toggleItem(opt.value);
    }
  }

  clear(): void {
    this.setValue([]);
  }

  openMenu(): void {
    const firstEnabled = this.selectOptions.findIndex((o) => !o.disabled);
    this.store.setState((prev) => ({
      ...prev,
      open: true,
      highlightedIndex: firstEnabled >= 0 ? firstEnabled : -1,
    }));
  }

  closeMenu(): void {
    this.store.setState((prev) => {
      const next: MultiSelectState<T> = {
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

  private findNextEnabled(from: number, direction: 1 | -1): number {
    const len = this.selectOptions.length;
    let index = from;
    for (let i = 0; i < len; i++) {
      index = (index + direction + len) % len;
      if (!this.selectOptions[index].disabled) return index;
    }
    return -1;
  }

  /**
   * Keyboard handler for the multi-select.
   * Attach to the trigger element's keydown event.
   *
   * Supported keys:
   * - ArrowDown / ArrowUp: move highlight (opens menu if closed)
   * - Enter / Space: toggle highlighted option's selection (keeps menu open)
   * - Escape: close menu
   * - Home / End: jump to first / last option
   * - Backspace: remove last selected item (when menu is closed)
   */
  handleKeyDown(event: KeyboardEvent): void {
    const { open, highlightedIndex, value } = this.store.getState();

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
          this.toggleHighlighted();
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

      case "Backspace": {
        if (!open && value.length > 0) {
          this.deselect(value[value.length - 1]);
        }
        break;
      }

      case "Tab": {
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
      const next: MultiSelectState<T> = {
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

  reset(value: T[] = []): void {
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
