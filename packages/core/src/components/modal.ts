import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";

// ---- ID generation ----

let idCounter = 0;

function generateId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

/** Reset the counter (useful for deterministic tests). */
export function resetModalIdCounter(): void {
  idCounter = 0;
}

// ---- State & Options ----

export type ModalStatus = "closed" | "opening" | "open" | "closing";

export interface ModalState {
  /** Current lifecycle status. Use this to drive CSS transitions / animations. */
  status: ModalStatus;
  /** Convenience boolean — true when status is "opening" or "open". */
  open: boolean;
  /** Whether the modal has been opened at least once (useful for lazy rendering). */
  hasOpened: boolean;
}

/**
 * ARIA attribute bag that framework adapters should spread onto
 * the overlay, dialog container, title, and description elements.
 */
export interface ModalAria {
  /** Props for the overlay / backdrop element. */
  overlay: {
    role: "presentation";
  };
  /** Props for the dialog panel element. */
  dialog: {
    role: "dialog";
    "aria-modal": "true";
    "aria-labelledby": string;
    "aria-describedby": string;
    tabindex: "-1";
  };
  /** `id` to set on the title element. */
  titleId: string;
  /** `id` to set on the description / body element. */
  descriptionId: string;
}

export interface ModalOptions {
  /** Start in the open state. @default false */
  initialOpen?: boolean;
  /** Close when the backdrop / overlay is clicked. @default true */
  closeOnOverlayClick?: boolean;
  /** Close when the Escape key is pressed. @default true */
  closeOnEscape?: boolean;
  /** Lock page scroll while the modal is open. @default true */
  scrollLock?: boolean;
  /**
   * Called after the modal transitions to the "opening" state.
   * Use this to trigger enter animations and scroll lock.
   */
  onOpen?: () => void;
  /**
   * Called after the modal transitions to the "closing" state.
   * Use this to trigger exit animations and release scroll lock.
   */
  onClose?: () => void;
}

// ---- Focus trap helpers (framework-agnostic) ----

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Returns all focusable elements inside a container, in DOM order.
 * Framework adapters call this to implement focus trapping.
 */
export function getFocusableElements(container: Element): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
    (el) => !el.hasAttribute("disabled") && el.offsetParent !== null
  );
}

/**
 * Handles Tab / Shift+Tab to trap focus within a container.
 * Call this from your keydown handler, passing the dialog container element.
 * Returns `true` if the event was handled (trapped), `false` otherwise.
 */
export function trapFocus(event: KeyboardEvent, container: Element): boolean {
  if (event.key !== "Tab") return false;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return false;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first || !container.contains(document.activeElement)) {
      event.preventDefault();
      last.focus();
      return true;
    }
  } else {
    if (document.activeElement === last || !container.contains(document.activeElement)) {
      event.preventDefault();
      first.focus();
      return true;
    }
  }

  return false;
}

// ---- Scroll lock helpers ----

let scrollLockCount = 0;
let savedScrollY = 0;
let savedBodyStyles: { overflow: string; position: string; top: string; width: string } | null =
  null;

/**
 * Locks body scroll. Reference-counted so nested calls are safe
 * (though this library enforces single-modal, the count guards against
 * external code also locking scroll).
 */
export function lockScroll(): void {
  if (typeof document === "undefined") return;

  if (scrollLockCount === 0) {
    savedScrollY = window.scrollY;
    savedBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = "100%";
  }
  scrollLockCount++;
}

/**
 * Unlocks body scroll. Only actually unlocks when all locks are released.
 */
export function unlockScroll(): void {
  if (typeof document === "undefined") return;

  scrollLockCount = Math.max(0, scrollLockCount - 1);
  if (scrollLockCount === 0 && savedBodyStyles) {
    document.body.style.overflow = savedBodyStyles.overflow;
    document.body.style.position = savedBodyStyles.position;
    document.body.style.top = savedBodyStyles.top;
    document.body.style.width = savedBodyStyles.width;
    window.scrollTo(0, savedScrollY);
    savedBodyStyles = null;
  }
}

// ---- Logic class ----

export class ModalLogic implements ComponentLogic<ModalState> {
  private store: Store<ModalState>;
  private closeOnOverlayClick: boolean;
  private closeOnEscape: boolean;
  private scrollLockEnabled: boolean;
  private onOpen?: () => void;
  private onClose?: () => void;

  /**
   * The element that had focus before the modal opened.
   * Focus is restored here on close.
   */
  private triggerElement: Element | null = null;

  /** Generated ARIA IDs and attributes for this modal instance. */
  readonly aria: ModalAria;

  constructor(options: ModalOptions = {}) {
    const {
      initialOpen = false,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      scrollLock = true,
      onOpen,
      onClose,
    } = options;

    this.closeOnOverlayClick = closeOnOverlayClick;
    this.closeOnEscape = closeOnEscape;
    this.scrollLockEnabled = scrollLock;
    this.onOpen = onOpen;
    this.onClose = onClose;

    const instanceId = generateId("modal");
    this.aria = {
      overlay: { role: "presentation" },
      dialog: {
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": `${instanceId}-title`,
        "aria-describedby": `${instanceId}-desc`,
        tabindex: "-1",
      },
      titleId: `${instanceId}-title`,
      descriptionId: `${instanceId}-desc`,
    };

    const initialStatus: ModalStatus = initialOpen ? "open" : "closed";

    this.store = new Store<ModalState>({
      status: initialStatus,
      open: initialOpen,
      hasOpened: initialOpen,
    });

    // If starting open, apply scroll lock immediately.
    if (initialOpen && this.scrollLockEnabled) {
      lockScroll();
    }
  }

  // ---- Read ----

  getState() {
    return this.store.getState();
  }

  subscribe(listener: (state: ModalState) => void) {
    return this.store.subscribe(listener);
  }

  // ---- Actions ----

  /**
   * Opens the modal.
   * - Captures the currently focused element for later restoration.
   * - Transitions status to "opening" (call `finishOpen()` after your
   *   enter animation completes, or it advances automatically via microtask).
   * - Locks page scroll if `scrollLock` is enabled.
   * - Fires the `onOpen` callback.
   */
  open(): void {
    const prev = this.store.getState();
    if (prev.status !== "closed") return;

    // Capture trigger for focus restoration.
    if (typeof document !== "undefined") {
      this.triggerElement = document.activeElement;
    }

    if (this.scrollLockEnabled) {
      lockScroll();
    }

    this.store.setState({
      status: "opening",
      open: true,
      hasOpened: true,
    });

    this.onOpen?.();

    // Auto-advance to "open" via microtask so subscribers see "opening" first.
    // If the consumer calls finishOpen() before this runs (e.g. in a
    // transition-start callback), the guard inside finishOpen prevents double-advance.
    queueMicrotask(() => {
      const current = this.store.getState();
      if (current.status === "opening") {
        this.finishOpen();
      }
    });
  }

  /**
   * Call after your enter animation/transition completes to move
   * status from "opening" → "open". If you don't use animations
   * this is called automatically via microtask.
   */
  finishOpen(): void {
    const current = this.store.getState();
    if (current.status !== "opening") return;

    this.store.setState((s) => ({ ...s, status: "open" }));
  }

  /**
   * Closes the modal.
   * - Transitions status to "closing" (call `finishClose()` after your
   *   exit animation completes, or it advances automatically via microtask).
   * - Fires the `onClose` callback.
   */
  close(): void {
    const { status } = this.store.getState();
    if (status !== "open" && status !== "opening") return;

    this.store.setState((s) => ({ ...s, status: "closing" }));

    this.onClose?.();

    // Auto-advance to "closed" via microtask (same pattern as open).
    queueMicrotask(() => {
      const current = this.store.getState();
      if (current.status === "closing") {
        this.finishClose();
      }
    });
  }

  /**
   * Call after your exit animation/transition completes to move
   * status from "closing" → "closed".
   *
   * - Unlocks page scroll.
   * - Restores focus to the element that was focused before the modal opened.
   */
  finishClose(): void {
    const current = this.store.getState();
    if (current.status !== "closing") return;

    if (this.scrollLockEnabled) {
      unlockScroll();
    }

    this.store.setState((s) => ({ ...s, status: "closed", open: false }));

    // Restore focus to trigger element.
    if (this.triggerElement && "focus" in this.triggerElement) {
      (this.triggerElement as HTMLElement).focus();
      this.triggerElement = null;
    }
  }

  /** Toggles between open and closed. */
  toggle(): void {
    const { status } = this.store.getState();
    if (status === "closed") {
      this.open();
    } else if (status === "open" || status === "opening") {
      this.close();
    }
  }

  /** Call from the overlay/backdrop click handler. Respects `closeOnOverlayClick`. */
  handleOverlayClick(): void {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }

  /**
   * Unified keydown handler for the modal.
   *
   * - Escape: closes the modal (if `closeOnEscape` is enabled).
   * - Tab / Shift+Tab: traps focus within the dialog container.
   *
   * @param event  The native KeyboardEvent.
   * @param dialogElement  The dialog container element (for focus trapping).
   *                        If omitted, only Escape handling is active.
   */
  handleKeyDown(event: KeyboardEvent, dialogElement?: Element): void {
    if (this.closeOnEscape && event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }

    if (dialogElement && event.key === "Tab") {
      trapFocus(event, dialogElement);
    }
  }

  /**
   * Call from the framework adapter after the dialog element has mounted.
   * Moves focus into the dialog — either to the first focusable element,
   * or to the dialog element itself (which has tabindex="-1").
   */
  focusDialog(dialogElement: HTMLElement): void {
    const focusable = getFocusableElements(dialogElement);
    if (focusable.length > 0) {
      focusable[0].focus();
    } else {
      dialogElement.focus();
    }
  }

  destroy(): void {
    // Release scroll lock if still active.
    const { status } = this.store.getState();
    if ((status === "open" || status === "opening") && this.scrollLockEnabled) {
      unlockScroll();
    }

    this.triggerElement = null;
    this.store.destroy();
  }
}
