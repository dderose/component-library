<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { ModalLogic } from "@component-library/core";

  const logic = new ModalLogic({
    closeOnOverlayClick: true,
    closeOnEscape: true,
  });

  const state = useLogic(logic);
</script>

<svelte:window onkeydown={(e) => logic.handleKeyDown(e)} />

<h2>Modal</h2>

<div class="demo">
  <button class="open-btn" onclick={() => logic.open()}>Open Modal</button>

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      open={state.current.open} | hasOpened={state.current.hasOpened}
    </code>
  </div>
</div>

{#if state.current.open}
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div class="overlay" onclick={() => logic.handleOverlayClick()}>
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="modal" onclick={(e) => e.stopPropagation()}>
      <div class="modal-header">
        <h3>Example Modal</h3>
        <button class="close-btn" onclick={() => logic.close()}>×</button>
      </div>
      <div class="modal-body">
        <p>
          This modal is powered by <code>ModalLogic</code> from the core
          package. It supports closing via overlay click, the Escape key, or the
          close button.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick={() => logic.close()}>Cancel</button>
        <button class="btn-primary" onclick={() => logic.close()}>Confirm</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }
  .modal {
    background: var(--color-surface);
    border-radius: 8px;
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 440px;
    overflow: hidden;
  }
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
  }
  .close-btn {
    border: none;
    background: none;
    font-size: 1.25rem;
    cursor: pointer;
    color: var(--color-text-muted);
    padding: 0;
    line-height: 1;
  }
  .close-btn:hover {
    color: var(--color-text);
  }
  .modal-body {
    padding: 1.25rem;
    font-size: 0.875rem;
    line-height: 1.5;
  }
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
