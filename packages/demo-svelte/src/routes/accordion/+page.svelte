<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { AccordionLogic } from "@component-library/core";
  import type { AccordionItem } from "@component-library/core";

  const items: (AccordionItem & { title: string; content: string })[] = [
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
      id: "disabled",
      title: "This item is disabled",
      content: "You should never see this.",
      disabled: true,
    },
    {
      id: "why",
      title: "Why headless?",
      content:
        "Headless components give you full control over markup and styling while reusing battle-tested logic. You get accessibility and state management without being locked into a design system.",
    },
  ];

  // ---- Single mode ----
  const singleLogic = new AccordionLogic({
    initialExpanded: ["what"],
    items,
    multiple: false,
    collapsible: true,
  });
  const singleState = useLogic(singleLogic);

  $effect(() => {
    const focusedId = singleState.current.focusedItemId;
    if (focusedId) {
      document.getElementById(singleLogic.getTriggerId(focusedId))?.focus();
    }
  });

  // ---- Multiple mode ----
  const multiLogic = new AccordionLogic({
    initialExpanded: ["what"],
    items,
    multiple: true,
    collapsible: true,
  });
  const multiState = useLogic(multiLogic);

  $effect(() => {
    const focusedId = multiState.current.focusedItemId;
    if (focusedId) {
      document.getElementById(multiLogic.getTriggerId(focusedId))?.focus();
    }
  });
</script>

<h2>Accordion</h2>

<!-- Single mode -->
<div class="demo">
  <h3 class="demo-title">Single mode <code>multiple: false</code></h3>
  <p class="demo-description">Only one item can be open at a time. Opening a new item collapses the previous one.</p>

  <div class="accordion" role="presentation">
    {#each items as item}
      {@const expanded = singleState.current.expandedItems.has(item.id)}
      {@const triggerAttrs = singleLogic.aria.triggerAttrs(item.id)}
      {@const panelAttrs = singleLogic.aria.panelAttrs(item.id)}

      <div class="accordion-item" class:disabled={item.disabled}>
        <h4 class="accordion-header">
          <button
            id={triggerAttrs.id}
            class="accordion-trigger"
            class:expanded
            aria-expanded={expanded}
            aria-controls={triggerAttrs["aria-controls"]}
            aria-disabled={item.disabled || undefined}
            disabled={item.disabled}
            onclick={() => singleLogic.toggle(item.id)}
            onkeydown={(e) => singleLogic.handleKeyDown(e, item.id)}
            onfocus={() => singleLogic.focusItem(item.id)}
          >
            <span>{item.title}</span>
            <span class="icon" aria-hidden="true">
              <svg
                class="chevron"
                class:rotated={expanded}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </button>
        </h4>

        <div
          id={panelAttrs.id}
          role={panelAttrs.role}
          aria-labelledby={panelAttrs["aria-labelledby"]}
          class="accordion-panel"
          class:expanded
        >
          <div class="accordion-content">
            <p>{item.content}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      expanded=[{[...singleState.current.expandedItems].join(", ")}] |
      focused={singleState.current.focusedItemId ?? "none"}
    </code>
  </div>
</div>

<!-- Multiple mode -->
<div class="demo">
  <h3 class="demo-title">Multiple mode <code>multiple: true</code></h3>
  <p class="demo-description">Multiple items can be open simultaneously. Expand All / Collapse All buttons work in this mode.</p>

  <div class="accordion" role="presentation">
    {#each items as item}
      {@const expanded = multiState.current.expandedItems.has(item.id)}
      {@const triggerAttrs = multiLogic.aria.triggerAttrs(item.id)}
      {@const panelAttrs = multiLogic.aria.panelAttrs(item.id)}

      <div class="accordion-item" class:disabled={item.disabled}>
        <h4 class="accordion-header">
          <button
            id={triggerAttrs.id}
            class="accordion-trigger"
            class:expanded
            aria-expanded={expanded}
            aria-controls={triggerAttrs["aria-controls"]}
            aria-disabled={item.disabled || undefined}
            disabled={item.disabled}
            onclick={() => multiLogic.toggle(item.id)}
            onkeydown={(e) => multiLogic.handleKeyDown(e, item.id)}
            onfocus={() => multiLogic.focusItem(item.id)}
          >
            <span>{item.title}</span>
            <span class="icon" aria-hidden="true">
              <svg
                class="chevron"
                class:rotated={expanded}
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </button>
        </h4>

        <div
          id={panelAttrs.id}
          role={panelAttrs.role}
          aria-labelledby={panelAttrs["aria-labelledby"]}
          class="accordion-panel"
          class:expanded
        >
          <div class="accordion-content">
            <p>{item.content}</p>
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div class="state-debug">
    <strong>State:</strong>
    <code>
      expanded=[{[...multiState.current.expandedItems].join(", ")}] |
      focused={multiState.current.focusedItemId ?? "none"}
    </code>
  </div>

  <div class="actions">
    <button onclick={() => multiLogic.expandAll()}>Expand All</button>
    <button onclick={() => multiLogic.collapseAll()}>Collapse All</button>
  </div>
</div>

<!-- Shared info -->
<div class="demo">
  <h3>Keyboard navigation</h3>
  <ul class="feature-list">
    <li><kbd>↓</kbd> / <kbd>↑</kbd> — move focus between triggers (wraps around)</li>
    <li><kbd>Home</kbd> / <kbd>End</kbd> — focus first / last trigger</li>
    <li><kbd>Enter</kbd> / <kbd>Space</kbd> — toggle expanded state</li>
    <li>Disabled items are skipped during keyboard navigation</li>
  </ul>

  <h3>ARIA</h3>
  <ul class="feature-list">
    <li>Triggers: <code>aria-expanded</code>, <code>aria-controls</code>, <code>aria-disabled</code></li>
    <li>Panels: <code>role="region"</code>, <code>aria-labelledby</code> → trigger</li>
    <li>Auto-generated unique IDs linking each trigger/panel pair</li>
  </ul>
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
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .demo-title code {
    font-size: 0.75rem;
    font-weight: 400;
    background: var(--color-bg);
    padding: 0.15rem 0.4rem;
    border-radius: 3px;
    color: var(--color-text-muted);
  }
  .demo-description {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin: 0;
  }
  .accordion {
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .accordion-item + .accordion-item {
    border-top: 1px solid var(--color-border);
  }
  .accordion-item.disabled {
    opacity: 0.5;
  }
  .accordion-header {
    margin: 0;
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
  .accordion-trigger:hover:not(:disabled) {
    background: var(--color-bg);
  }
  .accordion-trigger:focus-visible {
    outline: 2px solid var(--color-border-focus);
    outline-offset: -2px;
    z-index: 1;
    position: relative;
  }
  .accordion-trigger.expanded {
    background: var(--color-bg);
  }
  .accordion-trigger:disabled {
    cursor: not-allowed;
  }

  .chevron {
    transition: transform 200ms ease;
    color: var(--color-text-muted);
  }
  .chevron.rotated {
    transform: rotate(180deg);
  }

  .accordion-panel {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 200ms ease;
  }
  .accordion-panel.expanded {
    grid-template-rows: 1fr;
  }
  .accordion-content {
    overflow: hidden;
  }
  .accordion-content p {
    padding: 0.75rem 1rem;
    margin: 0;
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
