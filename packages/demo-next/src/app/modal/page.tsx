"use client";

import { Modal } from "@/components/Modal";

export default function ModalPage() {
  return (
    <>
      <h2>Modal</h2>

      <div className="demo-section">
        <p className="demo-description">
          <code>ModalLogic</code> manages open/close lifecycle, and the React
          wrapper adds portal rendering, focus trap, scroll lock, and CSS
          transitions using <code>@component-library/css</code> classes.
        </p>

        <Modal
          trigger={
            <button className="cl-button cl-button--primary">
              Open Modal
            </button>
          }
        >
          {({ close, titleId, descriptionId }) => (
            <>
              <div className="cl-modal-header">
                <h3 id={titleId}>Example Modal</h3>
                <button
                  className="cl-modal-close"
                  onClick={close}
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>

              <div className="cl-modal-body" id={descriptionId}>
                <p>
                  This modal is rendered through a React portal with focus
                  trapping, scroll lock, and full ARIA support.
                </p>
                <p>
                  Try pressing <kbd>Tab</kbd> to see focus trapped inside.
                  Press <kbd>Escape</kbd> or click the backdrop to dismiss.
                </p>
                <label
                  htmlFor="modal-input"
                  style={{ fontWeight: 500, fontSize: "0.8rem" }}
                >
                  Test input (for focus trap)
                </label>
                <input
                  id="modal-input"
                  type="text"
                  className="cl-textfield-input"
                  placeholder="Type here…"
                />
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
                >
                  Confirm
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>

      <div className="demo-section">
        <h3>Features</h3>
        <p className="demo-description">
          Focus trap (Tab/Shift+Tab cycles within modal), focus restore on
          close, Escape to dismiss, overlay click to dismiss, scroll lock,
          asymmetric transitions (300ms in, 200ms out per Moon DS).
        </p>
      </div>
    </>
  );
}
