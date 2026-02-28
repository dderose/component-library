import type { ComponentLogic } from "@component-library/core";
import { useCallback, useEffect, useId, useRef, useSyncExternalStore } from "react";

/**
 * Bridges any core ComponentLogic instance into React's reactivity system.
 *
 * Uses useSyncExternalStore for tear-free reads (concurrent-safe).
 * The third argument (getServerSnapshot) is required for SSR frameworks
 * like Next.js — without it, server rendering throws or returns undefined.
 *
 * Automatically destroys the logic instance on unmount.
 *
 * Usage:
 *   const [state, logic] = useLogic(() => new TextFieldLogic({ rules: [required()] }));
 *
 * The factory function ensures a single instance per component lifecycle.
 */
export function useLogic<TState>(
  factory: () => ComponentLogic<TState>,
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

  // These must be stable references — if subscribe changes identity every
  // render, useSyncExternalStore will unsubscribe/resubscribe in a loop.
  const subscribe = useCallback(
    (callback: () => void) => logic.subscribe(callback),
    [logic],
  );
  const getSnapshot = useCallback(() => logic.getState(), [logic]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return [state, logic];
}

/**
 * Returns a stable ID string suitable for passing as the `id` option to any
 * core Logic class. Uses React.useId() under the hood so the value is
 * identical on server and client, preventing hydration mismatches.
 *
 * Usage:
 *   const id = useStableId();
 *   const [state, logic] = useLogic(() => new AccordionLogic({ id, items }));
 */
export function useStableId(): string {
  // React's useId returns something like ":r0:" — strip the colons for
  // cleaner DOM ids and ARIA references.
  const reactId = useId();
  return reactId.replace(/:/g, "");
}
