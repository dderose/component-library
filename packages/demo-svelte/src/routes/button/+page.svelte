<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { ButtonLogic } from "@component-library/core";

  // ---- Default button ----
  const defaultLogic = new ButtonLogic({
    onClick: () => alert("Clicked!"),
  });
  const defaultState = useLogic(defaultLogic);

  // ---- Async / loading button ----
  let asyncResult = $state("");
  const asyncLogic = new ButtonLogic({
    onClick: async () => {
      asyncResult = "";
      await new Promise((r) => setTimeout(r, 2000));
      asyncResult = "Done! Data saved successfully.";
    },
  });
  const asyncState = useLogic(asyncLogic);

  // ---- Disabled button ----
  let disabledToggle = $state(true);
  const disabledLogic = new ButtonLogic({
    disabled: true,
    onClick: () => alert("This shouldn't fire"),
  });
  const disabledState = useLogic(disabledLogic);

  $effect(() => {
    disabledLogic.setDisabled(disabledToggle);
  });

  // ---- Pressed tracking button ----
  const pressedLogic = new ButtonLogic({
    onClick: () => {},
  });
  const pressedState = useLogic(pressedLogic);
</script>

<h2>Button</h2>

<div class="demo">
  <h3 class="demo-title">Default</h3>
  <p class="demo-description">Simple button with a click handler.</p>

  <div class="button-row">
    <button
      class="btn btn-primary"
      disabled={defaultLogic.isDisabled()}
      onclick={() => defaultLogic.press()}
      onfocus={() => defaultLogic.focus()}
      onblur={() => defaultLogic.blur()}
    >
      Click me
    </button>
  </div>

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      loading={defaultState.current.loading} |
      disabled={defaultState.current.disabled} |
      focused={defaultState.current.focused}
    </code>
  </div>
</div>

<div class="demo">
  <h3 class="demo-title">Async / Loading</h3>
  <p class="demo-description">
    Click handler returns a Promise. The button shows a loading state and ignores clicks until the promise settles. Uses <code>disableWhileLoading: true</code> (default).
  </p>

  <div class="button-row">
    <button
      class="btn btn-primary"
      class:loading={asyncState.current.loading}
      disabled={asyncLogic.isDisabled()}
      onclick={() => asyncLogic.press()}
      onfocus={() => asyncLogic.focus()}
      onblur={() => asyncLogic.blur()}
    >
      {#if asyncState.current.loading}
        <span class="spinner" aria-hidden="true"></span>
        Saving…
      {:else}
        Save changes
      {/if}
    </button>
  </div>

  {#if asyncResult}
    <div class="result-banner">{asyncResult}</div>
  {/if}

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      loading={asyncState.current.loading} |
      disabled={asyncState.current.disabled} |
      isDisabled()={asyncLogic.isDisabled()}
    </code>
  </div>
</div>

<div class="demo">
  <h3 class="demo-title">Disabled</h3>
  <p class="demo-description">
    Controlled via <code>setDisabled()</code>. Toggle the checkbox to enable/disable.
  </p>

  <div class="button-row">
    <button
      class="btn btn-primary"
      disabled={disabledLogic.isDisabled()}
      onclick={() => disabledLogic.press()}
    >
      Disabled button
    </button>

    <label class="toggle-label">
      <input type="checkbox" bind:checked={disabledToggle} />
      Disabled
    </label>
  </div>

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      disabled={disabledState.current.disabled} |
      isDisabled()={disabledLogic.isDisabled()}
    </code>
  </div>
</div>

<div class="demo">
  <h3 class="demo-title">Pressed tracking</h3>
  <p class="demo-description">
    Tracks <code>pressed</code> state between pointerdown and pointerup for custom active styles.
  </p>

  <div class="button-row">
    <button
      class="btn btn-primary"
      class:pressed={pressedState.current.pressed}
      disabled={pressedLogic.isDisabled()}
      onclick={() => pressedLogic.press()}
      onpointerdown={() => pressedLogic.pointerDown()}
      onpointerup={() => pressedLogic.pointerUp()}
      onpointerleave={() => pressedLogic.pointerUp()}
      onfocus={() => pressedLogic.focus()}
      onblur={() => pressedLogic.blur()}
    >
      Hold me down
    </button>
  </div>

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      pressed={pressedState.current.pressed} |
      focused={pressedState.current.focused}
    </code>
  </div>
</div>

<style>
  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  .demo-title {
    margin: 0;
  }
  .demo-description {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin: 0;
  }
  .demo-description code {
    font-size: 0.8rem;
    background: var(--color-bg);
    padding: 0.1rem 0.3rem;
    border-radius: 3px;
  }

  .button-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .btn {
    padding: 0.5rem 1.25rem;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 150ms, transform 100ms, box-shadow 150ms;
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
  }
  .btn:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
  }
  .btn-primary {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
  .btn-primary:hover:not(:disabled) {
    background: var(--color-primary-hover);
  }
  .btn-primary:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
  .btn-primary.loading {
    opacity: 0.8;
    cursor: wait;
  }
  .btn-primary.pressed {
    transform: scale(0.97);
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 600ms linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .toggle-label {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.85rem;
    cursor: pointer;
    user-select: none;
  }
  .toggle-label input {
    accent-color: var(--color-primary);
  }

  .result-banner {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: var(--radius);
    color: var(--color-success);
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
