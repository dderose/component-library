import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";
import { runValidation, type ValidationResult, type ValidationRule } from "../utils/validation";

// ---- State & Options ----

export interface RadioGroupState<T extends string = string> {
  value: T | null;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
  validation: ValidationResult;
}

export interface RadioGroupOptions<T extends string = string> {
  initialValue?: T | null;
  rules?: ValidationRule<T | null>[];
  validateOnChange?: boolean;
}

// ---- Logic class ----

export class RadioGroupLogic<T extends string = string>
  implements ComponentLogic<RadioGroupState<T>>
{
  private store: Store<RadioGroupState<T>>;
  private rules: ValidationRule<T | null>[];
  private validateOnChange: boolean;

  constructor(options: RadioGroupOptions<T> = {}) {
    const { initialValue = null, rules = [], validateOnChange = true } = options;

    this.rules = rules;
    this.validateOnChange = validateOnChange;

    this.store = new Store<RadioGroupState<T>>({
      value: initialValue,
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

  subscribe(listener: (state: RadioGroupState<T>) => void) {
    return this.store.subscribe(listener);
  }

  // ---- Actions ----

  setValue(value: T): void {
    this.store.setState((prev) => {
      const next: RadioGroupState<T> = { ...prev, value, dirty: true, touched: true };
      if (this.validateOnChange) {
        next.validation = runValidation(value, this.rules);
      }
      return next;
    });
  }

  focus(): void {
    this.store.setState((prev) => ({ ...prev, focused: true }));
  }

  blur(): void {
    this.store.setState((prev) => ({ ...prev, focused: false, touched: true }));
  }

  reset(value: T | null = null): void {
    this.store.setState({
      value,
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
