/**
 * Generates a short, unique ID suitable for ARIA attributes and DOM element IDs.
 *
 * Uses crypto.randomUUID() for uniqueness, truncated to 8 chars for readability.
 * Falls back to a Math.random-based ID in environments without crypto (rare).
 *
 * Each call produces a fresh ID — no module-level counters, so this is safe
 * for SSR (no cross-request state leakage) and concurrent rendering.
 */
export function generateId(prefix: string): string {
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${prefix}-${id}`;
}
