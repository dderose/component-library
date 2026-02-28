"use client";

import { Select } from "@/components/Select";

const fruits = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
  { value: "date", label: "Date" },
  { value: "elderberry", label: "Elderberry", disabled: true },
  { value: "fig", label: "Fig" },
];

export default function SelectPage() {
  return (
    <>
      <h2>Select</h2>

      <div className="demo-section">
        <p className="demo-description">
          <code>SelectLogic</code> provides a fully accessible custom select
          with keyboard navigation, highlighting, and validation — all headless.
        </p>

        <Select
          label="Favorite fruit"
          placeholder="Pick a fruit…"
          options={fruits}
        />
      </div>
    </>
  );
}
