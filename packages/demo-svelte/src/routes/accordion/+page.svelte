<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { AccordionLogic } from "@component-library/core";

  const items = [
    {
      id: "what",
      title: "What is this library?",
      content:
        "A headless, framework-agnostic component library. Business logic lives in pure TypeScript, with thin adapters for Svelte and React Native.",
    },
    {
      id: "how",
      title: "How does it work?",
      content:
        "Each component has a Logic class in core that manages state via an observable Store. Framework packages subscribe to that store using their native reactivity primitives.",
    },
    {
      id: "why",
      title: "Why headless?",
      content:
        "Headless components give you full control over markup and styling while reusing battle-tested logic. You get accessibility and state management without being locked into a design system.",
    },
  ];

  const logic = new AccordionLogic({
    initialExpanded: ["what"],
    multiple: false,
    collapsible: true,
  });

  const state = useLogic(logic);
</script>

<h2>Accordion</h2>

<div class="demo">
  <div class="accordion">
    {#each items as item}
      <div class="accordion-item">
        <button
          class="accordion-trigger"
          class:expanded={state.current.expandedItems.has(item.id)}
          onclick={() => logic.toggle(item.id)}
        >
          <span>{item.title}</span>
          <span class="icon">
            {state.current.expandedItems.has(item.id) ? "−" : "+"}
          </span>
        </button>
        {#if state.current.expandedItems.has(item.id)}
          <div class="accordion-content">
            <p>{item.content}</p>
          </div>
        {/if}
      </div>
    {/each}
  </div>

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      expanded=[{[...state.current.expandedItems].join(", ")}]
    </code>
  </div>

  <div class="actions">
    <button onclick={() => logic.expandAll(items.map((i) => i.id))}>
      Expand All
    </button>
    <button onclick={() => logic.collapseAll()}>Collapse All</button>
  </div>
</div>

<style>
  .demo {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .accordion {
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .accordion-item + .accordion-item {
    border-top: 1px solid var(--color-border);
  }
  .accordion-trigger {
    width: 100%;
    padding: 0.75rem 1rem;
    border: none;
    background: var(--color-surface);
    font-size: 0.875rem;
    font-weight: 600;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .accordion-trigger:hover {
    background: var(--color-bg);
  }
  .accordion-trigger.expanded {
    background: var(--color-bg);
  }
  .icon {
    font-size: 1rem;
    color: var(--color-text-muted);
  }
  .accordion-content {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    line-height: 1.5;
    border-top: 1px solid var(--color-border);
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
