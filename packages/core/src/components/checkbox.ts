import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";
import {
  runValidation,
  type ValidationResult,
  type ValidationRule,
} from "../utils/validation";

// ---- State & Options ----

export interface CheckboxState {
  checked: boolean;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
  validation: ValidationResult;
}

export interface CheckboxOptions {
  initialChecked?: boolean;
  rules?: ValidationRule<boolean>[];
  validateOnChange?: boolean;
}

// ---- Logic class ----

export class CheckboxLogic implements ComponentLogic<CheckboxState> {
  private store: Store<CheckboxState>;
  private rules: ValidationRule<boolean>[];
  private validateOnChange: boolean;

  constructor(options: CheckboxOptions = {}) {
    const {
      initialChecked = false,
      rules = [],
      validateOnChange = true,
    } = options;

    this.rules = rules;
    this.validateOnChange = validateOnChange;

    this.store = new Store<CheckboxState>({
      checked: initialChecked,
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

  subscribe(listener: (state: CheckboxState) => void) {
    return this.store.subscribe(listener);
  }

  // ---- Actions ----

  setChecked(checked: boolean): void {
    this.store.setState((prev) => {
      const next: CheckboxState = { ...prev, checked, dirty: true, touched: true };
      if (this.validateOnChange) {
        next.validation = runValidation(checked, this.rules);
      }
      return next;
    });
  }

  toggle(): void {
    this.setChecked(!this.store.getState().checked);
  }

  focus(): void {
    this.store.setState((prev) => ({ ...prev, focused: true }));
  }

  blur(): void {
    this.store.setState((prev) => ({ ...prev, focused: false, touched: true }));
  }

  reset(checked = false): void {
    this.store.setState({
      checked,
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  }

  validate(): ValidationResult {
    const result = runValidation(this.getState().checked, this.rules);
    this.store.setState((prev) => ({ ...prev, validation: result }));
    return result;
  }

  destroy(): void {
    this.store.destroy();
  }
}
