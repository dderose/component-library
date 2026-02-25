<script lang="ts">
  import { onMount } from "svelte";
  import { useLogic } from "@component-library/svelte";
  import { ModalLogic } from "@component-library/core";

  const logic = new ModalLogic({
    closeOnOverlayClick: true,
    closeOnEscape: true,
    scrollLock: true,
  });

  const state = useLogic(logic);
  const { aria } = logic;

  // Reference to the dialog panel for focus trapping.
  let dialogEl: HTMLDivElement | undefined;

  // Portal target — we append the modal to document.body so it escapes
  // any parent overflow:hidden or z-index stacking contexts.
  let portalTarget: HTMLDivElement | undefined;

  onMount(() => {
    portalTarget = document.createElement("div");
    portalTarget.setAttribute("data-modal-portal", "");
    document.body.appendChild(portalTarget);

    return () => {
      portalTarget?.remove();
    };
  });

  // When the dialog mounts, move focus into it.
  function handleDialogMount(node: HTMLDivElement) {
    dialogEl = node;
    logic.focusDialog(node);
  }

  // When overlay transition ends on close, finalize the close.
  function handleTransitionEnd(event: TransitionEvent) {
    if (
      event.propertyName === "opacity" &&
      state.current.status === "closing"
    ) {
      logic.finishClose();
    }
  }
</script>

<h2>Modal</h2>

<div class="demo">
  <button class="open-btn" onclick={() => logic.open()}>Open Modal</button>

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      status="{state.current.status}" | open={state.current.open} |
      hasOpened={state.current.hasOpened}
    </code>
  </div>

  <h3>Features</h3>
  <ul class="feature-list">
    <li><strong>Focus trap</strong> — Tab / Shift+Tab cycles through modal controls only</li>
    <li><strong>Focus restore</strong> — focus returns to the trigger button on close</li>
    <li><strong>Scroll lock</strong> — page body is locked while the modal is open</li>
    <li><strong>Escape to close</strong> — press Escape to dismiss</li>
    <li><strong>Overlay click</strong> — click the backdrop to dismiss</li>
    <li><strong>Portal</strong> — modal renders at document.body to escape stacking contexts</li>
    <li><strong>ARIA</strong> — role="dialog", aria-modal, aria-labelledby, aria-describedby</li>
    <li><strong>CSS transitions</strong> — fade in/out driven by status state machine</li>
  </ul>
</div>

{#if portalTarget && state.current.open}
  {@const status = state.current.status}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="overlay"
    class:overlay-entering={status === "opening"}
    class:overlay-open={status === "open"}
    class:overlay-leaving={status === "closing"}
    role={aria.overlay.role}
    onclick={() => logic.handleOverlayClick()}
    onkeydown={(e) => logic.handleKeyDown(e, dialogEl)}
    ontransitionend={handleTransitionEnd}
  >
    <div
      class="modal"
      class:modal-entering={status === "opening"}
      class:modal-open={status === "open"}
      class:modal-leaving={status === "closing"}
      role={aria.dialog.role}
      aria-modal={aria.dialog["aria-modal"]}
      aria-labelledby={aria.dialog["aria-labelledby"]}
      aria-describedby={aria.dialog["aria-describedby"]}
      tabindex={-1}
      use:handleDialogMount
      onclick={(e) => e.stopPropagation()}
    >
      <div class="modal-header">
        <h3 id={aria.titleId}>Example Modal</h3>
        <button
          class="close-btn"
          onclick={() => logic.close()}
          aria-label="Close modal"
        >
          ×
        </button>
      </div>
      <div class="modal-body" id={aria.descriptionId}>
        <p>
          This is a production-ready modal with focus trapping, scroll lock,
          portal rendering, ARIA attributes, and CSS transitions — all
          driven by <code>ModalLogic</code> from the core package.
        </p>
        <p>
          Try pressing <kbd>Tab</kbd> to see focus stay trapped inside.
          Press <kbd>Escape</kbd> or click the backdrop to dismiss.
        </p>
        <label class="demo-input-label" for="demo-modal-input">
          Test input (for focus trap)
        </label>
        <input
          id="demo-modal-input"
          type="text"
          class="demo-input"
          placeholder="Type here…"
        />
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick={() => logic.close()}>
          Cancel
        </button>
        <button class="btn-primary" onclick={() => logic.close()}>
          Confirm
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .feature-list {
    font-size: 0.85rem;
    line-height: 1.6;
    padding-left: 1.25rem;
  }

  .feature-list li + li {
    margin-top: 0.15rem;
  }

  .open-btn {
    align-self: flex-start;
    padding: 0.5rem 1rem;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius);
    cursor: pointer;
    font-size: 0.875rem;
  }
  .open-btn:hover {
    background: var(--color-primary-hover);
  }

  /* ---- Overlay ---- */

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
    transition: background 200ms ease;
  }
  .overlay-entering {
    background: rgba(0, 0, 0, 0);
  }
  .overlay-open {
    background: rgba(0, 0, 0, 0.4);
  }
  .overlay-leaving {
    background: rgba(0, 0, 0, 0);
  }

  /* ---- Modal panel ---- */

  .modal {
    background: var(--color-surface);
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 440px;
    overflow: hidden;
    outline: none;
    transform: scale(0.95);
    opacity: 0;
    transition: transform 200ms ease, opacity 200ms ease;
  }
  .modal-entering {
    transform: scale(0.95);
    opacity: 0;
  }
  .modal-open {
    transform: scale(1);
    opacity: 1;
  }
  .modal-leaving {
    transform: scale(0.95);
    opacity: 0;
  }

  /* ---- Header ---- */

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-border);
  }
  .modal-header h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0;
  }
  .close-btn {
    border: none;
    background: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0.25rem;
    line-height: 1;
    border-radius: var(--radius);
  }
  .close-btn:hover {
    color: var(--color-text);
    background: var(--color-bg);
  }
  .close-btn:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  /* ---- Body ---- */

  .modal-body {
    padding: 1.25rem;
    font-size: 0.875rem;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .demo-input-label {
    font-weight: 600;
    font-size: 0.8rem;
  }

  .demo-input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    font-size: 0.875rem;
  }
  .demo-input:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
  }

  kbd {
    padding: 0.1rem 0.35rem;
    font-size: 0.8rem;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 3px;
    font-family: inherit;
  }

  /* ---- Footer ---- */

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    border-top: 1px solid var(--color-border);
  }
  .btn-secondary {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    cursor: pointer;
    font-size: 0.8rem;
  }
  .btn-secondary:hover {
    background: var(--color-bg);
  }
  .btn-secondary:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
  .btn-primary {
    padding: 0.375rem 0.75rem;
    border: none;
    border-radius: var(--radius);
    background: var(--color-primary);
    color: white;
    cursor: pointer;
    font-size: 0.8rem;
  }
  .btn-primary:hover {
    background: var(--color-primary-hover);
  }
  .btn-primary:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }

  /* ---- State debug ---- */

  .state-debug {
    font-size: 0.75rem;
    color: var(--color-text-muted);
    background: var(--color-bg);
    padding: 0.5rem;
    border-radius: var(--radius);
  }
  .state-debug code {
    display: block;
    margin-top: 0.25rem;
  }
</style>
