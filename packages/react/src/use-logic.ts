import type { ComponentLogic } from "@component-library/core";
import { useEffect, useId, useRef, useSyncExternalStore } from "react";

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
 */
export function useLogic<TState>(
  factory: () => ComponentLogic<TState>,
): [TState, ComponentLogic<TState>] {
  const logicRef = useRef<ComponentLogic<TState> | null>(null);

  if (logicRef.current === null) {
    logicRef.current = factory();
  }

  const logic = logicRef.current;

  // Stable function references for useSyncExternalStore. Since logic is the
  // same instance for the entire component lifecycle, these bound methods
  // have stable identity — no re-subscription every render.
  const stableRef = useRef({
    subscribe: (cb: () => void) => logic.subscribe(cb),
    getSnapshot: () => logic.getState(),
  });

  // Track whether the component is mounted. In strict mode React runs
  // mount → cleanup → mount. We only want to destroy on the *final*
  // unmount, not on strict mode's simulated cleanup. We use a ref
  // counter: increment on mount, decrement on cleanup. Only destroy
  // when the counter reaches 0 after a cleanup.
  const mountCount = useRef(0);

  useEffect(() => {
    mountCount.current++;

    return () => {
      mountCount.current--;

      // Use a microtask to check if this was a real unmount vs strict
      // mode cleanup. If strict mode re-mounts, mountCount will be
      // incremented again synchronously before this microtask runs.
      // If it's a real unmount, mountCount stays at 0.
      queueMicrotask(() => {
        if (mountCount.current === 0 && logicRef.current) {
          logicRef.current.destroy();
          logicRef.current = null;
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const state = useSyncExternalStore(
    stableRef.current.subscribe,
    stableRef.current.getSnapshot,
    stableRef.current.getSnapshot,
  );

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
  const reactId = useId();
  return reactId.replace(/:/g, "");
}
