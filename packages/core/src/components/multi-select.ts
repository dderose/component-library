import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";
import {
  runValidation,
  type ValidationResult,
  type ValidationRule,
} from "../utils/validation";

// ---- State & Options ----

export interface MultiSelectState<T extends string = string> {
  value: T[];
  open: boolean;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
  validation: ValidationResult;
}

export interface MultiSelectOptions<T extends string = string> {
  initialValue?: T[];
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

  constructor(options: MultiSelectOptions<T> = {}) {
    const {
      initialValue = [],
      rules = [],
      validateOnChange = true,
      validateOnBlur = true,
    } = options;

    this.rules = rules;
    this.validateOnChange = validateOnChange;
    this.validateOnBlur = validateOnBlur;

    this.store = new Store<MultiSelectState<T>>({
      value: initialValue,
      open: false,
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

  // ---- Actions ----

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

  clear(): void {
    this.setValue([]);
  }

  openMenu(): void {
    this.store.setState((prev) => ({ ...prev, open: true }));
  }

  closeMenu(): void {
    this.store.setState((prev) => ({ ...prev, open: false }));
  }

  toggleMenu(): void {
    this.store.setState((prev) => ({ ...prev, open: !prev.open }));
  }

  focus(): void {
    this.store.setState((prev) => ({ ...prev, focused: true }));
  }

  blur(): void {
    this.store.setState((prev) => {
      const next: MultiSelectState<T> = { ...prev, focused: false, touched: true, open: false };
      if (this.validateOnBlur) {
        next.validation = runValidation(prev.value, this.rules);
      }
      return next;
    });
  }

  reset(value: T[] = []): void {
    this.store.setState({
      value,
      open: false,
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
