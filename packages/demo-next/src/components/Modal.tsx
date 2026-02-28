"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from "react";
import {
  ModalLogic,
  modal as cls,
  useLogic,
  lockScroll,
  unlockScroll,
  trapFocus,
  type ModalOptions,
} from "@component-library/react";
import { createPortal } from "react-dom";

interface ModalProps {
  options?: ModalOptions;
  trigger: (props: { onClick: () => void; ref: React.RefObject<HTMLElement | null> }) => ReactNode;
  children: (api: {
    close: () => void;
    titleId: string;
    descriptionId: string;
  }) => ReactNode;
}

export function Modal({ options = {}, trigger, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [state, logic] = useLogic(
    () =>
      new ModalLogic({
        closeOnOverlayClick: true,
        closeOnEscape: true,
        ...options,
        onOpening: () => lockScroll(),
        onClosing: () => unlockScroll(),
      }),
  );

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  // Focus trap + escape key
  useEffect(() => {
    if (state.status !== "open") return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Focus first focusable element
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        trapFocus(e, dialog);
      }
      logic.handleKeyDown(e, dialog);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [state.status, logic]);

  // Restore focus on close
  useEffect(() => {
    if (state.status === "closed" && state.hasOpened) {
      triggerRef.current?.focus();
    }
  }, [state.status, state.hasOpened]);

  const close = useCallback(() => logic.close(), [logic]);

  // Determine transition classes
  const overlayClass = [
    cls.overlay,
    state.status === "opening" && "cl-modal-overlay--entering",
    state.status === "open" && "cl-modal-overlay--open",
    state.status === "closing" && "cl-modal-overlay--leaving",
  ]
    .filter(Boolean)
    .join(" ");

  const panelClass = [
    cls.panel,
    state.status === "opening" && "cl-modal-panel--entering",
    state.status === "open" && "cl-modal-panel--open",
    state.status === "closing" && "cl-modal-panel--leaving",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {trigger({ onClick: () => logic.open(), ref: triggerRef })}

      {mounted &&
        state.status !== "closed" &&
        createPortal(
          <div
            className={overlayClass}
            onClick={() => logic.handleOverlayClick()}
            role="presentation"
          >
            <div
              ref={dialogRef}
              className={panelClass}
              role="dialog"
              aria-modal="true"
              aria-labelledby={logic.aria.titleId}
              aria-describedby={logic.aria.descriptionId}
              tabIndex={-1}
              onClick={(e) => e.stopPropagation()}
              onTransitionEnd={() => {
                if (state.status === "opening") logic.finishOpen();
                if (state.status === "closing") logic.finishClose();
              }}
            >
              {children({
                close,
                titleId: logic.aria.titleId,
                descriptionId: logic.aria.descriptionId,
              })}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
