import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";

// ---- State & Options ----

export interface ModalState {
  open: boolean;
  /** Tracks whether the modal has ever been opened (useful for lazy rendering). */
  hasOpened: boolean;
}

export interface ModalOptions {
  /** Start in the open state. @default false */
  initialOpen?: boolean;
  /** Close when the backdrop / overlay is clicked. @default true */
  closeOnOverlayClick?: boolean;
  /** Close when the Escape key is pressed. @default true */
  closeOnEscape?: boolean;
  /** Called after the modal transitions to the open state. */
  onOpen?: () => void;
  /** Called after the modal transitions to the closed state. */
  onClose?: () => void;
}

// ---- Logic class ----

export class ModalLogic implements ComponentLogic<ModalState> {
  private store: Store<ModalState>;
  private closeOnOverlayClick: boolean;
  private closeOnEscape: boolean;
  private onOpen?: () => void;
  private onClose?: () => void;

  constructor(options: ModalOptions = {}) {
    const {
      initialOpen = false,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      onOpen,
      onClose,
    } = options;

    this.closeOnOverlayClick = closeOnOverlayClick;
    this.closeOnEscape = closeOnEscape;
    this.onOpen = onOpen;
    this.onClose = onClose;

    this.store = new Store<ModalState>({
      open: initialOpen,
      hasOpened: initialOpen,
    });
  }

  // ---- Read ----

  getState() {
    return this.store.getState();
  }

  subscribe(listener: (state: ModalState) => void) {
    return this.store.subscribe(listener);
  }

  // ---- Actions ----

  open(): void {
    const prev = this.store.getState();
    if (prev.open) return;

    this.store.setState({ open: true, hasOpened: true });
    this.onOpen?.();
  }

  close(): void {
    const prev = this.store.getState();
    if (!prev.open) return;

    this.store.setState((s) => ({ ...s, open: false }));
    this.onClose?.();
  }

  toggle(): void {
    if (this.store.getState().open) {
      this.close();
    } else {
      this.open();
    }
  }

  /** Call from the overlay/backdrop click handler. Respects `closeOnOverlayClick`. */
  handleOverlayClick(): void {
    if (this.closeOnOverlayClick) {
      this.close();
    }
  }

  /** Call from a keydown handler. Respects `closeOnEscape`. */
  handleKeyDown(event: { key: string }): void {
    if (this.closeOnEscape && event.key === "Escape") {
      this.close();
    }
  }

  destroy(): void {
    this.store.destroy();
  }
}
