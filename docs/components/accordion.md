# Accordion

A headless accordion with keyboard navigation, ARIA attributes, focus management, animated expand/collapse support, and disabled items.

## Features

- **Keyboard navigation** — Arrow Up/Down between triggers (wraps), Home/End for first/last, Enter/Space to toggle, disabled items skipped
- **ARIA** — `aria-expanded` and `aria-controls` on triggers, `role="region"` with `aria-labelledby` on panels, auto-generated unique IDs
- **Focus management** — `focusedItemId` in state, `getTriggerId()` for programmatic DOM focus
- **Modes** — single or multiple expanded items, optionally non-collapsible (one must stay open)
- **Disabled items** — respected in toggle, expand, collapse, and keyboard navigation
- **Animation-friendly** — panels always rendered in DOM (use CSS `grid-template-rows` for smooth expand/collapse)

## Quick start

### Headless (core only)

```ts
import { AccordionLogic } from "@component-library/core";
import type { AccordionItem } from "@component-library/core";

const items: AccordionItem[] = [
  { id: "intro" },
  { id: "details" },
  { id: "disabled-item", disabled: true },
];

const accordion = new AccordionLogic({
  items,
  initialExpanded: ["intro"],
  multiple: false,
  collapsible: true,
});

accordion.toggle("details");   // expands "details", collapses "intro"
accordion.isExpanded("intro");  // false
accordion.expandAll();          // no-op (multiple: false)
```

### Svelte 5

```svelte
<script lang="ts">
  import { useLogic } from "@component-library/svelte";
  import { AccordionLogic } from "@component-library/core";

  const items = [
    { id: "a", title: "Section A", content: "Content A" },
    { id: "b", title: "Section B", content: "Content B" },
  ];

  const logic = new AccordionLogic({
    items,
    initialExpanded: ["a"],
  });
  const state = useLogic(logic);

  // Drive DOM focus when keyboard nav changes focusedItemId
  $effect(() => {
    const focusedId = state.current.focusedItemId;
    if (focusedId) {
      document.getElementById(logic.getTriggerId(focusedId))?.focus();
    }
  });
</script>

{#each items as item}
  {@const expanded = state.current.expandedItems.has(item.id)}
  {@const triggerAttrs = logic.aria.triggerAttrs(item.id)}
  {@const panelAttrs = logic.aria.panelAttrs(item.id)}

  <h3>
    <button
      id={triggerAttrs.id}
      aria-expanded={expanded}
      aria-controls={triggerAttrs["aria-controls"]}
      onclick={() => logic.toggle(item.id)}
      onkeydown={(e) => logic.handleKeyDown(e, item.id)}
    >
      {item.title}
    </button>
  </h3>

  <!-- Always render panel for CSS animation; use grid-template-rows: 0fr/1fr -->
  <div
    id={panelAttrs.id}
    role={panelAttrs.role}
    aria-labelledby={panelAttrs["aria-labelledby"]}
    class:expanded
  >
    <div style="overflow: hidden">
      <p>{item.content}</p>
    </div>
  </div>
{/each}
```

**Animated expand/collapse CSS:**

```css
.panel {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 200ms ease;
}
.panel.expanded {
  grid-template-rows: 1fr;
}
.panel > div {
  overflow: hidden;
}
```

## API

### `AccordionItem`

| Property | Type | Description |
|---|---|---|
| `id` | `string` | Unique item identifier |
| `disabled` | `boolean?` | If `true`, item can't be toggled and is skipped by keyboard nav |

### `AccordionOptions`

| Property | Type | Default | Description |
|---|---|---|---|
| `items` | `AccordionItem[]` | `[]` | Registered items with IDs and disabled state |
| `initialExpanded` | `string[]` | `[]` | Item IDs expanded on mount |
| `multiple` | `boolean` | `false` | Allow multiple items open at once |
| `collapsible` | `boolean` | `true` | Allow collapsing all items (when `false`, one must stay open) |
| `onChange` | `(expandedItems: Set<string>) => void` | — | Called when expanded items change |

### `AccordionState`

| Property | Type | Description |
|---|---|---|
| `expandedItems` | `Set<string>` | IDs of currently expanded items |
| `focusedItemId` | `string \| null` | ID of the item whose trigger has keyboard focus |

### `AccordionAria`

Auto-generated ARIA attribute helpers. Access via `logic.aria`.

| Property | Description |
|---|---|
| `triggerAttrs(itemId)` | Returns `{ id, "aria-expanded", "aria-controls", "aria-disabled"? }` for the trigger button |
| `panelAttrs(itemId)` | Returns `{ id, role: "region", "aria-labelledby" }` for the content panel |

### Methods

| Method | Description |
|---|---|
| `toggle(itemId)` | Toggle an item's expanded state. Respects disabled and collapsible. |
| `expand(itemId)` | Expand an item. In single mode, collapses others. |
| `collapse(itemId)` | Collapse an item. Blocked if non-collapsible and it's the last open item. |
| `expandAll()` | Expand all enabled items. No-op if `multiple: false`. |
| `collapseAll()` | Collapse all items. No-op if `collapsible: false`. |
| `isExpanded(itemId)` | Check if an item is expanded |
| `focusItem(itemId)` | Set the focused item (for keyboard nav) |
| `clearFocus()` | Clear the focused item |
| `handleKeyDown(event, itemId)` | Keyboard handler — attach to each trigger's `keydown` event |
| `getTriggerId(itemId)` | Get the DOM element ID for a trigger (for programmatic focus) |
| `setItems(items)` | Update the item list dynamically |
| `getItems()` | Get current items |
| `getState()` | Get current state snapshot |
| `subscribe(listener)` | Subscribe to state changes. Returns unsubscribe function. |
| `destroy()` | Clean up subscriptions |

### Keyboard shortcuts

| Key | Action |
|---|---|
| `ArrowDown` | Focus next trigger (wraps to first) |
| `ArrowUp` | Focus previous trigger (wraps to last) |
| `Home` | Focus first trigger |
| `End` | Focus last trigger |
| `Enter` / `Space` | Toggle the focused item |

Disabled items are skipped during keyboard navigation.
