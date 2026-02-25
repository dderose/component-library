// ---- Adapter ----

export type {
  AccordionAria,
  AccordionItem,
  AccordionOptions,
  AccordionState,
  ButtonOptions,
  ButtonState,
  CheckboxOptions,
  CheckboxState,
  ComponentLogic,
  Listener,
  ModalAria,
  ModalOptions,
  ModalState,
  ModalStatus,
  MultiSelectAria,
  MultiSelectOption,
  MultiSelectOptions,
  MultiSelectState,
  RadioGroupOptions,
  RadioGroupState,
  SelectAria,
  SelectOption,
  SelectOptions,
  SelectState,
  TextFieldOptions,
  TextFieldState,
  Unsubscribe,
  ValidationResult,
  ValidationRule,
} from "@component-library/core";

// ---- Re-export core for convenience ----
// Consumers can import everything from @component-library/react-native
export {
  AccordionLogic,
  ButtonLogic,
  CheckboxLogic,
  DerivedStore,
  defaultEquals,
  generateId,
  // DOM helpers (for web — not used in RN, but available)
  getFocusableElements,
  lockScroll,
  ModalLogic,
  MultiSelectLogic,
  RadioGroupLogic,
  runValidation,
  SelectLogic,
  // Utils
  Store,
  shallowEquals,
  // Components
  TextFieldLogic,
  trapFocus,
  unlockScroll,
} from "@component-library/core";
export { useLogic } from "./use-logic";
