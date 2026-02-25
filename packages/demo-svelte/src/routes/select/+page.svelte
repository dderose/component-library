<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { SelectLogic } from "@component-library/core";

  type Fruit = "apple" | "banana" | "cherry" | "mango";
  const options: { value: Fruit; label: string }[] = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
    { value: "mango", label: "Mango" },
  ];

  const required = () => ({
    name: "required",
    validate: (v: Fruit | null) => (v ? null : "Please select a fruit"),
  });

  const logic = new SelectLogic<Fruit>({
    rules: [required()],
    validateOnBlur: true,
    validateOnChange: false,
  });

  const state = useLogic(logic);

  function handleSelect(value: Fruit) {
    logic.setValue(value);
  }
</script>

<h2>Select</h2>

<div class="demo">
  <label class="label">Favorite fruit</label>

  <div class="select-wrapper">
    <button class="select-trigger" onclick={() => logic.toggleMenu()}>
      {#if state.current.value}
        {options.find((o) => o.value === state.current.value)?.label}
      {:else}
        <span class="placeholder">Choose a fruit…</span>
      {/if}
      <span class="chevron">{state.current.open ? "▲" : "▼"}</span>
    </button>

    {#if state.current.open}
      <ul class="dropdown">
        {#each options as opt}
          <li>
            <button
              class="option"
              class:selected={state.current.value === opt.value}
              onclick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

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
      value={state.current.value ?? "null"} | open={state.current.open} |
      touched={state.current.touched} | dirty={state.current.dirty} |
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
  .label {
    font-weight: 600;
    font-size: 0.875rem;
  }
  .select-wrapper {
    position: relative;
    width: 100%;
  }
  .select-trigger {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .select-trigger:hover {
    border-color: var(--color-text-muted);
  }
  .placeholder {
    color: var(--color-text-muted);
  }
  .chevron {
    font-size: 0.65rem;
    color: var(--color-text-muted);
  }
  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    list-style: none;
    padding: 0.25rem 0;
    margin: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    z-index: 10;
  }
  .option {
    width: 100%;
    padding: 0.4rem 0.75rem;
    border: none;
    background: none;
    font-size: 0.875rem;
    text-align: left;
    cursor: pointer;
  }
  .option:hover {
    background: var(--color-bg);
  }
  .option.selected {
    color: var(--color-primary);
    font-weight: 600;
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
  .actions button {
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    cursor: pointer;
    font-size: 0.8rem;
  }
  .actions button:hover {
    background: var(--color-bg);
  }
</style>
