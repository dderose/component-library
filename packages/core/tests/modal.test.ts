import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  ModalLogic,
  resetModalIdCounter,
  type ModalStatus,
} from "../src/components/modal";

function key(k: string): KeyboardEvent {
  return { key: k, preventDefault: vi.fn() } as unknown as KeyboardEvent;
}

beforeEach(() => {
  resetModalIdCounter();
});

describe("ModalLogic", () => {
  // ---- Initial state ----

  it("starts closed by default", () => {
    const modal = new ModalLogic();
    expect(modal.getState()).toEqual({
      status: "closed",
      open: false,
      hasOpened: false,
    });
  });

  it("starts open when initialOpen is true", () => {
    const modal = new ModalLogic({ initialOpen: true });
    expect(modal.getState()).toEqual({
      status: "open",
      open: true,
      hasOpened: true,
    });
  });

  // ---- ARIA ----

  it("generates unique ARIA IDs", () => {
    const a = new ModalLogic();
    const b = new ModalLogic();
    expect(a.aria.titleId).not.toBe(b.aria.titleId);
    expect(a.aria.dialog["aria-labelledby"]).not.toBe(b.aria.dialog["aria-labelledby"]);
  });

  it("has correct ARIA structure", () => {
    const modal = new ModalLogic();
    expect(modal.aria.overlay.role).toBe("presentation");
    expect(modal.aria.dialog.role).toBe("dialog");
    expect(modal.aria.dialog["aria-modal"]).toBe("true");
    expect(modal.aria.dialog.tabindex).toBe("-1");
    expect(modal.aria.dialog["aria-labelledby"]).toBe(modal.aria.titleId);
    expect(modal.aria.dialog["aria-describedby"]).toBe(modal.aria.descriptionId);
  });

  // ---- open / close lifecycle ----

  it("open transitions closed → opening → open", async () => {
    const modal = new ModalLogic();
    const statuses: ModalStatus[] = [];
    modal.subscribe((s) => statuses.push(s.status));

    modal.open();
    expect(modal.getState().status).toBe("opening");
    expect(modal.getState().open).toBe(true);
    expect(modal.getState().hasOpened).toBe(true);

    // Auto-advance via microtask
    await new Promise((r) => queueMicrotask(r));
    expect(modal.getState().status).toBe("open");
    expect(statuses).toEqual(["opening", "open"]);
  });

  it("close transitions open → closing → closed", async () => {
    const modal = new ModalLogic({ initialOpen: true });
    const statuses: ModalStatus[] = [];
    modal.subscribe((s) => statuses.push(s.status));

    modal.close();
    expect(modal.getState().status).toBe("closing");

    await new Promise((r) => queueMicrotask(r));
    expect(modal.getState().status).toBe("closed");
    expect(modal.getState().open).toBe(false);
    expect(statuses).toEqual(["closing", "closed"]);
  });

  it("open does nothing if not closed", () => {
    const modal = new ModalLogic({ initialOpen: true });
    const listener = vi.fn();
    modal.subscribe(listener);

    modal.open();
    expect(listener).not.toHaveBeenCalled();
  });

  it("close does nothing if already closed", () => {
    const modal = new ModalLogic();
    const listener = vi.fn();
    modal.subscribe(listener);

    modal.close();
    expect(listener).not.toHaveBeenCalled();
  });

  // ---- finishOpen / finishClose (manual animation control) ----

  it("finishOpen manually advances opening → open", () => {
    const modal = new ModalLogic();
    modal.open();
    expect(modal.getState().status).toBe("opening");

    modal.finishOpen();
    expect(modal.getState().status).toBe("open");
  });

  it("finishOpen does nothing if not in opening state", () => {
    const modal = new ModalLogic({ initialOpen: true });
    const listener = vi.fn();
    modal.subscribe(listener);

    modal.finishOpen();
    expect(listener).not.toHaveBeenCalled();
  });

  it("finishClose manually advances closing → closed", () => {
    const modal = new ModalLogic({ initialOpen: true });
    modal.close();
    expect(modal.getState().status).toBe("closing");

    modal.finishClose();
    expect(modal.getState().status).toBe("closed");
    expect(modal.getState().open).toBe(false);
  });

  it("finishClose does nothing if not in closing state", () => {
    const modal = new ModalLogic();
    const listener = vi.fn();
    modal.subscribe(listener);

    modal.finishClose();
    expect(listener).not.toHaveBeenCalled();
  });

  // ---- toggle ----

  it("toggle opens when closed", () => {
    const modal = new ModalLogic();
    modal.toggle();
    expect(modal.getState().status).toBe("opening");
  });

  it("toggle closes when open", () => {
    const modal = new ModalLogic({ initialOpen: true });
    modal.toggle();
    expect(modal.getState().status).toBe("closing");
  });

  // ---- callbacks ----

  it("calls onOpen when opening", () => {
    const onOpen = vi.fn();
    const modal = new ModalLogic({ onOpen });

    modal.open();
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when closing", () => {
    const onClose = vi.fn();
    const modal = new ModalLogic({ initialOpen: true, onClose });

    modal.close();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // ---- handleOverlayClick ----

  it("handleOverlayClick closes when closeOnOverlayClick is true (default)", () => {
    const modal = new ModalLogic({ initialOpen: true });
    modal.handleOverlayClick();
    expect(modal.getState().status).toBe("closing");
  });

  it("handleOverlayClick does nothing when closeOnOverlayClick is false", () => {
    const modal = new ModalLogic({ initialOpen: true, closeOnOverlayClick: false });
    const listener = vi.fn();
    modal.subscribe(listener);

    modal.handleOverlayClick();
    expect(listener).not.toHaveBeenCalled();
  });

  // ---- handleKeyDown ----

  it("Escape closes when closeOnEscape is true (default)", () => {
    const modal = new ModalLogic({ initialOpen: true });
    const e = key("Escape");
    modal.handleKeyDown(e);
    expect(modal.getState().status).toBe("closing");
    expect(e.preventDefault).toHaveBeenCalled();
  });

  it("Escape does nothing when closeOnEscape is false", () => {
    const modal = new ModalLogic({ initialOpen: true, closeOnEscape: false });
    const listener = vi.fn();
    modal.subscribe(listener);

    modal.handleKeyDown(key("Escape"));
    expect(listener).not.toHaveBeenCalled();
  });

  // ---- hasOpened persistence ----

  it("hasOpened stays true after close", async () => {
    const modal = new ModalLogic();
    modal.open();
    await new Promise((r) => queueMicrotask(r));
    modal.close();
    await new Promise((r) => queueMicrotask(r));

    expect(modal.getState().hasOpened).toBe(true);
    expect(modal.getState().open).toBe(false);
  });

  // ---- subscribe / destroy ----

  it("subscribe and destroy", () => {
    const modal = new ModalLogic();
    const listener = vi.fn();
    modal.subscribe(listener);

    modal.open();
    expect(listener).toHaveBeenCalledTimes(1);

    modal.destroy();
    // After destroy, should not notify
  });
});
