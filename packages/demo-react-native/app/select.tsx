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
import { SelectLogic } from "@component-library/core";
import type { SelectOption, ValidationRule } from "@component-library/core";
import { StateDebug } from "../components/StateDebug";
import { ValidationErrors } from "../components/ValidationErrors";
import { Colors, Spacing, Radius } from "../constants/theme";

type Fruit = "apple" | "banana" | "cherry" | "mango" | "strawberry";

const fruits: SelectOption<Fruit>[] = [
  { value: "apple", label: "🍎 Apple" },
  { value: "banana", label: "🍌 Banana" },
  { value: "cherry", label: "🍒 Cherry" },
  { value: "mango", label: "🥭 Mango" },
  { value: "strawberry", label: "🍓 Strawberry" },
];

const required = (): ValidationRule<Fruit | null> => ({
  name: "required",
  validate: (v) => (v ? null : "Please select a fruit"),
});

export default function SelectScreen() {
  const [state, logic] = useLogic(
    () =>
      new SelectLogic<Fruit>({
        options: fruits,
        rules: [required()],
        validateOnBlur: true,
        validateOnChange: false,
      })
  );

  const selectedLabel = fruits.find((o) => o.value === state.value)?.label;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Favorite fruit</Text>

      <Pressable
        style={[styles.trigger, state.open && styles.triggerOpen]}
        onPress={() => logic.toggleMenu()}
        accessibilityRole="button"
        accessibilityState={{ expanded: state.open }}
      >
        <Text style={selectedLabel ? styles.triggerText : styles.placeholder}>
          {selectedLabel ?? "Choose a fruit…"}
        </Text>
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
            <Text style={styles.dropdownTitle}>Select a fruit</Text>
            <FlatList
              data={fruits}
              keyExtractor={(item) => item.value}
              renderItem={({ item, index }) => {
                const isSelected = state.value === item.value;
                const isHighlighted = state.highlightedIndex === index;
                return (
                  <Pressable
                    style={[
                      styles.option,
                      isHighlighted && styles.optionHighlighted,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => logic.setValue(item.value)}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected: isSelected }}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && <Text style={styles.checkIcon}>✓</Text>}
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
          value: state.value ?? "null",
          open: state.open,
          highlighted: state.highlightedIndex,
          touched: state.touched,
          valid: state.validation.valid,
        }}
      />

      <View style={styles.actions}>
        <Pressable style={styles.button} onPress={() => logic.reset()}>
          <Text style={styles.buttonText}>Reset</Text>
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
    paddingVertical: Spacing.sm + 2,
  },
  triggerOpen: { borderColor: Colors.borderFocus, borderWidth: 2 },
  triggerText: { fontSize: 15, color: Colors.text },
  placeholder: { fontSize: 15, color: Colors.textMuted },
  chevron: { fontSize: 10, color: Colors.textMuted },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    maxHeight: 320,
    overflow: "hidden",
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  optionHighlighted: { backgroundColor: Colors.background },
  optionSelected: { backgroundColor: Colors.primaryLight },
  optionText: { fontSize: 15, color: Colors.text },
  optionTextSelected: { color: Colors.primary, fontWeight: "600" },
  checkIcon: { color: Colors.primary, fontSize: 16, fontWeight: "700" },
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
