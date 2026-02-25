import { describe, expect, it, vi } from "vitest";
import { type AccordionItem, AccordionLogic } from "../src/components/accordion";

const items: AccordionItem[] = [{ id: "a" }, { id: "b" }, { id: "c" }];

const itemsWithDisabled: AccordionItem[] = [{ id: "a" }, { id: "b", disabled: true }, { id: "c" }];

function key(k: string): KeyboardEvent {
  return { key: k, preventDefault: vi.fn() } as unknown as KeyboardEvent;
}

describe("AccordionLogic", () => {
  // ---- Initial state ----

  it("starts with no items expanded", () => {
    const acc = new AccordionLogic({ items });
    expect(acc.getState().expandedItems.size).toBe(0);
    expect(acc.getState().focusedItemId).toBeNull();
  });

  it("respects initialExpanded", () => {
    const acc = new AccordionLogic({ items, initialExpanded: ["b"] });
    expect(acc.isExpanded("b")).toBe(true);
    expect(acc.isExpanded("a")).toBe(false);
  });

  it("initialExpanded is limited to one item when multiple is false", () => {
    const acc = new AccordionLogic({
      items,
      initialExpanded: ["a", "b", "c"],
      multiple: false,
    });
    expect(acc.getState().expandedItems.size).toBe(1);
    expect(acc.isExpanded("a")).toBe(true);
  });

  it("initialExpanded allows multiple when multiple is true", () => {
    const acc = new AccordionLogic({
      items,
      initialExpanded: ["a", "c"],
      multiple: true,
    });
    expect(acc.getState().expandedItems.size).toBe(2);
    expect(acc.isExpanded("a")).toBe(true);
    expect(acc.isExpanded("c")).toBe(true);
  });

  // ---- ARIA ----

  it("generates unique ARIA IDs per instance", () => {
    const a = new AccordionLogic({ items });
    const b = new AccordionLogic({ items });

    const aTriggerId = a.getTriggerId("a");
    const bTriggerId = b.getTriggerId("a");
    expect(aTriggerId).not.toBe(bTriggerId);
  });

  it("triggerAttrs returns correct ARIA props", () => {
    const acc = new AccordionLogic({ items, initialExpanded: ["a"] });
    const attrs = acc.aria.triggerAttrs("a");

    expect(attrs["aria-expanded"]).toBe(true);
    expect(attrs["aria-controls"]).toContain("panel-a");
    expect(attrs.id).toContain("trigger-a");
  });

  it("panelAttrs returns correct ARIA props", () => {
    const acc = new AccordionLogic({ items });
    const attrs = acc.aria.panelAttrs("a");

    expect(attrs.role).toBe("region");
    expect(attrs["aria-labelledby"]).toContain("trigger-a");
    expect(attrs.id).toContain("panel-a");
  });

  it("triggerAttrs reflects disabled state", () => {
    const acc = new AccordionLogic({ items: itemsWithDisabled });
    const attrs = acc.aria.triggerAttrs("b");
    expect(attrs["aria-disabled"]).toBe(true);
  });

  // ---- expand / collapse / toggle ----

  it("expand opens an item", () => {
    const acc = new AccordionLogic({ items });
    acc.expand("a");
    expect(acc.isExpanded("a")).toBe(true);
  });

  it("expand in single mode closes other items", () => {
    const acc = new AccordionLogic({ items, initialExpanded: ["a"] });
    acc.expand("b");
    expect(acc.isExpanded("a")).toBe(false);
    expect(acc.isExpanded("b")).toBe(true);
  });

  it("expand in multiple mode keeps other items open", () => {
    const acc = new AccordionLogic({
      items,
      multiple: true,
      initialExpanded: ["a"],
    });
    acc.expand("b");
    expect(acc.isExpanded("a")).toBe(true);
    expect(acc.isExpanded("b")).toBe(true);
  });

  it("expand does nothing if already expanded", () => {
    const acc = new AccordionLogic({ items, initialExpanded: ["a"] });
    const listener = vi.fn();
    acc.subscribe(listener);

    acc.expand("a");
    expect(listener).not.toHaveBeenCalled();
  });

  it("expand ignores disabled items", () => {
    const acc = new AccordionLogic({ items: itemsWithDisabled });
    acc.expand("b");
    expect(acc.isExpanded("b")).toBe(false);
  });

  it("collapse closes an item", () => {
    const acc = new AccordionLogic({ items, initialExpanded: ["a"] });
    acc.collapse("a");
    expect(acc.isExpanded("a")).toBe(false);
  });

  it("collapse does nothing if not expanded", () => {
    const acc = new AccordionLogic({ items });
    const listener = vi.fn();
    acc.subscribe(listener);

    acc.collapse("a");
    expect(listener).not.toHaveBeenCalled();
  });

  it("collapse is blocked when collapsible is false and only one item is open", () => {
    const acc = new AccordionLogic({
      items,
      initialExpanded: ["a"],
      collapsible: false,
    });
    acc.collapse("a");
    expect(acc.isExpanded("a")).toBe(true); // still open
  });

  it("toggle expands when collapsed", () => {
    const acc = new AccordionLogic({ items });
    acc.toggle("a");
    expect(acc.isExpanded("a")).toBe(true);
  });

  it("toggle collapses when expanded", () => {
    const acc = new AccordionLogic({ items, initialExpanded: ["a"] });
    acc.toggle("a");
    expect(acc.isExpanded("a")).toBe(false);
  });

  it("toggle ignores disabled items", () => {
    const acc = new AccordionLogic({ items: itemsWithDisabled });
    acc.toggle("b");
    expect(acc.isExpanded("b")).toBe(false);
  });

  // ---- expandAll / collapseAll ----

  it("expandAll expands all enabled items in multiple mode", () => {
    const acc = new AccordionLogic({
      items: itemsWithDisabled,
      multiple: true,
    });
    acc.expandAll();
    expect(acc.isExpanded("a")).toBe(true);
    expect(acc.isExpanded("b")).toBe(false); // disabled
    expect(acc.isExpanded("c")).toBe(true);
  });

  it("expandAll is no-op when multiple is false", () => {
    const acc = new AccordionLogic({ items });
    const listener = vi.fn();
    acc.subscribe(listener);

    acc.expandAll();
    expect(listener).not.toHaveBeenCalled();
  });

  it("collapseAll collapses everything", () => {
    const acc = new AccordionLogic({
      items,
      multiple: true,
      initialExpanded: ["a", "b", "c"],
    });
    acc.collapseAll();
    expect(acc.getState().expandedItems.size).toBe(0);
  });

  it("collapseAll is no-op when collapsible is false", () => {
    const acc = new AccordionLogic({
      items,
      collapsible: false,
      initialExpanded: ["a"],
    });
    const listener = vi.fn();
    acc.subscribe(listener);

    acc.collapseAll();
    expect(listener).not.toHaveBeenCalled();
  });

  // ---- onChange callback ----

  it("fires onChange when expanding", () => {
    const onChange = vi.fn();
    const acc = new AccordionLogic({ items, onChange });

    acc.expand("a");
    expect(onChange).toHaveBeenCalledTimes(1);
    const expanded = onChange.mock.calls[0][0] as Set<string>;
    expect(expanded.has("a")).toBe(true);
  });

  it("fires onChange when collapsing", () => {
    const onChange = vi.fn();
    const acc = new AccordionLogic({ items, initialExpanded: ["a"], onChange });

    acc.collapse("a");
    expect(onChange).toHaveBeenCalledTimes(1);
    const expanded = onChange.mock.calls[0][0] as Set<string>;
    expect(expanded.size).toBe(0);
  });

  // ---- Focus management ----

  it("focusItem sets focusedItemId", () => {
    const acc = new AccordionLogic({ items });
    acc.focusItem("b");
    expect(acc.getState().focusedItemId).toBe("b");
  });

  it("focusItem ignores disabled items", () => {
    const acc = new AccordionLogic({ items: itemsWithDisabled });
    acc.focusItem("b");
    expect(acc.getState().focusedItemId).toBeNull();
  });

  it("clearFocus resets focusedItemId", () => {
    const acc = new AccordionLogic({ items });
    acc.focusItem("a");
    acc.clearFocus();
    expect(acc.getState().focusedItemId).toBeNull();
  });

  // ---- Keyboard navigation ----

  describe("handleKeyDown", () => {
    it("ArrowDown focuses next item", () => {
      const acc = new AccordionLogic({ items });
      acc.handleKeyDown(key("ArrowDown"), "a");
      expect(acc.getState().focusedItemId).toBe("b");
    });

    it("ArrowDown wraps around", () => {
      const acc = new AccordionLogic({ items });
      acc.handleKeyDown(key("ArrowDown"), "c");
      expect(acc.getState().focusedItemId).toBe("a");
    });

    it("ArrowDown skips disabled items", () => {
      const acc = new AccordionLogic({ items: itemsWithDisabled });
      acc.handleKeyDown(key("ArrowDown"), "a");
      expect(acc.getState().focusedItemId).toBe("c"); // skips b
    });

    it("ArrowUp focuses previous item", () => {
      const acc = new AccordionLogic({ items });
      acc.handleKeyDown(key("ArrowUp"), "b");
      expect(acc.getState().focusedItemId).toBe("a");
    });

    it("ArrowUp wraps around", () => {
      const acc = new AccordionLogic({ items });
      acc.handleKeyDown(key("ArrowUp"), "a");
      expect(acc.getState().focusedItemId).toBe("c");
    });

    it("Home focuses first enabled item", () => {
      const acc = new AccordionLogic({ items });
      acc.handleKeyDown(key("Home"), "c");
      expect(acc.getState().focusedItemId).toBe("a");
    });

    it("End focuses last enabled item", () => {
      const acc = new AccordionLogic({ items });
      acc.handleKeyDown(key("End"), "a");
      expect(acc.getState().focusedItemId).toBe("c");
    });

    it("Enter toggles the item", () => {
      const acc = new AccordionLogic({ items });
      acc.handleKeyDown(key("Enter"), "a");
      expect(acc.isExpanded("a")).toBe(true);

      acc.handleKeyDown(key("Enter"), "a");
      expect(acc.isExpanded("a")).toBe(false);
    });

    it("Space toggles the item", () => {
      const acc = new AccordionLogic({ items });
      acc.handleKeyDown(key(" "), "b");
      expect(acc.isExpanded("b")).toBe(true);
    });

    it("prevents default on handled keys", () => {
      const acc = new AccordionLogic({ items });
      const events = ["ArrowDown", "ArrowUp", "Home", "End", "Enter", " "].map((k) => {
        const e = key(k);
        acc.handleKeyDown(e, "a");
        return e;
      });
      for (const e of events) {
        expect(e.preventDefault).toHaveBeenCalled();
      }
    });
  });

  // ---- setItems ----

  it("setItems updates the items list", () => {
    const acc = new AccordionLogic({ items });
    const newItems = [{ id: "x" }, { id: "y" }];
    acc.setItems(newItems);
    expect(acc.getItems()).toEqual(newItems);
  });

  // ---- getTriggerId ----

  it("getTriggerId returns predictable trigger element ID", () => {
    const acc = new AccordionLogic({ items });
    const id = acc.getTriggerId("a");
    expect(id).toContain("trigger-a");
    expect(id).toBe(acc.aria.triggerAttrs("a").id);
  });

  // ---- subscribe / destroy ----

  it("subscribe and destroy", () => {
    const acc = new AccordionLogic({ items });
    const listener = vi.fn();
    acc.subscribe(listener);

    acc.expand("a");
    expect(listener).toHaveBeenCalledTimes(1);

    acc.destroy();
    acc.expand("b");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
