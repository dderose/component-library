"use client";

import {
  TextField,
  useTextFieldLogic,
  required,
  minLength,
} from "@/components/TextField";

export default function TextFieldPage() {
  const [state, logic] = useTextFieldLogic({
    rules: [required(), minLength(3)],
    validateOnBlur: true,
    validateOnChange: false,
  });

  return (
    <>
      <h2>TextField</h2>

      <div className="demo-section">
        <h3 className="demo-title">
          With validation <code>required + minLength(3)</code>
        </h3>
        <p className="demo-description">
          Uses <code>useLogic</code> to bridge <code>TextFieldLogic</code> into
          React. Validates on blur by default.
        </p>

        <TextField
          label="Username"
          placeholder="Enter username"
          options={{
            rules: [required(), minLength(3)],
            validateOnBlur: true,
            validateOnChange: false,
          }}
        />
      </div>

      <div className="demo-section">
        <h3>Headless usage</h3>
        <p className="demo-description">
          You can also use <code>useLogic</code> directly for full control.
          Below is a custom input wired to the same logic:
        </p>

        <div>
          <label style={{ fontWeight: 500, fontSize: "0.875rem" }}>
            Email (headless)
          </label>
          <input
            style={{
              display: "block",
              marginTop: "0.25rem",
              padding: "0.5rem 0.75rem",
              border: "1px solid var(--cl-color-border)",
              borderRadius: "var(--cl-radius-md)",
              width: "100%",
              fontSize: "var(--cl-font-size-base)",
            }}
            type="email"
            placeholder="you@example.com"
            value={state.value}
            onChange={(e) => logic.setValue(e.target.value)}
            onFocus={() => logic.focus()}
            onBlur={() => logic.blur()}
          />
          {!state.validation.valid && state.touched && (
            <ul style={{ color: "var(--cl-color-error)", fontSize: "0.8rem" }}>
              {state.validation.errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="state-debug">
          <strong>State:</strong>
          <code>
            value=&quot;{state.value}&quot; | touched={String(state.touched)} |
            dirty={String(state.dirty)} | valid=
            {String(state.validation.valid)}
          </code>
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            className="cl-button cl-button--secondary"
            onClick={() => logic.reset()}
          >
            Reset
          </button>
          <button
            className="cl-button cl-button--secondary"
            onClick={() => logic.validate()}
          >
            Validate
          </button>
        </div>
      </div>
    </>
  );
}
