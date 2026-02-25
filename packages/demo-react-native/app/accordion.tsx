import { View, Text, Pressable, StyleSheet, ScrollView, LayoutAnimation, UIManager, Platform } from "react-native";
import { useLogic } from "@component-library/react-native";
import { AccordionLogic } from "@component-library/core";
import type { AccordionItem } from "@component-library/core";
import { StateDebug } from "../components/StateDebug";
import { Colors, Spacing, Radius } from "../constants/theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const items: (AccordionItem & { title: string; content: string })[] = [
  {
    id: "what",
    title: "What is this library?",
    content:
      "A headless, framework-agnostic component library. Business logic lives in pure TypeScript, with thin adapters for Svelte and React Native.",
  },
  {
    id: "how",
    title: "How does it work?",
    content:
      "Each component has a Logic class in core that manages state via an observable Store. Framework packages subscribe to that store using their native reactivity primitives.",
  },
  {
    id: "disabled",
    title: "This item is disabled",
    content: "You should never see this.",
    disabled: true,
  },
  {
    id: "why",
    title: "Why headless?",
    content:
      "Headless components give you full control over markup and styling while reusing battle-tested logic. You get accessibility and state management without being locked into a design system.",
  },
];

function AccordionInstance({
  logic,
  state,
}: {
  logic: AccordionLogic;
  state: ReturnType<AccordionLogic["getState"]>;
}) {
  const handleToggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    logic.toggle(id);
  };

  return (
    <View style={styles.accordion}>
      {items.map((item, index) => {
        const expanded = state.expandedItems.has(item.id);
        const isDisabled = !!item.disabled;
        const isFirst = index === 0;
        const isLast = index === items.length - 1;

        return (
          <View
            key={item.id}
            style={[
              styles.item,
              !isFirst && styles.itemBorder,
              isDisabled && styles.itemDisabled,
            ]}
          >
            <Pressable
              style={[
                styles.trigger,
                expanded && styles.triggerExpanded,
                isFirst && styles.triggerFirst,
                isLast && !expanded && styles.triggerLast,
              ]}
              onPress={() => handleToggle(item.id)}
              disabled={isDisabled}
              accessibilityRole="button"
              accessibilityState={{ expanded, disabled: isDisabled }}
            >
              <Text style={styles.triggerText}>{item.title}</Text>
              <Text style={styles.chevron}>{expanded ? "▲" : "▼"}</Text>
            </Pressable>

            {expanded && (
              <View
                style={[styles.panel, isLast && styles.panelLast]}
                accessibilityRole="summary"
              >
                <Text style={styles.panelText}>{item.content}</Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

export default function AccordionScreen() {
  const [singleState, singleLogic] = useLogic(
    () =>
      new AccordionLogic({
        items,
        initialExpanded: ["what"],
        multiple: false,
        collapsible: true,
      })
  );

  const [multiState, multiLogic] = useLogic(
    () =>
      new AccordionLogic({
        items,
        initialExpanded: ["what"],
        multiple: true,
        collapsible: true,
      })
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Single mode */}
      <Text style={styles.sectionTitle}>Single mode</Text>
      <Text style={styles.sectionMeta}>multiple: false</Text>
      <Text style={styles.sectionDescription}>
        Only one item can be open at a time. Opening a new item collapses the previous one.
      </Text>

      <AccordionInstance logic={singleLogic} state={singleState} />

      <StateDebug
        state={{
          expanded: singleState.expandedItems,
          focused: singleState.focusedItemId ?? "none",
        }}
      />

      {/* Multiple mode */}
      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Multiple mode</Text>
      <Text style={styles.sectionMeta}>multiple: true</Text>
      <Text style={styles.sectionDescription}>
        Multiple items can be open simultaneously. Expand All / Collapse All buttons work in this mode.
      </Text>

      <AccordionInstance logic={multiLogic} state={multiState} />

      <StateDebug
        state={{
          expanded: multiState.expandedItems,
          focused: multiState.focusedItemId ?? "none",
        }}
      />

      <View style={styles.actions}>
        <Pressable
          style={styles.button}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            multiLogic.expandAll();
          }}
        >
          <Text style={styles.buttonText}>Expand All</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            multiLogic.collapseAll();
          }}
        >
          <Text style={styles.buttonText}>Collapse All</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.xl, gap: Spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: Colors.text },
  sectionMeta: {
    fontSize: 12,
    fontFamily: "monospace",
    color: Colors.textMuted,
    backgroundColor: Colors.background,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 3,
    marginTop: -Spacing.xs,
  },
  sectionDescription: { fontSize: 14, color: Colors.textMuted, lineHeight: 20 },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: Spacing.sm,
  },
  accordion: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: "hidden",
  },
  item: {},
  itemBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  itemDisabled: { opacity: 0.5 },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    backgroundColor: Colors.surface,
  },
  triggerExpanded: { backgroundColor: Colors.background },
  triggerFirst: {
    borderTopLeftRadius: Radius.md,
    borderTopRightRadius: Radius.md,
  },
  triggerLast: {
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
  },
  triggerText: { fontSize: 15, fontWeight: "600", color: Colors.text, flex: 1 },
  chevron: { fontSize: 10, color: Colors.textMuted },
  panel: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  panelLast: {
    borderBottomLeftRadius: Radius.md,
    borderBottomRightRadius: Radius.md,
  },
  panelText: { fontSize: 14, lineHeight: 21, color: Colors.text },
  actions: { flexDirection: "row", gap: Spacing.sm },
  button: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
  },
  buttonText: { fontSize: 14, color: Colors.text },
});
