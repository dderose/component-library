<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { RadioGroupLogic } from "@component-library/core";

  type Color = "red" | "green" | "blue";
  const options: { value: Color; label: string }[] = [
    { value: "red", label: "Red" },
    { value: "green", label: "Green" },
    { value: "blue", label: "Blue" },
  ];

  const required = () => ({
    name: "required",
    validate: (v: Color | null) => (v ? null : "Please select a color"),
  });

  const logic = new RadioGroupLogic<Color>({
    rules: [required()],
  });

  const state = useLogic(logic);
</script>

<h2>RadioGroup</h2>

<div class="demo">
  <fieldset>
    <legend>Favorite color</legend>
    {#each options as opt}
      <label class="radio-label">
        <input
          type="radio"
          name="color"
          value={opt.value}
          checked={state.current.value === opt.value}
          onchange={() => logic.setValue(opt.value)}
          onfocus={() => logic.focus()}
          onblur={() => logic.blur()}
        />
        {opt.label}
      </label>
    {/each}
  </fieldset>

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
      value={state.current.value ?? "null"} | touched={state.current.touched} |
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
  fieldset {
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }
  legend {
    font-weight: 600;
    font-size: 0.875rem;
    padding: 0 0.25rem;
  }
  .radio-label {
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
