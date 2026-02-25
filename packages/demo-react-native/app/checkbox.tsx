import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useLogic } from "@component-library/react-native";
import { CheckboxLogic } from "@component-library/core";
import type { ValidationRule } from "@component-library/core";
import { StateDebug } from "../components/StateDebug";
import { ValidationErrors } from "../components/ValidationErrors";
import { Colors, Spacing, Radius } from "../constants/theme";

const mustAccept = (): ValidationRule<boolean> => ({
  name: "mustAccept",
  validate: (v) => (v ? null : "You must accept the terms"),
});

export default function CheckboxScreen() {
  const [state, logic] = useLogic(
    () =>
      new CheckboxLogic({
        rules: [mustAccept()],
        validateOnChange: true,
      })
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable
        style={styles.checkboxRow}
        onPress={() => logic.toggle()}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: state.checked }}
      >
        <View
          style={[styles.checkbox, state.checked && styles.checkboxChecked]}
        >
          {state.checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>I accept the terms and conditions</Text>
      </Pressable>

      <ValidationErrors validation={state.validation} show={state.touched} />

      <StateDebug
        state={{
          checked: state.checked,
          touched: state.touched,
          dirty: state.dirty,
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  checkbox: {
    width: 22,
    height: 22,
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
  checkmark: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: "700",
  },
  checkboxLabel: {
    fontSize: 15,
    color: Colors.text,
    flex: 1,
  },
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
