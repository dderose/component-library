<script lang="ts">
  import { Modal } from "@component-library/svelte";

  let modalRef: ReturnType<typeof Modal.prototype.getLogic> | undefined;
  let modal: { getLogic: () => import("@component-library/core").ModalLogic };
</script>

<h2>Modal</h2>

<div class="demo">
  <button class="open-btn" onclick={() => modal?.getLogic().open()}>
    Open Modal
  </button>

  <h3>Simple usage</h3>
  <p class="description">
    The <code>&lt;Modal&gt;</code> component handles portal rendering, focus
    trapping, scroll lock, ARIA attributes, and CSS transitions automatically.
    Just provide your content.
  </p>

  <h3>Features</h3>
  <ul class="feature-list">
    <li><strong>Zero boilerplate</strong> — portal, focus trap, ARIA, and transitions are built in</li>
    <li><strong>Focus trap</strong> — Tab / Shift+Tab cycles through modal controls only</li>
    <li><strong>Focus restore</strong> — focus returns to the trigger button on close</li>
    <li><strong>Scroll lock</strong> — page body is locked while the modal is open</li>
    <li><strong>Escape to close</strong> — press Escape to dismiss</li>
    <li><strong>Overlay click</strong> — click the backdrop to dismiss</li>
    <li><strong>ARIA overrides</strong> — customize role, labelledby, describedby, or use aria-label</li>
    <li><strong>Configurable transitions</strong> — set duration or disable with <code>transitionDuration={'{0}'}</code></li>
  </ul>
</div>

<!-- Simple modal — all wiring is handled by the component -->
<Modal
  bind:this={modal}
  options={{ closeOnOverlayClick: true, closeOnEscape: true }}
  panelClass="demo-modal-panel"
>
  {#snippet children({ aria, close })}
    <div class="modal-header">
      <h3 id={aria.titleId}>Example Modal</h3>
      <button class="close-btn" onclick={close} aria-label="Close modal">×</button>
    </div>

    <div class="modal-body" id={aria.descriptionId}>
      <p>
        This modal is rendered through a portal, has focus trapping, scroll
        lock, and full ARIA support — all without any manual wiring.
      </p>
      <p>
        Try pressing <kbd>Tab</kbd> to see focus trapped inside.
        Press <kbd>Escape</kbd> or click the backdrop to dismiss.
      </p>
      <label class="demo-input-label" for="demo-input">
        Test input (for focus trap)
      </label>
      <input id="demo-input" type="text" class="demo-input" placeholder="Type here…" />
    </div>

    <div class="modal-footer">
      <button class="btn-secondary" onclick={close}>Cancel</button>
      <button class="btn-primary" onclick={close}>Confirm</button>
    </div>
  {/snippet}
</Modal>

<hr class="divider" />

<h3>With ARIA overrides</h3>
<p class="description">
  Use <code>ariaOverrides</code> to provide <code>aria-label</code> instead of
  <code>aria-labelledby</code>, change the role, or remove aria-describedby.
</p>

<pre class="code-example">{`<Modal
  ariaOverrides={{
    label: "Confirm deletion",
    describedby: false,
    role: "alertdialog",
  }}
>
  …
</Modal>`}</pre>

<style>
  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .description {
    font-size: 0.875rem;
    line-height: 1.5;
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

  .divider {
    border: none;
    border-top: 1px solid var(--color-border);
    margin: 1rem 0;
  }

  .code-example {
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 0.75rem 1rem;
    font-size: 0.8rem;
    line-height: 1.5;
    overflow-x: auto;
  }

  /* ---- Modal content styles ---- */

  :global(.demo-modal-panel) {
    background: white;
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
</style>
