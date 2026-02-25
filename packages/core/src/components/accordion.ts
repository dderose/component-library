import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";

// ---- ID generation ----

let idCounter = 0;

function generateId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

export function resetAccordionIdCounter(): void {
  idCounter = 0;
}

// ---- State & Options ----

export interface AccordionItem {
  id: string;
  disabled?: boolean;
}

export interface AccordionState {
  /** Set of currently expanded item IDs. */
  expandedItems: Set<string>;
  /** ID of the currently focused item (for keyboard nav). -1 or null = none. */
  focusedItemId: string | null;
}

export interface AccordionAria {
  /** Returns ARIA props for the trigger button of a given item. */
  triggerAttrs: (itemId: string) => {
    id: string;
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-disabled"?: boolean;
  };
  /** Returns ARIA props for the content panel of a given item. */
  panelAttrs: (itemId: string) => {
    id: string;
    role: "region";
    "aria-labelledby": string;
  };
}

export interface AccordionOptions {
  /** Items expanded on mount. @default [] */
  initialExpanded?: string[];
  /** Registered items with their IDs and disabled state. */
  items?: AccordionItem[];
  /** Allow multiple items open at once. @default false */
  multiple?: boolean;
  /** Allow collapsing all items (when false, one item must stay open). @default true */
  collapsible?: boolean;
  /** Called when the set of expanded items changes. */
  onChange?: (expandedItems: Set<string>) => void;
}

// ---- Logic class ----

export class AccordionLogic implements ComponentLogic<AccordionState> {
  private store: Store<AccordionState>;
  private multiple: boolean;
  private collapsible: boolean;
  private onChange?: (expandedItems: Set<string>) => void;
  private items: AccordionItem[];
  private instanceId: string;

  /** Generated ARIA attribute helpers for this instance. */
  readonly aria: AccordionAria;

  constructor(options: AccordionOptions = {}) {
    const {
      initialExpanded = [],
      items = [],
      multiple = false,
      collapsible = true,
      onChange,
    } = options;

    this.items = items;
    this.multiple = multiple;
    this.collapsible = collapsible;
    this.onChange = onChange;

    this.instanceId = generateId("accordion");

    this.aria = {
      triggerAttrs: (itemId: string) => {
        const { expandedItems } = this.store.getState();
        const item = this.items.find((i) => i.id === itemId);
        return {
          id: `${this.instanceId}-trigger-${itemId}`,
          "aria-expanded": expandedItems.has(itemId),
          "aria-controls": `${this.instanceId}-panel-${itemId}`,
          "aria-disabled": item?.disabled || undefined,
        };
      },
      panelAttrs: (itemId: string) => ({
        id: `${this.instanceId}-panel-${itemId}`,
        role: "region" as const,
        "aria-labelledby": `${this.instanceId}-trigger-${itemId}`,
      }),
    };

    this.store = new Store<AccordionState>({
      expandedItems: new Set(
        multiple ? initialExpanded : initialExpanded.slice(0, 1)
      ),
      focusedItemId: null,
    });
  }

  // ---- Read ----

  getState() {
    return this.store.getState();
  }

  subscribe(listener: (state: AccordionState) => void) {
    return this.store.subscribe(listener);
  }

  getItems(): AccordionItem[] {
    return this.items;
  }

  isExpanded(itemId: string): boolean {
    return this.store.getState().expandedItems.has(itemId);
  }

  // ---- Item management ----

  setItems(items: AccordionItem[]): void {
    this.items = items;
  }

  // ---- Focus management ----

  private getEnabledItems(): AccordionItem[] {
    return this.items.filter((i) => !i.disabled);
  }

  private getEnabledIndex(itemId: string): number {
    return this.getEnabledItems().findIndex((i) => i.id === itemId);
  }

  focusItem(itemId: string): void {
    const item = this.items.find((i) => i.id === itemId);
    if (!item || item.disabled) return;

    this.store.setState((prev) => ({ ...prev, focusedItemId: itemId }));
  }

  clearFocus(): void {
    this.store.setState((prev) => ({ ...prev, focusedItemId: null }));
  }

  // ---- Actions ----

  toggle(itemId: string): void {
    const item = this.items.find((i) => i.id === itemId);
    if (item?.disabled) return;

    if (this.isExpanded(itemId)) {
      this.collapse(itemId);
    } else {
      this.expand(itemId);
    }
  }

  expand(itemId: string): void {
    const item = this.items.find((i) => i.id === itemId);
    if (item?.disabled) return;

    const { expandedItems } = this.store.getState();
    if (expandedItems.has(itemId)) return;

    let next: Set<string>;
    if (this.multiple) {
      next = new Set(expandedItems);
      next.add(itemId);
    } else {
      next = new Set([itemId]);
    }

    this.store.setState((prev) => ({ ...prev, expandedItems: next }));
    this.onChange?.(next);
  }

  collapse(itemId: string): void {
    const { expandedItems } = this.store.getState();
    if (!expandedItems.has(itemId)) return;

    if (!this.collapsible && expandedItems.size === 1) return;

    const next = new Set(expandedItems);
    next.delete(itemId);

    this.store.setState((prev) => ({ ...prev, expandedItems: next }));
    this.onChange?.(next);
  }

  expandAll(): void {
    if (!this.multiple) return;

    const next = new Set(this.getEnabledItems().map((i) => i.id));
    this.store.setState((prev) => ({ ...prev, expandedItems: next }));
    this.onChange?.(next);
  }

  collapseAll(): void {
    if (!this.collapsible) return;

    const next = new Set<string>();
    this.store.setState((prev) => ({ ...prev, expandedItems: next }));
    this.onChange?.(next);
  }

  /**
   * Keyboard handler for the accordion.
   * Attach to each trigger button's keydown event, passing the item's ID.
   *
   * Supported keys:
   * - ArrowDown: focus next trigger
   * - ArrowUp: focus previous trigger
   * - Home: focus first trigger
   * - End: focus last trigger
   * - Enter / Space: toggle the focused item
   */
  handleKeyDown(event: KeyboardEvent, itemId: string): void {
    const enabled = this.getEnabledItems();
    if (enabled.length === 0) return;

    const currentIndex = this.getEnabledIndex(itemId);

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const nextIndex = (currentIndex + 1) % enabled.length;
        this.focusItem(enabled[nextIndex].id);
        break;
      }

      case "ArrowUp": {
        event.preventDefault();
        const prevIndex = (currentIndex - 1 + enabled.length) % enabled.length;
        this.focusItem(enabled[prevIndex].id);
        break;
      }

      case "Home": {
        event.preventDefault();
        this.focusItem(enabled[0].id);
        break;
      }

      case "End": {
        event.preventDefault();
        this.focusItem(enabled[enabled.length - 1].id);
        break;
      }

      case "Enter":
      case " ": {
        event.preventDefault();
        this.toggle(itemId);
        break;
      }
    }
  }

  /** Returns the trigger element ID for a given item (for programmatic focus). */
  getTriggerId(itemId: string): string {
    return `${this.instanceId}-trigger-${itemId}`;
  }

  destroy(): void {
    this.store.destroy();
  }
}
