/**
 * Svelte action that moves an element to a target container (defaults to document.body).
 * Useful for modals, tooltips, dropdowns — anything that needs to escape
 * parent overflow:hidden or z-index stacking contexts.
 *
 * Usage:
 *   <div use:portal>…</div>
 *   <div use:portal={document.getElementById('my-portal')}>…</div>
 */
export function portal(node: HTMLElement, target?: HTMLElement) {
  let container = target ?? document.body;

  // Create a wrapper so we can move the node cleanly.
  const wrapper = document.createElement("div");
  wrapper.setAttribute("data-portal", "");
  wrapper.style.display = "contents";

  // Move node into the wrapper, then append wrapper to the target.
  wrapper.appendChild(node);
  container.appendChild(wrapper);

  return {
    update(newTarget?: HTMLElement) {
      container = newTarget ?? document.body;
      container.appendChild(wrapper);
    },
    destroy() {
      wrapper.remove();
    },
  };
}
