"use client";

import { MultiSelect } from "@/components/MultiSelect";
import type { ValidationRule } from "@component-library/react";

const frameworks = [
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "solid", label: "Solid" },
] as const;

type Tag = (typeof frameworks)[number]["value"];

const minSelected = (min: number): ValidationRule<Tag[]> => ({
  name: "minSelected",
  validate: (v) =>
    v.length >= min ? null : `Select at least ${min} option(s)`,
});

export default function MultiSelectPage() {
  return (
    <>
      <h2>MultiSelect</h2>

      <div className="demo-section">
        <h3 className="demo-title">
          With validation <code>minSelected(2)</code>
        </h3>
        <p className="demo-description">
          <code>MultiSelectLogic</code> manages multi-selection with keyboard
          navigation, tag removal, and validation — all headless. The React
          wrapper wires DOM events and uses <code>cl-*</code> class names from{" "}
          <code>@component-library/css</code>.
        </p>

        <MultiSelect<Tag>
          label="Frameworks you've used"
          placeholder="Select frameworks…"
          options={[...frameworks]}
          selectOptions={{
            rules: [minSelected(2)],
            validateOnChange: true,
          }}
        />
      </div>

      <div className="demo-section">
        <h3 className="demo-title">
          Pre-selected <code>initialValue</code>
        </h3>
        <p className="demo-description">
          Starts with items already selected.
        </p>

        <MultiSelect<Tag>
          label="Preferred stack"
          placeholder="Pick your stack…"
          options={[...frameworks]}
          selectOptions={{
            initialValue: ["react", "svelte"],
          }}
        />
      </div>

      <div className="demo-section">
        <h3>Keyboard navigation</h3>
        <p className="demo-description">
          <kbd>↓</kbd>/<kbd>↑</kbd> move highlight (opens menu if closed),{" "}
          <kbd>Enter</kbd>/<kbd>Space</kbd> toggle highlighted option,{" "}
          <kbd>Escape</kbd> close menu, <kbd>Home</kbd>/<kbd>End</kbd> jump to
          first/last, <kbd>Backspace</kbd> remove last tag (when closed).
        </p>
      </div>
    </>
  );
}
