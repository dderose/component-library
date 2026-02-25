<script lang="ts">
  import { useLogic, clickOutside, portal } from "@component-library/svelte";
  import { MultiSelectLogic } from "@component-library/core";
  import type { MultiSelectOption } from "@component-library/core";

  type Tag = "svelte" | "react" | "vue" | "angular" | "solid";
  const frameworks: MultiSelectOption<Tag>[] = [
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
    options: frameworks,
    rules: [minSelected(2)],
    validateOnChange: true,
  });

  const state = useLogic(logic);
  const { aria } = logic;

  function getLabelForValue(value: Tag): string {
    return frameworks.find((o) => o.value === value)?.label ?? value;
  }
</script>

<h2>MultiSelect</h2>

<div class="demo">
  <label class="label" id={aria.labelId}>Frameworks you've used</label>

  <div
    class="select-wrapper"
    use:clickOutside={{ handler: () => logic.closeMenu(), enabled: state.current.open }}
  >
    <button
      class="select-trigger"
      role={aria.trigger.role}
      aria-haspopup={aria.trigger["aria-haspopup"]}
      aria-expanded={state.current.open}
      aria-controls={aria.trigger["aria-controls"]}
      aria-activedescendant={state.current.open && state.current.highlightedIndex >= 0
        ? aria.optionId(state.current.highlightedIndex)
        : undefined}
      aria-labelledby={aria.labelId}
      onclick={() => logic.toggleMenu()}
      onkeydown={(e) => logic.handleKeyDown(e)}
      onfocus={() => logic.focus()}
      onblur={() => logic.blur()}
    >
      {#if state.current.value.length > 0}
        <span class="tags">
          {#each state.current.value as tag}
            <span class="tag">
              {getLabelForValue(tag)}
              <button
                class="tag-remove"
                tabindex={-1}
                aria-label="Remove {getLabelForValue(tag)}"
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
      <span class="chevron" aria-hidden="true">{state.current.open ? "▲" : "▼"}</span>
    </button>

    {#if state.current.open}
      <ul
        class="dropdown"
        role={aria.listbox.role}
        id={aria.listbox.id}
        aria-multiselectable="true"
        aria-labelledby={aria.labelId}
        use:portal
      >
        {#each frameworks as opt, i}
          <li
            id={aria.optionId(i)}
            role="option"
            aria-selected={state.current.value.includes(opt.value)}
            aria-disabled={opt.disabled ?? false}
            class="option"
            class:highlighted={state.current.highlightedIndex === i}
            class:selected={state.current.value.includes(opt.value)}
            onmouseenter={() => logic.highlightIndex(i)}
            onclick={() => logic.toggleItem(opt.value)}
          >
            <span class="check" aria-hidden="true">
              {state.current.value.includes(opt.value) ? "☑" : "☐"}
            </span>
            {opt.label}
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  {#if !state.current.validation.valid && state.current.touched}
    <ul class="errors" role="alert">
      {#each state.current.validation.errors as err}
        <li>{err}</li>
      {/each}
    </ul>
  {/if}

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      value=[{state.current.value.join(", ")}] | open={state.current.open} |
      highlighted={state.current.highlightedIndex} |
      touched={state.current.touched} | valid={state.current.validation.valid}
    </code>
  </div>

  <h3>Keyboard navigation</h3>
  <ul class="feature-list">
    <li><kbd>↓</kbd> / <kbd>↑</kbd> — move highlight (opens menu if closed)</li>
    <li><kbd>Enter</kbd> / <kbd>Space</kbd> — toggle highlighted option or open menu</li>
    <li><kbd>Escape</kbd> — close menu</li>
    <li><kbd>Home</kbd> / <kbd>End</kbd> — jump to first / last option</li>
    <li><kbd>Backspace</kbd> — remove last selected item (when menu is closed)</li>
    <li><kbd>Tab</kbd> — close menu and move focus</li>
  </ul>

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
  .select-trigger:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: 2px;
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
    padding: 0.4rem 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .option:hover,
  .option.highlighted {
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
  .feature-list {
    font-size: 0.85rem;
    line-height: 1.6;
    padding-left: 1.25rem;
  }
  .feature-list li + li {
    margin-top: 0.1rem;
  }
  kbd {
    padding: 0.1rem 0.35rem;
    font-size: 0.8rem;
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: 3px;
    font-family: inherit;
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
