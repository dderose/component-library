export default function Home() {
  return (
    <>
      <h2>Welcome</h2>
      <p>
        This demo showcases <code>@component-library/core</code> wired up with
        the <code>@component-library/react</code> adapter inside a{" "}
        <strong>Next.js 15</strong> App Router project.
      </p>
      <p>
        Each page demonstrates a headless component — the{" "}
        <code>useLogic</code> hook bridges the core logic into React, and{" "}
        <code>@component-library/css</code> provides the Moon Design System
        styling via the <code>cl-*</code> class names.
      </p>
      <p>
        Pick a component from the nav above. The Contact Form page shows
        everything working together.
      </p>
    </>
  );
}
