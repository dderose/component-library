import type { ModalLogic } from "@component-library/core";

/**
 * Svelte action that sets up focus trapping and initial focus for a modal dialog.
 *
 * On mount:
 *   - Moves focus to the first focusable element inside the node
 *     (or the node itself if nothing is focusable).
 *
 * While active:
 *   - Intercepts keydown to trap Tab / Shift+Tab within the node
 *     and close on Escape (delegating to ModalLogic.handleKeyDown).
 *
 * Usage:
 *   <div use:focusTrap={logic}>…</div>
 */
export function focusTrap(node: HTMLElement, logic: ModalLogic) {
  // Move focus into the dialog on mount.
  logic.focusDialog(node);

  function handleKeyDown(event: KeyboardEvent) {
    logic.handleKeyDown(event, node);
  }

  node.addEventListener("keydown", handleKeyDown);

  return {
    update(newLogic: ModalLogic) {
      logic = newLogic;
    },
    destroy() {
      node.removeEventListener("keydown", handleKeyDown);
    },
  };
}
