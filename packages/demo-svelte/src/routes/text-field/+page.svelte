<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { TextFieldLogic } from "@component-library/core";

  // Inline validation rules matching the core API
  const required = () => ({
    name: "required",
    validate: (v: string) => (v.trim() ? null : "This field is required"),
  });
  const minLength = (min: number) => ({
    name: "minLength",
    validate: (v: string) =>
      v.length >= min ? null : `Must be at least ${min} characters`,
  });

  const logic = new TextFieldLogic({
    rules: [required(), minLength(3)],
    validateOnBlur: true,
    validateOnChange: false,
  });

  const state = useLogic(logic);
</script>

<h2>TextField</h2>

<div class="demo">
  <label for="demo-input">Username</label>
  <input
    id="demo-input"
    type="text"
    placeholder="Enter username"
    value={state.current.value}
    oninput={(e) => logic.setValue(e.currentTarget.value)}
    onfocus={() => logic.focus()}
    onblur={() => logic.blur()}
  />

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
      value="{state.current.value}" | touched={state.current.touched} |
      dirty={state.current.dirty} | focused={state.current.focused} |
      valid={state.current.validation.valid}
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
  label {
    font-weight: 600;
    font-size: 0.875rem;
  }
  input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    font-size: 0.875rem;
  }
  input:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
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
    word-break: break-all;
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
