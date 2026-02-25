import type { ComponentLogic } from "../types";
import { Store } from "../utils/store";

// ---- State & Options ----

export interface AccordionState {
  /** Set of currently expanded item IDs. */
  expandedItems: Set<string>;
}

export interface AccordionOptions {
  /** Items expanded on mount. @default [] */
  initialExpanded?: string[];
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

  constructor(options: AccordionOptions = {}) {
    const {
      initialExpanded = [],
      multiple = false,
      collapsible = true,
      onChange,
    } = options;

    this.multiple = multiple;
    this.collapsible = collapsible;
    this.onChange = onChange;

    this.store = new Store<AccordionState>({
      expandedItems: new Set(
        multiple ? initialExpanded : initialExpanded.slice(0, 1)
      ),
    });
  }

  // ---- Read ----

  getState() {
    return this.store.getState();
  }

  subscribe(listener: (state: AccordionState) => void) {
    return this.store.subscribe(listener);
  }

  isExpanded(itemId: string): boolean {
    return this.store.getState().expandedItems.has(itemId);
  }

  // ---- Actions ----

  toggle(itemId: string): void {
    if (this.isExpanded(itemId)) {
      this.collapse(itemId);
    } else {
      this.expand(itemId);
    }
  }

  expand(itemId: string): void {
    const { expandedItems } = this.store.getState();
    if (expandedItems.has(itemId)) return;

    let next: Set<string>;
    if (this.multiple) {
      next = new Set(expandedItems);
      next.add(itemId);
    } else {
      next = new Set([itemId]);
    }

    this.store.setState({ expandedItems: next });
    this.onChange?.(next);
  }

  collapse(itemId: string): void {
    const { expandedItems } = this.store.getState();
    if (!expandedItems.has(itemId)) return;

    // Prevent collapsing the last item when collapsible is false
    if (!this.collapsible && expandedItems.size === 1) return;

    const next = new Set(expandedItems);
    next.delete(itemId);

    this.store.setState({ expandedItems: next });
    this.onChange?.(next);
  }

  expandAll(itemIds: string[]): void {
    if (!this.multiple) return;

    const next = new Set(itemIds);
    this.store.setState({ expandedItems: next });
    this.onChange?.(next);
  }

  collapseAll(): void {
    if (!this.collapsible) return;

    const next = new Set<string>();
    this.store.setState({ expandedItems: next });
    this.onChange?.(next);
  }

  destroy(): void {
    this.store.destroy();
  }
}
