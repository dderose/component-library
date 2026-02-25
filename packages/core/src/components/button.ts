import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";

// ---- State & Options ----

export interface ButtonState {
  /** Whether the button is in a loading state (e.g. async action in progress). */
  loading: boolean;
  /** Whether the button is disabled. */
  disabled: boolean;
  /** Whether the button is currently pressed (between pointerdown and pointerup). */
  pressed: boolean;
  /** Whether the button is focused. */
  focused: boolean;
}

export interface ButtonOptions {
  /** Initial disabled state. @default false */
  disabled?: boolean;
  /**
   * Click handler. If it returns a Promise, the button enters a loading
   * state until the promise settles (resolved or rejected).
   * While loading, subsequent clicks are ignored.
   */
  onClick?: () => void | Promise<void>;
  /**
   * If true, the button is disabled while loading. @default true
   */
  disableWhileLoading?: boolean;
}

// ---- Logic class ----

export class ButtonLogic implements ComponentLogic<ButtonState> {
  private store: Store<ButtonState>;
  private onClick?: () => void | Promise<void>;
  private disableWhileLoading: boolean;

  constructor(options: ButtonOptions = {}) {
    const {
      disabled = false,
      onClick,
      disableWhileLoading = true,
    } = options;

    this.onClick = onClick;
    this.disableWhileLoading = disableWhileLoading;

    this.store = new Store<ButtonState>({
      loading: false,
      disabled,
      pressed: false,
      focused: false,
    });
  }

  // ---- Read ----

  getState() {
    return this.store.getState();
  }

  subscribe(listener: (state: ButtonState) => void) {
    return this.store.subscribe(listener);
  }

  /** Whether the button should be treated as disabled (explicit or loading). */
  isDisabled(): boolean {
    const { disabled, loading } = this.store.getState();
    return disabled || (this.disableWhileLoading && loading);
  }

  // ---- Actions ----

  /**
   * Trigger the button's click handler.
   * If the handler returns a Promise, the button enters loading state
   * until it settles. Clicks are ignored while loading or disabled.
   */
  async press(): Promise<void> {
    if (this.isDisabled()) return;

    if (!this.onClick) return;

    const result = this.onClick();

    if (result instanceof Promise) {
      this.store.setState((prev) => ({ ...prev, loading: true }));
      try {
        await result;
      } finally {
        this.store.setState((prev) => ({ ...prev, loading: false }));
      }
    }
  }

  setDisabled(disabled: boolean): void {
    this.store.setState((prev) => ({ ...prev, disabled }));
  }

  setOnClick(handler: () => void | Promise<void>): void {
    this.onClick = handler;
  }

  focus(): void {
    this.store.setState((prev) => ({ ...prev, focused: true }));
  }

  blur(): void {
    this.store.setState((prev) => ({ ...prev, focused: false }));
  }

  pointerDown(): void {
    if (this.isDisabled()) return;
    this.store.setState((prev) => ({ ...prev, pressed: true }));
  }

  pointerUp(): void {
    this.store.setState((prev) => ({ ...prev, pressed: false }));
  }

  reset(): void {
    this.store.setState({
      loading: false,
      disabled: false,
      pressed: false,
      focused: false,
    });
  }

  destroy(): void {
    this.store.destroy();
  }
}
