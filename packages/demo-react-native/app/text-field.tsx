import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { useLogic } from "@component-library/react-native";
import { TextFieldLogic } from "@component-library/core";
import type { ValidationRule } from "@component-library/core";
import { StateDebug } from "../components/StateDebug";
import { ValidationErrors } from "../components/ValidationErrors";
import { Colors, Spacing, Radius } from "../constants/theme";

const required = (): ValidationRule<string> => ({
  name: "required",
  validate: (v) => (v.trim() ? null : "This field is required"),
});

const minLength = (min: number): ValidationRule<string> => ({
  name: "minLength",
  validate: (v) => (v.length >= min ? null : `Minimum ${min} characters`),
});

export default function TextFieldScreen() {
  const [state, logic] = useLogic(
    () =>
      new TextFieldLogic({
        rules: [required(), minLength(3)],
        validateOnBlur: true,
        validateOnChange: false,
      })
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Username</Text>

      <TextInput
        style={[
          styles.input,
          state.focused && styles.inputFocused,
          !state.validation.valid && state.touched && styles.inputError,
        ]}
        value={state.value}
        placeholder="Enter username"
        placeholderTextColor={Colors.textMuted}
        onChangeText={(v) => logic.setValue(v)}
        onFocus={() => logic.focus()}
        onBlur={() => logic.blur()}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <ValidationErrors validation={state.validation} show={state.touched} />

      <StateDebug
        state={{
          value: state.value || '""',
          touched: state.touched,
          dirty: state.dirty,
          focused: state.focused,
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
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  inputFocused: {
    borderColor: Colors.borderFocus,
    borderWidth: 2,
  },
  inputError: {
    borderColor: Colors.error,
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
