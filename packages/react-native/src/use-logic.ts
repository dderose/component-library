import { useEffect, useRef, useSyncExternalStore } from "react";
import type { ComponentLogic } from "@component-library/core";

/**
 * Bridges any core ComponentLogic instance into React's reactivity system.
 *
 * Uses useSyncExternalStore for tear-free reads (concurrent-safe).
 * Automatically destroys the logic instance on unmount.
 *
 * Usage:
 *   const [state, logic] = useLogic(() => new TextFieldLogic({ rules: [required()] }));
 *
 * The factory function ensures a single instance per component lifecycle.
 */
export function useLogic<TState>(
  factory: () => ComponentLogic<TState>
): [TState, ComponentLogic<TState>] {
  const logicRef = useRef<ComponentLogic<TState> | null>(null);

  if (logicRef.current === null) {
    logicRef.current = factory();
  }

  const logic = logicRef.current;

  useEffect(() => {
    return () => {
      logic.destroy();
      logicRef.current = null;
    };
  }, [logic]);

  const state = useSyncExternalStore(
    (callback) => logic.subscribe(callback),
    () => logic.getState()
  );

  return [state, logic];
}
