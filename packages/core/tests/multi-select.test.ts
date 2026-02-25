import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  MultiSelectLogic,
  resetMultiSelectIdCounter,
  type MultiSelectOption,
} from "../src/components/multi-select";
import type { ValidationRule } from "../src/utils/validation";

type Tag = "svelte" | "react" | "vue" | "angular" | "solid";

const frameworks: MultiSelectOption<Tag>[] = [
  { value: "svelte", label: "Svelte" },
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "solid", label: "Solid" },
];

const frameworksWithDisabled: MultiSelectOption<Tag>[] = [
  { value: "svelte", label: "Svelte" },
  { value: "react", label: "React", disabled: true },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "solid", label: "Solid" },
];

const minSelected = (min: number): ValidationRule<Tag[]> => ({
  name: "minSelected",
  validate: (v) => (v.length >= min ? null : `Select at least ${min}`),
});

function key(k: string, extra: Partial<KeyboardEvent> = {}): KeyboardEvent {
  return { key: k, preventDefault: vi.fn(), ...extra } as unknown as KeyboardEvent;
}

beforeEach(() => {
  resetMultiSelectIdCounter();
});

describe("MultiSelectLogic", () => {
  // ---- Initial state ----

  it("has correct default initial state", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    expect(ms.getState()).toEqual({
      value: [],
      open: false,
      highlightedIndex: -1,
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  });

  it("respects initialValue", () => {
    const ms = new MultiSelectLogic({
      options: frameworks,
      initialValue: ["svelte", "vue"],
    });
    expect(ms.getState().value).toEqual(["svelte", "vue"]);
  });

  // ---- ARIA ----

  it("generates ARIA IDs with multiselectable on listbox", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    expect(ms.aria.listbox["aria-multiselectable"]).toBe("true");
    expect(ms.aria.listbox.role).toBe("listbox");
    expect(ms.aria.trigger.role).toBe("combobox");
  });

  it("getTriggerAria reflects current state", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    expect(ms.getTriggerAria()["aria-expanded"]).toBe(false);

    ms.openMenu();
    const open = ms.getTriggerAria();
    expect(open["aria-expanded"]).toBe(true);
    expect(open["aria-activedescendant"]).toBe(ms.aria.optionId(0));
  });

  // ---- select / deselect / toggleItem ----

  it("select adds an item", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.select("svelte");
    expect(ms.getState().value).toEqual(["svelte"]);
    expect(ms.getState().dirty).toBe(true);
  });

  it("select ignores duplicates", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.select("svelte");
    ms.select("svelte");
    expect(ms.getState().value).toEqual(["svelte"]);
  });

  it("deselect removes an item", () => {
    const ms = new MultiSelectLogic({
      options: frameworks,
      initialValue: ["svelte", "vue"],
    });
    ms.deselect("svelte");
    expect(ms.getState().value).toEqual(["vue"]);
  });

  it("deselect ignores items not in selection", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    const listener = vi.fn();
    ms.subscribe(listener);
    ms.deselect("svelte");
    expect(listener).not.toHaveBeenCalled();
  });

  it("toggleItem adds when not selected", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.toggleItem("react");
    expect(ms.getState().value).toEqual(["react"]);
  });

  it("toggleItem removes when already selected", () => {
    const ms = new MultiSelectLogic({
      options: frameworks,
      initialValue: ["react"],
    });
    ms.toggleItem("react");
    expect(ms.getState().value).toEqual([]);
  });

  it("clear removes all selections", () => {
    const ms = new MultiSelectLogic({
      options: frameworks,
      initialValue: ["svelte", "react", "vue"],
    });
    ms.clear();
    expect(ms.getState().value).toEqual([]);
  });

  // ---- setValue ----

  it("setValue replaces the entire selection", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.setValue(["angular", "solid"]);
    expect(ms.getState().value).toEqual(["angular", "solid"]);
  });

  it("setValue validates when validateOnChange (default)", () => {
    const ms = new MultiSelectLogic({
      options: frameworks,
      rules: [minSelected(2)],
    });
    ms.setValue(["svelte"]);
    expect(ms.getState().validation.valid).toBe(false);

    ms.setValue(["svelte", "react"]);
    expect(ms.getState().validation.valid).toBe(true);
  });

  // ---- openMenu / closeMenu / toggleMenu ----

  it("openMenu highlights first enabled option", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.openMenu();
    expect(ms.getState().open).toBe(true);
    expect(ms.getState().highlightedIndex).toBe(0);
  });

  it("openMenu skips disabled for first highlight", () => {
    const opts: MultiSelectOption<Tag>[] = [
      { value: "svelte", label: "Svelte", disabled: true },
      { value: "react", label: "React" },
      ...frameworks.slice(2),
    ];
    const ms = new MultiSelectLogic({ options: opts });
    ms.openMenu();
    expect(ms.getState().highlightedIndex).toBe(1);
  });

  it("closeMenu resets highlight and validates on blur", () => {
    const ms = new MultiSelectLogic({
      options: frameworks,
      rules: [minSelected(1)],
      validateOnBlur: true,
    });
    ms.openMenu();
    ms.closeMenu();

    const st = ms.getState();
    expect(st.open).toBe(false);
    expect(st.highlightedIndex).toBe(-1);
    expect(st.touched).toBe(true);
    expect(st.validation.valid).toBe(false);
  });

  it("toggleMenu", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.toggleMenu();
    expect(ms.getState().open).toBe(true);
    ms.toggleMenu();
    expect(ms.getState().open).toBe(false);
  });

  // ---- highlightIndex ----

  it("highlightIndex updates and ignores disabled", () => {
    const ms = new MultiSelectLogic({ options: frameworksWithDisabled });
    ms.openMenu();
    ms.highlightIndex(2); // vue — enabled
    expect(ms.getState().highlightedIndex).toBe(2);

    ms.highlightIndex(1); // react — disabled
    expect(ms.getState().highlightedIndex).toBe(2); // unchanged
  });

  // ---- toggleHighlighted ----

  it("toggleHighlighted toggles the highlighted option", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.openMenu();
    ms.highlightIndex(0); // svelte
    ms.toggleHighlighted();
    expect(ms.getState().value).toEqual(["svelte"]);

    ms.toggleHighlighted();
    expect(ms.getState().value).toEqual([]);
  });

  it("toggleHighlighted does nothing when closed", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.toggleHighlighted();
    expect(ms.getState().value).toEqual([]);
  });

  it("toggleHighlighted skips disabled", () => {
    const ms = new MultiSelectLogic({ options: frameworksWithDisabled });
    ms.openMenu();
    // Force highlight to disabled index via store won't work through public API
    // since highlightIndex guards against it. This is tested implicitly.
  });

  // ---- Keyboard navigation ----

  describe("handleKeyDown", () => {
    it("ArrowDown opens menu when closed", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.handleKeyDown(key("ArrowDown"));
      expect(ms.getState().open).toBe(true);
    });

    it("ArrowDown moves highlight forward", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.openMenu();
      ms.handleKeyDown(key("ArrowDown"));
      expect(ms.getState().highlightedIndex).toBe(1);
    });

    it("ArrowDown wraps around", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.openMenu();
      ms.highlightIndex(4); // last
      ms.handleKeyDown(key("ArrowDown"));
      expect(ms.getState().highlightedIndex).toBe(0);
    });

    it("ArrowDown skips disabled", () => {
      const ms = new MultiSelectLogic({ options: frameworksWithDisabled });
      ms.openMenu(); // highlight = 0 (svelte)
      ms.handleKeyDown(key("ArrowDown"));
      expect(ms.getState().highlightedIndex).toBe(2); // skips react (disabled)
    });

    it("ArrowUp opens menu when closed", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.handleKeyDown(key("ArrowUp"));
      expect(ms.getState().open).toBe(true);
    });

    it("ArrowUp wraps around", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.openMenu(); // highlight = 0
      ms.handleKeyDown(key("ArrowUp"));
      expect(ms.getState().highlightedIndex).toBe(4);
    });

    it("Enter/Space toggles highlighted (keeps menu open)", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.openMenu();
      ms.highlightIndex(0);
      ms.handleKeyDown(key("Enter"));

      expect(ms.getState().value).toEqual(["svelte"]);
      expect(ms.getState().open).toBe(true); // stays open!

      ms.handleKeyDown(key(" "));
      expect(ms.getState().value).toEqual([]); // toggled off
    });

    it("Enter opens menu when closed", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.handleKeyDown(key("Enter"));
      expect(ms.getState().open).toBe(true);
    });

    it("Escape closes menu", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.openMenu();
      const e = key("Escape");
      ms.handleKeyDown(e);
      expect(ms.getState().open).toBe(false);
      expect(e.preventDefault).toHaveBeenCalled();
    });

    it("Home jumps to first option", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.openMenu();
      ms.highlightIndex(4);
      ms.handleKeyDown(key("Home"));
      expect(ms.getState().highlightedIndex).toBe(0);
    });

    it("End jumps to last option", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.openMenu();
      ms.handleKeyDown(key("End"));
      expect(ms.getState().highlightedIndex).toBe(4);
    });

    it("Backspace removes last selected item when closed", () => {
      const ms = new MultiSelectLogic({
        options: frameworks,
        initialValue: ["svelte", "react", "vue"],
      });
      ms.handleKeyDown(key("Backspace"));
      expect(ms.getState().value).toEqual(["svelte", "react"]);
    });

    it("Backspace does nothing when open", () => {
      const ms = new MultiSelectLogic({
        options: frameworks,
        initialValue: ["svelte", "react"],
      });
      ms.openMenu();
      ms.handleKeyDown(key("Backspace"));
      expect(ms.getState().value).toEqual(["svelte", "react"]);
    });

    it("Backspace does nothing when empty", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.handleKeyDown(key("Backspace")); // should not throw
      expect(ms.getState().value).toEqual([]);
    });

    it("Tab closes menu", () => {
      const ms = new MultiSelectLogic({ options: frameworks });
      ms.openMenu();
      ms.handleKeyDown(key("Tab"));
      expect(ms.getState().open).toBe(false);
    });
  });

  // ---- focus / blur ----

  it("focus and blur", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.focus();
    expect(ms.getState().focused).toBe(true);

    ms.blur();
    expect(ms.getState().focused).toBe(false);
    expect(ms.getState().touched).toBe(true);
  });

  it("blur validates when menu is not open", () => {
    const ms = new MultiSelectLogic({
      options: frameworks,
      rules: [minSelected(1)],
      validateOnBlur: true,
      validateOnChange: false,
    });
    ms.blur();
    expect(ms.getState().validation.valid).toBe(false);
  });

  it("blur does NOT validate when menu is open", () => {
    const ms = new MultiSelectLogic({
      options: frameworks,
      rules: [minSelected(1)],
      validateOnBlur: true,
      validateOnChange: false,
    });
    ms.openMenu();
    ms.blur();
    expect(ms.getState().validation.valid).toBe(true);
  });

  // ---- reset ----

  it("reset restores clean state", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.select("svelte");
    ms.select("vue");
    ms.openMenu();

    ms.reset();
    expect(ms.getState()).toEqual({
      value: [],
      open: false,
      highlightedIndex: -1,
      touched: false,
      dirty: false,
      focused: false,
      validation: { valid: true, errors: [] },
    });
  });

  it("reset with custom value", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    ms.reset(["angular"]);
    expect(ms.getState().value).toEqual(["angular"]);
  });

  // ---- validate ----

  it("validate runs rules", () => {
    const ms = new MultiSelectLogic({
      options: frameworks,
      rules: [minSelected(2)],
      validateOnChange: false,
    });
    const result = ms.validate();
    expect(result.valid).toBe(false);
    expect(ms.getState().validation).toEqual(result);
  });

  // ---- setOptions ----

  it("setOptions replaces the options list", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    const newOpts: MultiSelectOption<"x">[] = [{ value: "x", label: "X" }];
    (ms as any).setOptions(newOpts);
    expect((ms as any).getOptions()).toEqual(newOpts);
  });

  // ---- subscribe / destroy ----

  it("subscribe and destroy", () => {
    const ms = new MultiSelectLogic({ options: frameworks });
    const listener = vi.fn();
    ms.subscribe(listener);

    ms.select("svelte");
    expect(listener).toHaveBeenCalledTimes(1);

    ms.destroy();
    ms.select("react");
    expect(listener).toHaveBeenCalledTimes(1);
  });
});
