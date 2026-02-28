# demo-next

Next.js 15 (App Router) demo for `@component-library`.

## Setup

```bash
bun install          # from repo root
cd packages/demo-next
bun run dev          # starts on http://localhost:3000
```

## What's inside

This demo showcases the **headless component pattern** in a React / Next.js context:

| Route            | Components used                                              |
| ---------------- | ------------------------------------------------------------ |
| `/`              | Home — overview of the architecture                          |
| `/text-field`    | `TextFieldLogic` with validation rules                       |
| `/checkbox`      | `CheckboxLogic` with toggle                                  |
| `/radio-group`   | `RadioGroupLogic` with single selection                      |
| `/select`        | `SelectLogic` with keyboard nav, highlighting, dropdown      |
| `/multi-select`  | `MultiSelectLogic` with tags, keyboard nav, validation       |
| `/button`        | `ButtonLogic` with async loading, disabled, pressed states   |
| `/accordion`     | `AccordionLogic` in single and multiple mode                 |
| `/modal`         | `ModalLogic` with portal, focus trap, transitions            |
| `/contact-form`  | All components together in a realistic form + modal           |

## Architecture

```
@component-library/core    → Pure TS logic classes (TextFieldLogic, etc.)
@component-library/react   → useLogic() hook (useSyncExternalStore bridge)
@component-library/css     → Moon Design System styled CSS (cl-* classes)
                           ↓
              demo-next/src/components/   → Thin React wrappers
              demo-next/src/app/         → Next.js pages (App Router)
```

Each component in `src/components/` is a thin `"use client"` wrapper that:

1. Calls `useLogic(() => new XxxLogic(options))` to create and subscribe to core logic
2. Uses the `classNames` helpers from `@component-library/core` (e.g. `textfield.root(state)`) to apply `cl-*` CSS classes
3. Wires DOM events (`onChange`, `onFocus`, `onBlur`, etc.) to logic methods

The pages are simple — they import the component and render it with props.

## Why `@component-library/react`?

The existing `@component-library/react-native` package works in React web too (it only uses standard React hooks), but it lists `react-native` as a peer dependency. `@component-library/react` is the same `useLogic` hook without that peer dep, so it's cleaner for web-only React projects like Next.js.
