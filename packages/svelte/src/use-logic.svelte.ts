import type { ComponentLogic } from "@component-library/core";
import { onDestroy } from "svelte";

/**
 * Bridges any core ComponentLogic instance into Svelte's reactivity system.
 *
 * Usage in a Svelte 5 component:
 *   const state = useLogic(new TextFieldLogic({ rules: [required()] }));
 *   // state is a reactive $state object that auto-updates
 *
 * Automatically unsubscribes + destroys on component unmount.
 */
export function useLogic<TState>(logic: ComponentLogic<TState>): { current: TState } {
  let current = $state(logic.getState());

  const unsubscribe = logic.subscribe((next) => {
    current = next;
  });

  onDestroy(() => {
    unsubscribe();
    logic.destroy();
  });

  return {
    get current() {
      return current;
    },
  };
}
