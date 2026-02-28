"use client";

import { useState } from "react";
import { Button, useButtonLogic } from "@/components/Button";

export default function ButtonPage() {
  const [asyncResult, setAsyncResult] = useState("");
  const [pressedState, pressedLogic] = useButtonLogic({
    onClick: () => {},
  });

  return (
    <>
      <h2>Button</h2>

      <div className="demo-section">
        <h3 className="demo-title">
          Default <code>primary + secondary</code>
        </h3>
        <p className="demo-description">
          <code>ButtonLogic</code> handles click, focus, pressed, disabled, and
          async loading states. The <code>useLogic</code> hook keeps React in
          sync.
        </p>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Button options={{ onClick: () => alert("Primary clicked!") }}>
            Primary
          </Button>
          <Button
            variant="secondary"
            options={{ onClick: () => alert("Secondary clicked!") }}
          >
            Secondary
          </Button>
        </div>
      </div>

      <div className="demo-section">
        <h3 className="demo-title">
          Async / Loading <code>disableWhileLoading</code>
        </h3>
        <p className="demo-description">
          When the <code>onClick</code> handler returns a Promise, the button
          enters a loading state and ignores clicks until the promise settles.
        </p>

        <Button
          options={{
            onClick: async () => {
              setAsyncResult("");
              await new Promise((r) => setTimeout(r, 2000));
              setAsyncResult("Done! Data saved successfully.");
            },
          }}
        >
          Save changes
        </Button>

        {asyncResult && (
          <div
            style={{
              padding: "0.5rem 0.75rem",
              background: "var(--cl-color-success-bg)",
              borderRadius: "var(--cl-radius-md)",
              color: "var(--cl-color-success)",
              fontWeight: 500,
              fontSize: "0.85rem",
            }}
          >
            ✓ {asyncResult}
          </div>
        )}
      </div>

      <div className="demo-section">
        <h3 className="demo-title">Disabled</h3>
        <p className="demo-description">
          Controlled via the <code>disabled</code> option. Prevents all
          interaction.
        </p>

        <Button options={{ disabled: true }}>Disabled button</Button>
      </div>

      <div className="demo-section">
        <h3 className="demo-title">Pressed tracking (headless)</h3>
        <p className="demo-description">
          Using <code>useButtonLogic</code> for headless control. Tracks{" "}
          <code>pressed</code> state between pointerdown and pointerup.
        </p>

        <button
          className={`cl-button cl-button--primary${pressedState.pressed ? " cl-button--pressed" : ""}`}
          disabled={pressedLogic.isDisabled()}
          onClick={() => pressedLogic.press()}
          onPointerDown={() => pressedLogic.pointerDown()}
          onPointerUp={() => pressedLogic.pointerUp()}
          onPointerLeave={() => pressedLogic.pointerUp()}
          onFocus={() => pressedLogic.focus()}
          onBlur={() => pressedLogic.blur()}
        >
          Hold me down
        </button>

        <div className="state-debug">
          <strong>State:</strong>
          <code>
            pressed={String(pressedState.pressed)} | focused=
            {String(pressedState.focused)} | loading=
            {String(pressedState.loading)}
          </code>
        </div>
      </div>
    </>
  );
}
