// ---- Types ----
export type { ComponentLogic, Listener, Unsubscribe } from "./types";

// ---- Utils ----
export { Store, DerivedStore, defaultEquals, shallowEquals } from "./utils/store";
export { runValidation } from "./utils/validation";
export type { ValidationResult, ValidationRule } from "./utils/validation";

// ---- Components ----
export { TextFieldLogic } from "./components/text-field";
export type { TextFieldState, TextFieldOptions } from "./components/text-field";

export { CheckboxLogic } from "./components/checkbox";
export type { CheckboxState, CheckboxOptions } from "./components/checkbox";

export { RadioGroupLogic } from "./components/radio-group";
export type { RadioGroupState, RadioGroupOptions } from "./components/radio-group";

export { SelectLogic, resetSelectIdCounter } from "./components/select";
export type { SelectState, SelectOption, SelectAria, SelectOptions } from "./components/select";

export { MultiSelectLogic, resetMultiSelectIdCounter } from "./components/multi-select";
export type { MultiSelectState, MultiSelectOption, MultiSelectAria, MultiSelectOptions } from "./components/multi-select";

export { ModalLogic, getFocusableElements, trapFocus, lockScroll, unlockScroll, resetModalIdCounter } from "./components/modal";
export type { ModalState, ModalStatus, ModalAria, ModalOptions } from "./components/modal";

export { AccordionLogic, resetAccordionIdCounter } from "./components/accordion";
export type { AccordionState, AccordionItem, AccordionAria, AccordionOptions } from "./components/accordion";
