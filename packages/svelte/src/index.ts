// ---- Adapter ----

export type { ClickOutsideParams } from "./actions/click-outside";
export { clickOutside } from "./actions/click-outside";
export { focusTrap } from "./actions/focus-trap";
// ---- Actions ----
export { portal } from "./actions/portal";
export type { ModalAriaOverrides } from "./components/Modal.svelte";

// ---- Components ----
export { default as Modal } from "./components/Modal.svelte";
export { useLogic } from "./use-logic.svelte";
