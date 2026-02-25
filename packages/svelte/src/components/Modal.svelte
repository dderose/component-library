<script lang="ts" module>
/**
 * ARIA overrides that consumers can provide to customize
 * the generated accessibility attributes.
 */
export interface ModalAriaOverrides {
  /** Override the dialog role. @default "dialog" */
  role?: string;
  /** Override or disable aria-labelledby. Set to `false` to remove. */
  labelledby?: string | false;
  /** Override or disable aria-describedby. Set to `false` to remove. */
  describedby?: string | false;
  /** Override aria-label (used instead of aria-labelledby when there's no visible title). */
  label?: string;
}
</script>

<script lang="ts">
  import { onDestroy } from "svelte";
  import { ModalLogic } from "@component-library/core";
  import { useLogic } from "../use-logic.svelte";
  import { portal } from "../actions/portal.ts";
  import { focusTrap } from "../actions/focus-trap.ts";

  interface Props {
    /** Core ModalLogic options. */
    options?: ModalOptions;
    /** ARIA attribute overrides. */
    ariaOverrides?: ModalAriaOverrides;
    /**
     * Transition duration in ms. Set to 0 to disable transitions.
     * When > 0, the component uses CSS transition classes and calls
     * finishOpen/finishClose at transition boundaries.
     * @default 200
     */
    transitionDuration?: number;
    /** Additional CSS class for the overlay. */
    overlayClass?: string;
    /** Additional CSS class for the dialog panel. */
    panelClass?: string;
    /** Snippet for the modal content. Receives `logic` and `aria` as context. */
    children: import("svelte").Snippet<[{
      logic: ModalLogic;
      aria: { titleId: string; descriptionId: string };
      close: () => void;
    }]>;
  }

  let {
    options = {},
    ariaOverrides = {},
    transitionDuration = 200,
    overlayClass = "",
    panelClass = "",
    children,
  }: Props = $props();

  // ---- Logic instance ----

  const logic = new ModalLogic(options);
  const state = useLogic(logic);
  const baseAria = logic.aria;

  // ---- Computed ARIA attributes ----

  const dialogRole = $derived(ariaOverrides.role ?? baseAria.dialog.role);

  const ariaLabelledBy = $derived(
    ariaOverrides.labelledby === false
      ? undefined
      : ariaOverrides.label
        ? undefined
        : (ariaOverrides.labelledby ?? baseAria.dialog["aria-labelledby"])
  );

  const ariaDescribedBy = $derived(
    ariaOverrides.describedby === false
      ? undefined
      : (ariaOverrides.describedby ?? baseAria.dialog["aria-describedby"])
  );

  const ariaLabel = $derived(ariaOverrides.label ?? undefined);

  // ---- Transition handling ----

  const hasTransition = transitionDuration > 0;

  // For transitions: after mount in "opening", request animation frame
  // to trigger CSS transition, then use transitionend to advance state.
  // For no-transition: finishOpen/finishClose happen automatically via microtask.

  function handleTransitionEnd(event: TransitionEvent) {
    // Only respond to the overlay's own transitions, not bubbled children.
    if (event.target !== event.currentTarget) return;

    const { status } = state.current;
    if (status === "closing") {
      logic.finishClose();
    }
  }

  // When transitions are enabled, we need to prevent the microtask
  // auto-advance and let CSS drive the timing. We do this by calling
  // finishOpen() in a rAF after the "opening" state is set, giving
  // the browser time to apply the initial CSS state before transitioning.
  $effect(() => {
    if (!hasTransition) return;

    const { status } = state.current;

    if (status === "opening") {
      // Double rAF ensures the browser has painted the "opening" state
      // before we transition to "open".
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          logic.finishOpen();
        });
      });
    }
  });

  // Expose the logic instance so parent components can call open/close/toggle.
  export function getLogic(): ModalLogic {
    return logic;
  }
</script>

{#if state.current.open}
  {@const status = state.current.status}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="cl-modal-overlay {overlayClass}"
    class:cl-modal-overlay--entering={status === "opening"}
    class:cl-modal-overlay--open={status === "open"}
    class:cl-modal-overlay--leaving={status === "closing"}
    style:transition-duration="{transitionDuration}ms"
    role={baseAria.overlay.role}
    onclick={() => logic.handleOverlayClick()}
    ontransitionend={hasTransition ? handleTransitionEnd : undefined}
    use:portal
  >
    <div
      class="cl-modal-panel {panelClass}"
      class:cl-modal-panel--entering={status === "opening"}
      class:cl-modal-panel--open={status === "open"}
      class:cl-modal-panel--leaving={status === "closing"}
      style:transition-duration="{transitionDuration}ms"
      role={dialogRole}
      aria-modal="true"
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
      aria-label={ariaLabel}
      tabindex={-1}
      onclick={(e) => e.stopPropagation()}
      use:focusTrap={logic}
    >
      {@render children({
        logic,
        aria: {
          titleId: baseAria.titleId,
          descriptionId: baseAria.descriptionId,
        },
        close: () => logic.close(),
      })}
    </div>
  </div>
{/if}

<style>
  /* ---- Overlay ---- */

  .cl-modal-overlay {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    background: rgba(0, 0, 0, 0);
    transition-property: background;
    transition-timing-function: ease;
  }

  .cl-modal-overlay--entering {
    background: rgba(0, 0, 0, 0);
  }

  .cl-modal-overlay--open {
    background: rgba(0, 0, 0, 0.4);
  }

  .cl-modal-overlay--leaving {
    background: rgba(0, 0, 0, 0);
  }

  /* ---- Panel ---- */

  .cl-modal-panel {
    outline: none;
    opacity: 0;
    transform: scale(0.95);
    transition-property: opacity, transform;
    transition-timing-function: ease;
  }

  .cl-modal-panel--entering {
    opacity: 0;
    transform: scale(0.95);
  }

  .cl-modal-panel--open {
    opacity: 1;
    transform: scale(1);
  }

  .cl-modal-panel--leaving {
    opacity: 0;
    transform: scale(0.95);
  }
</style>
