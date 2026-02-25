/**
 * Svelte action that fires a callback when a click occurs outside the element.
 * Useful for closing dropdowns, popovers, and menus.
 *
 * Usage:
 *   <div use:clickOutside={() => logic.closeMenu()}>…</div>
 *   <div use:clickOutside={{ handler: () => close(), enabled: isOpen }}>…</div>
 */
export type ClickOutsideParams =
  | (() => void)
  | { handler: () => void; enabled?: boolean };

export function clickOutside(node: HTMLElement, params: ClickOutsideParams) {
  let handler: () => void;
  let enabled: boolean;

  function parse(p: ClickOutsideParams) {
    if (typeof p === "function") {
      handler = p;
      enabled = true;
    } else {
      handler = p.handler;
      enabled = p.enabled ?? true;
    }
  }

  parse(params);

  function handleClick(event: MouseEvent) {
    if (!enabled) return;
    if (!node.contains(event.target as Node)) {
      handler();
    }
  }

  // Use bubble phase so that clicks on child elements (e.g. dropdown options)
  // fire their own handlers before this outside-click handler runs.
  document.addEventListener("click", handleClick);

  return {
    update(newParams: ClickOutsideParams) {
      parse(newParams);
    },
    destroy() {
      document.removeEventListener("click", handleClick);
    },
  };
}
