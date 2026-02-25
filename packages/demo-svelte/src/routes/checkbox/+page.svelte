<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { CheckboxLogic } from "@component-library/core";

  const mustAccept = () => ({
    name: "mustAccept",
    validate: (v: boolean) => (v ? null : "You must accept the terms"),
  });

  const logic = new CheckboxLogic({
    rules: [mustAccept()],
  });

  const state = useLogic(logic);
</script>

<h2>Checkbox</h2>

<div class="demo">
  <label class="checkbox-label">
    <input
      type="checkbox"
      checked={state.current.checked}
      onchange={() => logic.toggle()}
      onfocus={() => logic.focus()}
      onblur={() => logic.blur()}
    />
    I accept the terms and conditions
  </label>

  {#if !state.current.validation.valid && state.current.touched}
    <ul class="errors">
      {#each state.current.validation.errors as err}
        <li>{err}</li>
      {/each}
    </ul>
  {/if}

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      checked={state.current.checked} | touched={state.current.touched} |
      dirty={state.current.dirty} | valid={state.current.validation.valid}
    </code>
  </div>

  <div class="actions">
    <button onclick={() => logic.reset()}>Reset</button>
    <button onclick={() => logic.validate()}>Validate</button>
  </div>
</div>

<style>
  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    cursor: pointer;
  }
  .errors {
    color: var(--color-error);
    font-size: 0.8rem;
    padding-left: 1rem;
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
  .actions {
    display: flex;
    gap: 0.5rem;
  }
  button {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    cursor: pointer;
    font-size: 0.8rem;
  }
  button:hover {
    background: var(--color-bg);
  }
</style>
