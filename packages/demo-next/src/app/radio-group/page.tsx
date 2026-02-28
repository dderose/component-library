"use client";

import { RadioGroup } from "@/components/RadioGroup";

export default function RadioGroupPage() {
  return (
    <>
      <h2>RadioGroup</h2>

      <div className="demo-section">
        <p className="demo-description">
          <code>RadioGroupLogic</code> handles single-selection with keyboard
          navigation and validation.
        </p>

        <RadioGroup
          legend="Favorite framework"
          options={[
            { value: "react", label: "React" },
            { value: "svelte", label: "Svelte" },
            { value: "vue", label: "Vue" },
            { value: "solid", label: "Solid" },
          ]}
        />
      </div>
    </>
  );
}
