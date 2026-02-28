"use client";

import { useEffect, useRef } from "react";
import {
  AccordionLogic,
  accordion as cls,
  useLogic,
  type AccordionItem,
  type AccordionOptions,
} from "@component-library/react";

const ChevronIcon = ({ rotated }: { rotated: boolean }) => (
  <svg
    className={cls.chevron(rotated)}
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M4 6L8 10L12 6"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface AccordionProps {
  items: (AccordionItem & { title: string; content: string })[];
  options?: Omit<AccordionOptions, "items">;
}

export function Accordion({ items, options = {} }: AccordionProps) {
  const [state, logic] = useLogic(
    () =>
      new AccordionLogic({
        ...options,
        items,
      }),
  );

  // Sync focus to DOM
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const focusedId = state.focusedItemId;
    if (focusedId) {
      document.getElementById(logic.getTriggerId(focusedId))?.focus();
    }
  }, [state.focusedItemId, logic]);

  return (
    <div ref={containerRef} className={cls.root}>
      {items.map((item) => {
        const expanded = state.expandedItems.has(item.id);
        const triggerAttrs = logic.aria.triggerAttrs(item.id);
        const panelAttrs = logic.aria.panelAttrs(item.id);

        return (
          <div
            key={item.id}
            className={cls.item({
              expanded,
              disabled: item.disabled,
            })}
          >
            <h4 className={cls.header}>
              <button
                id={triggerAttrs.id}
                className={cls.trigger}
                aria-expanded={expanded}
                aria-controls={triggerAttrs["aria-controls"]}
                aria-disabled={item.disabled || undefined}
                disabled={item.disabled}
                onClick={() => logic.toggle(item.id)}
                onKeyDown={(e) => {
                  logic.handleKeyDown(
                    e.nativeEvent,
                    item.id,
                  );
                }}
                onFocus={() => logic.focusItem(item.id)}
              >
                <span>{item.title}</span>
                <ChevronIcon rotated={expanded} />
              </button>
            </h4>

            <div
              id={panelAttrs.id}
              role={panelAttrs.role}
              aria-labelledby={panelAttrs["aria-labelledby"]}
              className={cls.panel}
            >
              <div className={cls.content}>
                <p>{item.content}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { type AccordionItem };
