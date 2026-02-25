// ---- Adapter ----
export { useLogic } from "./use-logic";

// ---- Re-export core for convenience ----
// Consumers can import everything from @component-library/react-native
export {
  // Utils
  Store,
  DerivedStore,
  defaultEquals,
  shallowEquals,
  runValidation,

  // Components
  TextFieldLogic,
  CheckboxLogic,
  RadioGroupLogic,
  SelectLogic,
  MultiSelectLogic,
  ModalLogic,
  AccordionLogic,

  // DOM helpers (for web — not used in RN, but available)
  getFocusableElements,
  trapFocus,
  lockScroll,
  unlockScroll,

  // Test helpers
  resetSelectIdCounter,
  resetMultiSelectIdCounter,
  resetModalIdCounter,
  resetAccordionIdCounter,
} from "@component-library/core";

export type {
  ComponentLogic,
  Listener,
  Unsubscribe,
  ValidationResult,
  ValidationRule,
  TextFieldState,
  TextFieldOptions,
  CheckboxState,
  CheckboxOptions,
  RadioGroupState,
  RadioGroupOptions,
  SelectState,
  SelectOption,
  SelectAria,
  SelectOptions,
  MultiSelectState,
  MultiSelectOption,
  MultiSelectAria,
  MultiSelectOptions,
  ModalState,
  ModalStatus,
  ModalAria,
  ModalOptions,
  AccordionState,
  AccordionItem,
  AccordionAria,
  AccordionOptions,
} from "@component-library/core";
