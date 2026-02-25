// ---- Adapter ----
export { useLogic } from "./use-logic.svelte";

// ---- Actions ----
export { portal } from "./actions/portal";
export { focusTrap } from "./actions/focus-trap";
export { clickOutside } from "./actions/click-outside";
export type { ClickOutsideParams } from "./actions/click-outside";

// ---- Components ----
export { default as Modal } from "./components/Modal.svelte";
export type { ModalAriaOverrides } from "./components/Modal.svelte";
