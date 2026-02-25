import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";
import {
  runValidation,
  type ValidationResult,
  type ValidationRule,
} from "../utils/validation";

// ---- State & Options ----

export interface SelectState<T extends string = string> {
  value: T | null;
  open: boolean;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
  validation: ValidationResult;
}

export interface SelectOptions<T extends string = string> {
  initialValue?: T | null;
  rules?: ValidationRule<T | null>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// ---- Logic class ----

export class SelectLogic<T extends string = string>
  implements ComponentLogic<SelectState<T>>
{
  private store: Store<SelectState<T>>;
  private rules: ValidationRule<T | null>[];
  private validateOnChange: boolean;
  private validateOnBlur: boolean;

  constructor(options: SelectOptions<T> = {}) {
    const {
      initialValue = null,
      rules = [],
      validateOnChange = true,
      validateOnBlur = true,
    } = options;

    this.rules = rules;
    this.validateOnChange = validateOnChange;
    this.validateOnBlur = validateOnBlur;

    this.store = new Store<SelectState<T>>({
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

  subscribe(listener: (state: SelectState<T>) => void) {
    return this.store.subscribe(listener);
  }

  // ---- Actions ----

  setValue(value: T): void {
    this.store.setState((prev) => {
      const next: SelectState<T> = {
        ...prev,
        value,
        dirty: true,
        touched: true,
        open: false,
      };
      if (this.validateOnChange) {
        next.validation = runValidation(value, this.rules);
      }
      return next;
    });
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
      const next: SelectState<T> = { ...prev, focused: false, touched: true, open: false };
      if (this.validateOnBlur) {
        next.validation = runValidation(prev.value, this.rules);
      }
      return next;
    });
  }

  reset(value: T | null = null): void {
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
