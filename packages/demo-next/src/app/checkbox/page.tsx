"use client";

import { Checkbox } from "@/components/Checkbox";

export default function CheckboxPage() {
  return (
    <>
      <h2>Checkbox</h2>

      <div className="demo-section">
        <p className="demo-description">
          <code>CheckboxLogic</code> manages checked/unchecked state with
          validation support. The <code>useLogic</code> hook keeps React in
          sync.
        </p>

        <Checkbox label="Accept terms and conditions" />
        <Checkbox label="Subscribe to newsletter" options={{ initialChecked: true }} />
        <Checkbox label="Enable dark mode" />
      </div>
    </>
  );
}
