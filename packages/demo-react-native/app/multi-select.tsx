import {
  View,
  Text,
  Pressable,
  Modal,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLogic } from "@component-library/react-native";
import { MultiSelectLogic } from "@component-library/core";
import type { MultiSelectOption, ValidationRule } from "@component-library/core";
import { StateDebug } from "../components/StateDebug";
import { ValidationErrors } from "../components/ValidationErrors";
import { Colors, Spacing, Radius } from "../constants/theme";

type Framework = "react" | "svelte" | "vue" | "angular" | "solid";

const frameworks: MultiSelectOption<Framework>[] = [
  { value: "react", label: "React" },
  { value: "svelte", label: "Svelte" },
  { value: "vue", label: "Vue" },
  { value: "angular", label: "Angular" },
  { value: "solid", label: "Solid" },
];

const minSelected = (min: number): ValidationRule<Framework[]> => ({
  name: "minSelected",
  validate: (v) => (v.length >= min ? null : `Select at least ${min}`),
});

export default function MultiSelectScreen() {
  const [state, logic] = useLogic(
    () =>
      new MultiSelectLogic<Framework>({
        options: frameworks,
        rules: [minSelected(2)],
        validateOnChange: true,
      })
  );

  const getLabel = (v: Framework) =>
    frameworks.find((o) => o.value === v)?.label ?? v;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Frameworks you've used</Text>

      <Pressable
        style={[styles.trigger, state.open && styles.triggerOpen]}
        onPress={() => logic.toggleMenu()}
        accessibilityRole="button"
        accessibilityState={{ expanded: state.open }}
      >
        {state.value.length > 0 ? (
          <View style={styles.tags}>
            {state.value.map((v) => (
              <View key={v} style={styles.tag}>
                <Text style={styles.tagText}>{getLabel(v)}</Text>
                <Pressable
                  onPress={() => logic.deselect(v)}
                  hitSlop={8}
                  accessibilityLabel={`Remove ${getLabel(v)}`}
                >
                  <Text style={styles.tagRemove}>×</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.placeholder}>Select frameworks…</Text>
        )}
        <Text style={styles.chevron}>{state.open ? "▲" : "▼"}</Text>
      </Pressable>

      <Modal
        visible={state.open}
        transparent
        animationType="fade"
        onRequestClose={() => logic.closeMenu()}
      >
        <Pressable style={styles.overlay} onPress={() => logic.closeMenu()}>
          <View style={styles.dropdown}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select frameworks</Text>
              <Pressable onPress={() => logic.closeMenu()}>
                <Text style={styles.doneButton}>Done</Text>
              </Pressable>
            </View>
            <FlatList
              data={frameworks}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => {
                const isSelected = state.value.includes(item.value);
                return (
                  <Pressable
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => logic.toggleItem(item.value)}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        isSelected && styles.checkboxChecked,
                      ]}
                    >
                      {isSelected && (
                        <Text style={styles.checkmark}>✓</Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </View>
        </Pressable>
      </Modal>

      <ValidationErrors validation={state.validation} show={state.touched} />

      <StateDebug
        state={{
          value: state.value,
          open: state.open,
          touched: state.touched,
          valid: state.validation.valid,
        }}
      />

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => logic.reset()}>
          <Text style={styles.buttonText}>Reset</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => logic.clear()}>
          <Text style={styles.buttonText}>Clear</Text>
        </Pressable>
        <Pressable style={styles.button} onPress={() => logic.validate()}>
          <Text style={styles.buttonText}>Validate</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.xl, gap: Spacing.md },
  label: { fontSize: 14, fontWeight: "600", color: Colors.text },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 44,
    gap: Spacing.sm,
  },
  triggerOpen: { borderColor: Colors.borderFocus, borderWidth: 2 },
  placeholder: { fontSize: 15, color: Colors.textMuted },
  chevron: { fontSize: 10, color: Colors.textMuted, flexShrink: 0 },
  tags: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, flex: 1 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
  },
  tagText: { fontSize: 13, color: Colors.primary, fontWeight: "500" },
  tagRemove: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    maxHeight: 360,
    overflow: "hidden",
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownTitle: { fontSize: 16, fontWeight: "600", color: Colors.text },
  doneButton: { fontSize: 15, fontWeight: "600", color: Colors.primary },
  option: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  optionSelected: { backgroundColor: Colors.primaryLight },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: { color: Colors.textInverse, fontSize: 12, fontWeight: "700" },
  optionText: { fontSize: 15, color: Colors.text },
  optionTextSelected: { color: Colors.primary, fontWeight: "500" },
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
