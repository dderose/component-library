"use client";

import { Accordion } from "@/components/Accordion";

const items = [
  {
    id: "what",
    title: "What is this library?",
    content:
      "A headless, framework-agnostic component library. Business logic lives in pure TypeScript, with thin adapters for Svelte and React.",
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

export default function AccordionPage() {
  return (
    <>
      <h2>Accordion</h2>

      <div className="demo-section">
        <h3 className="demo-title">
          Single mode <code>multiple: false</code>
        </h3>
        <p className="demo-description">
          Only one item open at a time. Opening a new item collapses the
          previous one.
        </p>

        <Accordion
          items={items}
          options={{
            initialExpanded: ["what"],
            multiple: false,
            collapsible: true,
          }}
        />
      </div>

      <div className="demo-section">
        <h3 className="demo-title">
          Multiple mode <code>multiple: true</code>
        </h3>
        <p className="demo-description">
          Multiple items can be open simultaneously.
        </p>

        <Accordion
          items={items}
          options={{
            initialExpanded: ["what", "how"],
            multiple: true,
            collapsible: true,
          }}
        />
      </div>

      <div className="demo-section">
        <h3>Keyboard navigation</h3>
        <p className="demo-description">
          <kbd>↓</kbd>/<kbd>↑</kbd> move focus, <kbd>Home</kbd>/<kbd>End</kbd>{" "}
          jump to first/last, <kbd>Enter</kbd>/<kbd>Space</kbd> toggle. Disabled
          items are skipped.
        </p>
      </div>
    </>
  );
}
