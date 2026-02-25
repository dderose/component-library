/**
 * Utility for building class name strings from component state.
 *
 * Each function returns a space-separated string of classes matching
 * the @component-library/css naming convention.
 *
 * Usage in any framework:
 *   <div class={classNames.textfield(state)}>
 *   <input class={classNames.textfieldInput()}>
 */

// ---- Helpers ----

function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

interface ValidationState {
  touched: boolean;
  dirty: boolean;
  validation: { valid: boolean };
}

interface FocusState {
  focused: boolean;
}

// ---- TextField ----

export interface TextFieldClassState extends ValidationState, FocusState {}

export const textfield = {
  root(state: TextFieldClassState): string {
    return cx(
      "cl-textfield",
      state.focused && "cl-textfield--focused",
      state.touched && "cl-textfield--touched",
      state.dirty && "cl-textfield--dirty",
      !state.validation.valid && "cl-textfield--invalid",
    );
  },
  label: "cl-textfield-label",
  input: "cl-textfield-input",
  errors: "cl-textfield-errors",
  error: "cl-textfield-error",
};

// ---- Checkbox ----

export interface CheckboxClassState extends ValidationState {
  checked: boolean;
}

export const checkbox = {
  root(state: CheckboxClassState): string {
    return cx(
      "cl-checkbox",
      state.checked && "cl-checkbox--checked",
      state.touched && "cl-checkbox--touched",
      state.dirty && "cl-checkbox--dirty",
      !state.validation.valid && "cl-checkbox--invalid",
    );
  },
  label: "cl-checkbox-label",
  input: "cl-checkbox-input",
  errors: "cl-checkbox-errors",
  error: "cl-checkbox-error",
};

// ---- RadioGroup ----

export interface RadioGroupClassState extends ValidationState {}

export const radioGroup = {
  root(state: RadioGroupClassState): string {
    return cx(
      "cl-radio-group",
      state.touched && "cl-radio-group--touched",
      state.dirty && "cl-radio-group--dirty",
      !state.validation.valid && "cl-radio-group--invalid",
    );
  },
  fieldset: "cl-radio-group-fieldset",
  legend: "cl-radio-group-legend",
  option: "cl-radio-group-option",
  input: "cl-radio-group-input",
  errors: "cl-radio-group-errors",
  error: "cl-radio-group-error",
};

// ---- Select ----

export interface SelectClassState extends ValidationState, FocusState {
  open: boolean;
}

export const select = {
  root(state: SelectClassState): string {
    return cx(
      "cl-select",
      state.open && "cl-select--open",
      state.focused && "cl-select--focused",
      state.touched && "cl-select--touched",
      state.dirty && "cl-select--dirty",
      !state.validation.valid && "cl-select--invalid",
    );
  },
  label: "cl-select-label",
  wrapper: "cl-select-wrapper",
  trigger: "cl-select-trigger",
  value: "cl-select-value",
  placeholder: "cl-select-placeholder",
  chevron: "cl-select-chevron",
  dropdown: "cl-select-dropdown",
  option(flags: { highlighted?: boolean; selected?: boolean; disabled?: boolean } = {}): string {
    return cx(
      "cl-select-option",
      flags.highlighted && "cl-select-option--highlighted",
      flags.selected && "cl-select-option--selected",
      flags.disabled && "cl-select-option--disabled",
    );
  },
  errors: "cl-select-errors",
  error: "cl-select-error",
};

// ---- MultiSelect ----

export interface MultiSelectClassState extends ValidationState, FocusState {
  open: boolean;
}

export const multiSelect = {
  root(state: MultiSelectClassState): string {
    return cx(
      "cl-multiselect",
      state.open && "cl-multiselect--open",
      state.focused && "cl-multiselect--focused",
      state.touched && "cl-multiselect--touched",
      state.dirty && "cl-multiselect--dirty",
      !state.validation.valid && "cl-multiselect--invalid",
    );
  },
  label: "cl-multiselect-label",
  wrapper: "cl-multiselect-wrapper",
  trigger: "cl-multiselect-trigger",
  tags: "cl-multiselect-tags",
  tag: "cl-multiselect-tag",
  tagRemove: "cl-multiselect-tag-remove",
  placeholder: "cl-multiselect-placeholder",
  chevron: "cl-multiselect-chevron",
  dropdown: "cl-multiselect-dropdown",
  option(flags: { highlighted?: boolean; selected?: boolean; disabled?: boolean } = {}): string {
    return cx(
      "cl-multiselect-option",
      flags.highlighted && "cl-multiselect-option--highlighted",
      flags.selected && "cl-multiselect-option--selected",
      flags.disabled && "cl-multiselect-option--disabled",
    );
  },
  optionCheck: "cl-multiselect-option-check",
  errors: "cl-multiselect-errors",
  error: "cl-multiselect-error",
};

// ---- Button ----

export interface ButtonClassState {
  loading: boolean;
  disabled: boolean;
  focused: boolean;
  pressed: boolean;
}

export const button = {
  root(state: ButtonClassState, variant: "primary" | "secondary" = "primary"): string {
    return cx(
      "cl-button",
      variant === "primary" && "cl-button--primary",
      variant === "secondary" && "cl-button--secondary",
      state.loading && "cl-button--loading",
      state.disabled && "cl-button--disabled",
      state.focused && "cl-button--focused",
      state.pressed && "cl-button--pressed",
    );
  },
  spinner: "cl-button-spinner",
};

// ---- Modal ----

export const modal = {
  overlay: "cl-modal-overlay",
  panel: "cl-modal-panel",
  header: "cl-modal-header",
  close: "cl-modal-close",
  body: "cl-modal-body",
  footer: "cl-modal-footer",
};

// ---- Accordion ----

export const accordion = {
  root: "cl-accordion",
  item(flags: { expanded?: boolean; disabled?: boolean } = {}): string {
    return cx(
      "cl-accordion-item",
      flags.expanded && "cl-accordion-item--expanded",
      flags.disabled && "cl-accordion-item--disabled",
    );
  },
  header: "cl-accordion-header",
  trigger: "cl-accordion-trigger",
  chevron(rotated: boolean): string {
    return cx("cl-accordion-chevron", rotated && "cl-accordion-chevron--rotated");
  },
  panel: "cl-accordion-panel",
  content: "cl-accordion-content",
};

// ---- Convenience bundle ----

export const classNames = {
  textfield,
  checkbox,
  radioGroup,
  select,
  multiSelect,
  button,
  modal,
  accordion,
};
