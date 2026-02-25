import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";
import { runValidation, type ValidationResult, type ValidationRule } from "../utils/validation";

// ---- State & Options ----

export interface TextFieldState {
  value: string;
  touched: boolean;
  dirty: boolean;
  focused: boolean;
  validation: ValidationResult;
}

export interface TextFieldOptions {
  initialValue?: string;
  rules?: ValidationRule<string>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

// ---- Logic class ----

export class TextFieldLogic implements ComponentLogic<TextFieldState> {
  private store: Store<TextFieldState>;
  private rules: ValidationRule<string>[];
  private validateOnChange: boolean;
  private validateOnBlur: boolean;

  constructor(options: TextFieldOptions = {}) {
    const {
      initialValue = "",
      rules = [],
      validateOnChange = true,
      validateOnBlur = true,
    } = options;

    this.rules = rules;
    this.validateOnChange = validateOnChange;
    this.validateOnBlur = validateOnBlur;

    this.store = new Store<TextFieldState>({
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

  subscribe(listener: (state: TextFieldState) => void) {
    return this.store.subscribe(listener);
  }

  // ---- Actions ----

  setValue(value: string): void {
    this.store.setState((prev) => {
      const next = { ...prev, value, dirty: true };
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
    this.store.setState((prev) => {
      const next = { ...prev, focused: false, touched: true };
      if (this.validateOnBlur) {
        next.validation = runValidation(prev.value, this.rules);
      }
      return next;
    });
  }

  reset(value = ""): void {
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
