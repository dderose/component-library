import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { useLogic } from "@component-library/react-native";
import { RadioGroupLogic } from "@component-library/core";
import type { ValidationRule } from "@component-library/core";
import { StateDebug } from "../components/StateDebug";
import { ValidationErrors } from "../components/ValidationErrors";
import { Colors, Spacing, Radius } from "../constants/theme";

type Size = "sm" | "md" | "lg" | "xl";

const options: { value: Size; label: string; description: string }[] = [
  { value: "sm", label: "Small", description: "For compact layouts" },
  { value: "md", label: "Medium", description: "Default size" },
  { value: "lg", label: "Large", description: "For prominent elements" },
  { value: "xl", label: "Extra Large", description: "For hero sections" },
];

const required = (): ValidationRule<Size | null> => ({
  name: "required",
  validate: (v) => (v ? null : "Please select a size"),
});

export default function RadioGroupScreen() {
  const [state, logic] = useLogic(
    () =>
      new RadioGroupLogic<Size>({
        rules: [required()],
        validateOnChange: true,
      })
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Component size</Text>

      <View style={styles.radioGroup} accessibilityRole="radiogroup">
        {options.map((opt) => {
          const selected = state.value === opt.value;
          return (
            <Pressable
              key={opt.value}
              style={[styles.radioRow, selected && styles.radioRowSelected]}
              onPress={() => logic.setValue(opt.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
              <View style={styles.radioContent}>
                <Text style={[styles.radioLabel, selected && styles.radioLabelSelected]}>
                  {opt.label}
                </Text>
                <Text style={styles.radioDescription}>{opt.description}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ValidationErrors validation={state.validation} show={state.touched} />

      <StateDebug
        state={{
          value: state.value ?? "null",
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
  label: { fontSize: 14, fontWeight: "600", color: Colors.text },
  radioGroup: { gap: Spacing.sm },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
  },
  radioRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  radioContent: { flex: 1 },
  radioLabel: { fontSize: 15, fontWeight: "500", color: Colors.text },
  radioLabelSelected: { color: Colors.primary },
  radioDescription: { fontSize: 13, color: Colors.textMuted, marginTop: 2 },
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
