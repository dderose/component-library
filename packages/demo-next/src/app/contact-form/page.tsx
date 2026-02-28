"use client";

import { useState } from "react";
import {
  TextField,
  required,
  minLength,
  pattern,
} from "@/components/TextField";
import { Checkbox } from "@/components/Checkbox";
import { RadioGroup } from "@/components/RadioGroup";
import { Select } from "@/components/Select";
import { Modal } from "@/components/Modal";

const subjects = [
  { value: "general", label: "General Inquiry" },
  { value: "support", label: "Technical Support" },
  { value: "billing", label: "Billing Question" },
  { value: "feedback", label: "Feedback" },
];

export default function ContactFormPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <h2>Contact Form</h2>

      <div className="demo-section">
        <p className="demo-description">
          Demonstrates multiple components working together in a realistic form.
          All state management is handled by <code>@component-library/core</code>{" "}
          logic classes, bridged into React via <code>useLogic</code>.
        </p>

        <form
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
        >
          <TextField
            label="Name"
            placeholder="Your full name"
            options={{
              rules: [required(), minLength(2)],
              validateOnBlur: true,
              validateOnChange: false,
            }}
          />

          <TextField
            label="Email"
            placeholder="you@example.com"
            type="email"
            options={{
              rules: [
                required(),
                pattern(
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  "Please enter a valid email",
                ),
              ],
              validateOnBlur: true,
              validateOnChange: false,
            }}
          />

          <Select
            label="Subject"
            placeholder="What is this about?"
            options={subjects}
          />

          <RadioGroup
            legend="Priority"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
          />

          <TextField
            label="Message"
            placeholder="How can we help?"
            options={{
              rules: [required(), minLength(10)],
              validateOnBlur: true,
              validateOnChange: false,
            }}
          />

          <Checkbox label="I agree to the privacy policy" />

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button type="submit" className="cl-button cl-button--primary">
              Send Message
            </button>
            <button type="reset" className="cl-button cl-button--secondary">
              Reset
            </button>
          </div>
        </form>

        {submitted && (
          <div
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              background: "var(--cl-color-success-bg)",
              borderRadius: "var(--cl-radius-md)",
              color: "var(--cl-color-success)",
              fontWeight: 500,
            }}
          >
            ✓ Form submitted! (This is a demo — no data was sent.)
          </div>
        )}
      </div>

      <div className="demo-section" style={{ marginTop: "2rem" }}>
        <h3>Confirm with Modal</h3>
        <p className="demo-description">
          Use a modal for confirmation dialogs:
        </p>

        <Modal
          trigger={
            <button className="cl-button cl-button--secondary">
              Delete Account…
            </button>
          }
        >
          {({ close, titleId, descriptionId }) => (
            <>
              <div className="cl-modal-header">
                <h3 id={titleId}>Confirm Deletion</h3>
                <button
                  className="cl-modal-close"
                  onClick={close}
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="cl-modal-body" id={descriptionId}>
                <p>
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
              </div>
              <div className="cl-modal-footer">
                <button
                  className="cl-button cl-button--secondary"
                  onClick={close}
                >
                  Cancel
                </button>
                <button
                  className="cl-button cl-button--primary"
                  onClick={close}
                  style={{ background: "var(--cl-color-error)" }}
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </>
  );
}
