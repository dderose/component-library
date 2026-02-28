"use client";

import {
  ButtonLogic,
  button as cls,
  useLogic,
  type ButtonOptions,
} from "@component-library/react";
import type { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  options?: ButtonOptions;
}

export function Button({
  children,
  variant = "primary",
  options = {},
}: ButtonProps) {
  const [state, logic] = useLogic(() => new ButtonLogic(options));

  return (
    <button
      className={cls.root(state, variant)}
      disabled={logic.isDisabled()}
      onClick={() => logic.press()}
      onPointerDown={() => logic.pointerDown()}
      onPointerUp={() => logic.pointerUp()}
      onPointerLeave={() => logic.pointerUp()}
      onFocus={() => logic.focus()}
      onBlur={() => logic.blur()}
    >
      {state.loading && (
        <span className={cls.spinner} aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

/**
 * Convenience hook: returns [state, logic] for headless button usage.
 */
export function useButtonLogic(options: ButtonOptions = {}) {
  return useLogic(() => new ButtonLogic(options));
}
