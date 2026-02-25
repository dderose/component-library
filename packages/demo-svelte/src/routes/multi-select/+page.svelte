<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { MultiSelectLogic } from "@component-library/core";

  type Tag = "svelte" | "react" | "vue" | "angular" | "solid";
  const options: { value: Tag; label: string }[] = [
    { value: "svelte", label: "Svelte" },
    { value: "react", label: "React" },
    { value: "vue", label: "Vue" },
    { value: "angular", label: "Angular" },
    { value: "solid", label: "Solid" },
  ];

  const minSelected = (min: number) => ({
    name: "minSelected",
    validate: (v: Tag[]) =>
      v.length >= min ? null : `Select at least ${min} option(s)`,
  });

  const logic = new MultiSelectLogic<Tag>({
    rules: [minSelected(2)],
    validateOnChange: true,
  });

  const state = useLogic(logic);
</script>

<h2>MultiSelect</h2>

<div class="demo">
  <label class="label">Frameworks you've used</label>

  <div class="select-wrapper">
    <button class="select-trigger" onclick={() => logic.toggleMenu()}>
      {#if state.current.value.length > 0}
        <span class="tags">
          {#each state.current.value as tag}
            <span class="tag">
              {options.find((o) => o.value === tag)?.label}
              <button
                class="tag-remove"
                onclick={(e) => { e.stopPropagation(); logic.deselect(tag); }}
              >
                ×
              </button>
            </span>
          {/each}
        </span>
      {:else}
        <span class="placeholder">Select frameworks…</span>
      {/if}
      <span class="chevron">{state.current.open ? "▲" : "▼"}</span>
    </button>

    {#if state.current.open}
      <ul class="dropdown">
        {#each options as opt}
          <li>
            <button
              class="option"
              class:selected={state.current.value.includes(opt.value)}
              onclick={() => logic.toggleItem(opt.value)}
            >
              <span class="check">
                {state.current.value.includes(opt.value) ? "☑" : "☐"}
              </span>
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
      value=[{state.current.value.join(", ")}] | open={state.current.open} |
      touched={state.current.touched} | dirty={state.current.dirty} |
      valid={state.current.validation.valid}
    </code>
  </div>

  <div class="actions">
    <button onclick={() => logic.reset()}>Reset</button>
    <button onclick={() => logic.clear()}>Clear</button>
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
    gap: 0.5rem;
    min-height: 2.25rem;
  }
  .placeholder {
    color: var(--color-text-muted);
  }
  .chevron {
    font-size: 0.65rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.2rem;
    padding: 0.1rem 0.4rem;
    background: var(--color-bg);
    border-radius: 3px;
    font-size: 0.8rem;
  }
  .tag-remove {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.9rem;
    line-height: 1;
    padding: 0;
    color: var(--color-text-muted);
  }
  .tag-remove:hover {
    color: var(--color-error);
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .option:hover {
    background: var(--color-bg);
  }
  .option.selected {
    color: var(--color-primary);
  }
  .check {
    font-size: 0.9rem;
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
