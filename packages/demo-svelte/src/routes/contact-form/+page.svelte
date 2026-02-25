<script lang="ts">
  import { useLogic, clickOutside } from "@component-library/svelte";
  import {
    TextFieldLogic,
    SelectLogic,
    MultiSelectLogic,
    CheckboxLogic,
    RadioGroupLogic,
  } from "@component-library/core";
  import type {
    SelectOption,
    MultiSelectOption,
    ValidationRule,
  } from "@component-library/core";

  // ---- Validation rules ----

  const required = (msg = "Required"): ValidationRule<string> => ({
    name: "required",
    validate: (v) => (v.trim() ? null : msg),
  });

  const email = (): ValidationRule<string> => ({
    name: "email",
    validate: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : "Enter a valid email address",
  });

  const minLength = (min: number): ValidationRule<string> => ({
    name: "minLength",
    validate: (v) => (v.length >= min ? null : `At least ${min} characters`),
  });

  const requiredSelect = (msg = "Please make a selection"): ValidationRule<string | null> => ({
    name: "required",
    validate: (v) => (v ? null : msg),
  });

  const minSelected = (min: number): ValidationRule<string[]> => ({
    name: "minSelected",
    validate: (v) => (v.length >= min ? null : `Select at least ${min}`),
  });

  const mustAccept = (): ValidationRule<boolean> => ({
    name: "mustAccept",
    validate: (v) => (v ? null : "You must accept the privacy policy"),
  });

  const requiredRadio = (msg = "Please select an option"): ValidationRule<string | null> => ({
    name: "required",
    validate: (v) => (v ? null : msg),
  });

  // ---- Options ----

  type Reason = "general" | "support" | "sales" | "feedback";
  const reasons: SelectOption<Reason>[] = [
    { value: "general", label: "General inquiry" },
    { value: "support", label: "Technical support" },
    { value: "sales", label: "Sales question" },
    { value: "feedback", label: "Feedback" },
  ];

  type Topic = "product" | "pricing" | "docs" | "other";
  const topics: MultiSelectOption<Topic>[] = [
    { value: "product", label: "Product features" },
    { value: "pricing", label: "Pricing" },
    { value: "docs", label: "Documentation" },
    { value: "other", label: "Other" },
  ];

  type Priority = "low" | "medium" | "high";
  const priorities: { value: Priority; label: string }[] = [
    { value: "low", label: "Low — no rush" },
    { value: "medium", label: "Medium — within a few days" },
    { value: "high", label: "High — urgent" },
  ];

  // ---- Form fields ----

  const nameLogic = new TextFieldLogic({
    rules: [required("Name is required"), minLength(2)],
    validateOnChange: false,
    validateOnBlur: true,
  });
  const nameState = useLogic(nameLogic);

  const emailLogic = new TextFieldLogic({
    rules: [required("Email is required"), email()],
    validateOnChange: false,
    validateOnBlur: true,
  });
  const emailState = useLogic(emailLogic);

  const reasonLogic = new SelectLogic<Reason>({
    options: reasons,
    rules: [requiredSelect("Please select a reason")],
    validateOnChange: false,
    validateOnBlur: true,
  });
  const reasonState = useLogic(reasonLogic);

  const topicsLogic = new MultiSelectLogic<Topic>({
    options: topics,
    rules: [minSelected(1)],
    validateOnChange: true,
    validateOnBlur: true,
  });
  const topicsState = useLogic(topicsLogic);

  const priorityLogic = new RadioGroupLogic<Priority>({
    rules: [requiredRadio("Please select a priority")],
    validateOnChange: true,
    validateOnBlur: true,
  });
  const priorityState = useLogic(priorityLogic);

  const messageLogic = new TextFieldLogic({
    rules: [required("Message is required"), minLength(10)],
    validateOnChange: false,
    validateOnBlur: true,
  });
  const messageState = useLogic(messageLogic);

  const privacyLogic = new CheckboxLogic({
    rules: [mustAccept()],
    validateOnChange: true,
    validateOnBlur: true,
  });
  const privacyState = useLogic(privacyLogic);

  // ---- Form state ----

  let submitted = $state(false);
  let submittedData = $state<Record<string, unknown> | null>(null);

  const allLogics = [nameLogic, emailLogic, reasonLogic, topicsLogic, priorityLogic, messageLogic, privacyLogic];

  function handleSubmit() {
    // Validate all fields
    const results = allLogics.map((l) => l.validate());
    const allValid = results.every((r) => r.valid);

    if (!allValid) return;

    submittedData = {
      name: nameState.current.value,
      email: emailState.current.value,
      reason: reasonState.current.value,
      topics: topicsState.current.value,
      priority: priorityState.current.value,
      message: messageState.current.value,
      privacyAccepted: privacyState.current.checked,
    };
    submitted = true;
  }

  function handleReset() {
    allLogics.forEach((l) => l.reset());
    submitted = false;
    submittedData = null;
  }

  function getReasonLabel(): string {
    return reasons.find((r) => r.value === reasonState.current.value)?.label ?? "";
  }

  function getTopicLabel(v: Topic): string {
    return topics.find((t) => t.value === v)?.label ?? v;
  }
</script>

<h2>Contact Form</h2>
<p class="form-description">
  A complete form built entirely from the headless component library — TextField, Select, MultiSelect, RadioGroup, and Checkbox — with form-level validation on submit.
</p>

{#if submitted && submittedData}
  <div class="success-banner">
    <div class="success-icon">✓</div>
    <div>
      <strong>Message sent!</strong>
      <p>Thanks {submittedData.name}, we'll get back to you at {submittedData.email}.</p>
    </div>
  </div>

  <details class="submitted-data">
    <summary>View submitted data</summary>
    <pre>{JSON.stringify(submittedData, null, 2)}</pre>
  </details>

  <button class="btn btn-secondary" onclick={handleReset}>Send another message</button>
{:else}
  <form class="form" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <!-- Name -->
    <div class="field">
      <label class="label" for="name">Name <span class="required">*</span></label>
      <input
        id="name"
        class="input"
        class:error={!nameState.current.validation.valid && nameState.current.touched}
        type="text"
        placeholder="Your full name"
        value={nameState.current.value}
        oninput={(e) => nameLogic.setValue(e.currentTarget.value)}
        onfocus={() => nameLogic.focus()}
        onblur={() => nameLogic.blur()}
      />
      {#if !nameState.current.validation.valid && nameState.current.touched}
        <span class="field-error" role="alert">{nameState.current.validation.errors[0]}</span>
      {/if}
    </div>

    <!-- Email -->
    <div class="field">
      <label class="label" for="email">Email <span class="required">*</span></label>
      <input
        id="email"
        class="input"
        class:error={!emailState.current.validation.valid && emailState.current.touched}
        type="email"
        placeholder="you@example.com"
        value={emailState.current.value}
        oninput={(e) => emailLogic.setValue(e.currentTarget.value)}
        onfocus={() => emailLogic.focus()}
        onblur={() => emailLogic.blur()}
      />
      {#if !emailState.current.validation.valid && emailState.current.touched}
        <span class="field-error" role="alert">{emailState.current.validation.errors[0]}</span>
      {/if}
    </div>

    <!-- Reason (Select) -->
    <div class="field">
      <label class="label" id={reasonLogic.aria.labelId}>Reason for contact <span class="required">*</span></label>
      <div
        class="select-wrapper"
        use:clickOutside={{ handler: () => reasonLogic.closeMenu(), enabled: reasonState.current.open }}
      >
        <button
          type="button"
          class="select-trigger"
          class:open={reasonState.current.open}
          class:error={!reasonState.current.validation.valid && reasonState.current.touched}
          role={reasonLogic.aria.trigger.role}
          aria-haspopup={reasonLogic.aria.trigger["aria-haspopup"]}
          aria-expanded={reasonState.current.open}
          aria-controls={reasonLogic.aria.trigger["aria-controls"]}
          aria-labelledby={reasonLogic.aria.labelId}
          onclick={() => reasonLogic.toggleMenu()}
          onkeydown={(e) => reasonLogic.handleKeyDown(e)}
          onfocus={() => reasonLogic.focus()}
          onblur={() => reasonLogic.blur()}
        >
          {#if reasonState.current.value}
            <span>{getReasonLabel()}</span>
          {:else}
            <span class="placeholder">Select a reason…</span>
          {/if}
          <span class="chevron" aria-hidden="true">{reasonState.current.open ? "▲" : "▼"}</span>
        </button>

        {#if reasonState.current.open}
          <ul
            class="dropdown"
            role={reasonLogic.aria.listbox.role}
            id={reasonLogic.aria.listbox.id}
            aria-labelledby={reasonLogic.aria.labelId}
          >
            {#each reasons as opt, i}
              <li
                id={reasonLogic.aria.optionId(i)}
                role="option"
                aria-selected={reasonState.current.value === opt.value}
                class="option"
                class:highlighted={reasonState.current.highlightedIndex === i}
                class:selected={reasonState.current.value === opt.value}
                onmouseenter={() => reasonLogic.highlightIndex(i)}
                onclick={() => reasonLogic.setValue(opt.value)}
              >
                {opt.label}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      {#if !reasonState.current.validation.valid && reasonState.current.touched}
        <span class="field-error" role="alert">{reasonState.current.validation.errors[0]}</span>
      {/if}
    </div>

    <!-- Topics (MultiSelect) -->
    <div class="field">
      <label class="label" id={topicsLogic.aria.labelId}>Related topics <span class="required">*</span></label>
      <div
        class="select-wrapper"
        use:clickOutside={{ handler: () => topicsLogic.closeMenu(), enabled: topicsState.current.open }}
      >
        <button
          type="button"
          class="select-trigger"
          class:open={topicsState.current.open}
          class:error={!topicsState.current.validation.valid && topicsState.current.touched}
          role={topicsLogic.aria.trigger.role}
          aria-haspopup={topicsLogic.aria.trigger["aria-haspopup"]}
          aria-expanded={topicsState.current.open}
          aria-controls={topicsLogic.aria.trigger["aria-controls"]}
          aria-labelledby={topicsLogic.aria.labelId}
          onclick={() => topicsLogic.toggleMenu()}
          onkeydown={(e) => topicsLogic.handleKeyDown(e)}
          onfocus={() => topicsLogic.focus()}
          onblur={() => topicsLogic.blur()}
        >
          {#if topicsState.current.value.length > 0}
            <span class="tags">
              {#each topicsState.current.value as tag}
                <span class="tag">
                  {getTopicLabel(tag)}
                  <button
                    type="button"
                    class="tag-remove"
                    tabindex={-1}
                    aria-label="Remove {getTopicLabel(tag)}"
                    onclick={(e) => { e.stopPropagation(); topicsLogic.deselect(tag); }}
                  >×</button>
                </span>
              {/each}
            </span>
          {:else}
            <span class="placeholder">Select topics…</span>
          {/if}
          <span class="chevron" aria-hidden="true">{topicsState.current.open ? "▲" : "▼"}</span>
        </button>

        {#if topicsState.current.open}
          <ul
            class="dropdown"
            role={topicsLogic.aria.listbox.role}
            id={topicsLogic.aria.listbox.id}
            aria-multiselectable="true"
            aria-labelledby={topicsLogic.aria.labelId}
          >
            {#each topics as opt, i}
              <li
                id={topicsLogic.aria.optionId(i)}
                role="option"
                aria-selected={topicsState.current.value.includes(opt.value)}
                class="option"
                class:highlighted={topicsState.current.highlightedIndex === i}
                class:selected={topicsState.current.value.includes(opt.value)}
                onmouseenter={() => topicsLogic.highlightIndex(i)}
                onclick={() => topicsLogic.toggleItem(opt.value)}
              >
                <span class="check" aria-hidden="true">
                  {topicsState.current.value.includes(opt.value) ? "☑" : "☐"}
                </span>
                {opt.label}
              </li>
            {/each}
          </ul>
        {/if}
      </div>
      {#if !topicsState.current.validation.valid && topicsState.current.touched}
        <span class="field-error" role="alert">{topicsState.current.validation.errors[0]}</span>
      {/if}
    </div>

    <!-- Priority (RadioGroup) -->
    <fieldset class="field fieldset">
      <legend class="label">Priority <span class="required">*</span></legend>
      <div class="radio-group">
        {#each priorities as opt}
          <label class="radio-option" class:selected={priorityState.current.value === opt.value}>
            <input
              type="radio"
              name="priority"
              value={opt.value}
              checked={priorityState.current.value === opt.value}
              onchange={() => priorityLogic.setValue(opt.value)}
              onfocus={() => priorityLogic.focus()}
              onblur={() => priorityLogic.blur()}
            />
            <span class="radio-label">{opt.label}</span>
          </label>
        {/each}
      </div>
      {#if !priorityState.current.validation.valid && priorityState.current.touched}
        <span class="field-error" role="alert">{priorityState.current.validation.errors[0]}</span>
      {/if}
    </fieldset>

    <!-- Message -->
    <div class="field">
      <label class="label" for="message">Message <span class="required">*</span></label>
      <textarea
        id="message"
        class="input textarea"
        class:error={!messageState.current.validation.valid && messageState.current.touched}
        placeholder="Tell us how we can help…"
        rows="4"
        value={messageState.current.value}
        oninput={(e) => messageLogic.setValue(e.currentTarget.value)}
        onfocus={() => messageLogic.focus()}
        onblur={() => messageLogic.blur()}
      ></textarea>
      {#if !messageState.current.validation.valid && messageState.current.touched}
        <span class="field-error" role="alert">{messageState.current.validation.errors[0]}</span>
      {/if}
    </div>

    <!-- Privacy (Checkbox) -->
    <div class="field">
      <label class="checkbox-row">
        <input
          type="checkbox"
          checked={privacyState.current.checked}
          onchange={() => privacyLogic.toggle()}
          onfocus={() => privacyLogic.focus()}
          onblur={() => privacyLogic.blur()}
        />
        <span class="checkbox-label">
          I agree to the <a href="#privacy" onclick={(e) => e.preventDefault()}>Privacy Policy</a>
          <span class="required">*</span>
        </span>
      </label>
      {#if !privacyState.current.validation.valid && privacyState.current.touched}
        <span class="field-error" role="alert">{privacyState.current.validation.errors[0]}</span>
      {/if}
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="submit" class="btn btn-primary">Send message</button>
      <button type="button" class="btn btn-secondary" onclick={handleReset}>Reset</button>
    </div>
  </form>
{/if}

<style>
  .form-description {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    margin-bottom: 0.5rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .fieldset {
    border: none;
    padding: 0;
  }

  .label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .required {
    color: var(--color-error);
  }

  .input {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-family: inherit;
    color: var(--color-text);
    background: var(--color-surface);
    transition: border-color 150ms;
  }
  .input:focus {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
  }
  .input.error {
    border-color: var(--color-error);
  }
  .input.error:focus {
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.15);
  }

  .textarea {
    resize: vertical;
    min-height: 100px;
    line-height: 1.5;
  }

  .field-error {
    font-size: 0.8rem;
    color: var(--color-error);
  }

  /* Select */
  .select-wrapper {
    position: relative;
  }
  .select-trigger {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    background: var(--color-surface);
    font-size: 0.875rem;
    font-family: inherit;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
    min-height: 2.25rem;
    transition: border-color 150ms;
  }
  .select-trigger:focus-visible {
    outline: none;
    border-color: var(--color-border-focus);
    box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.15);
  }
  .select-trigger.open {
    border-color: var(--color-border-focus);
  }
  .select-trigger.error {
    border-color: var(--color-error);
  }
  .placeholder {
    color: var(--color-text-muted);
  }
  .chevron {
    font-size: 0.6rem;
    color: var(--color-text-muted);
    flex-shrink: 0;
  }
  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    list-style: none;
    padding: 0.25rem 0;
    margin: 0;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    z-index: 20;
  }
  .option {
    padding: 0.4rem 0.75rem;
    font-size: 0.875rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  .option:hover,
  .option.highlighted {
    background: var(--color-bg);
  }
  .option.selected {
    color: var(--color-primary);
    font-weight: 600;
  }
  .check {
    font-size: 0.85rem;
  }

  /* Tags */
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.15rem;
    padding: 0.1rem 0.4rem;
    background: var(--color-bg);
    border-radius: 3px;
    font-size: 0.8rem;
  }
  .tag-remove {
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.9rem;
    line-height: 1;
    padding: 0;
    color: var(--color-text-muted);
  }
  .tag-remove:hover {
    color: var(--color-error);
  }

  /* Radio */
  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .radio-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--color-border);
    border-radius: var(--radius);
    cursor: pointer;
    transition: border-color 150ms, background 150ms;
  }
  .radio-option:hover {
    border-color: var(--color-text-muted);
  }
  .radio-option.selected {
    border-color: var(--color-primary);
    background: rgba(79, 70, 229, 0.04);
  }
  .radio-option input[type="radio"] {
    accent-color: var(--color-primary);
  }
  .radio-label {
    font-size: 0.875rem;
  }

  /* Checkbox */
  .checkbox-row {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    cursor: pointer;
  }
  .checkbox-row input[type="checkbox"] {
    margin-top: 0.2rem;
    accent-color: var(--color-primary);
  }
  .checkbox-label {
    font-size: 0.875rem;
    line-height: 1.4;
  }

  /* Buttons */
  .form-actions {
    display: flex;
    gap: 0.75rem;
    padding-top: 0.5rem;
  }
  .btn {
    padding: 0.5rem 1.25rem;
    border-radius: var(--radius);
    font-size: 0.875rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    border: 1px solid transparent;
    transition: background 150ms;
  }
  .btn-primary {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }
  .btn-primary:hover {
    background: var(--color-primary-hover);
  }
  .btn-secondary {
    background: var(--color-surface);
    color: var(--color-text);
    border-color: var(--color-border);
  }
  .btn-secondary:hover {
    background: var(--color-bg);
  }

  /* Success */
  .success-banner {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: var(--radius);
  }
  .success-icon {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: var(--color-success);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .success-banner strong {
    display: block;
    font-size: 0.9rem;
  }
  .success-banner p {
    font-size: 0.85rem;
    color: var(--color-text-muted);
    margin-top: 0.15rem;
  }

  .submitted-data {
    font-size: 0.8rem;
  }
  .submitted-data summary {
    cursor: pointer;
    color: var(--color-text-muted);
  }
  .submitted-data pre {
    margin-top: 0.5rem;
    padding: 0.75rem;
    background: var(--color-bg);
    border-radius: var(--radius);
    overflow-x: auto;
    font-size: 0.75rem;
  }
</style>
