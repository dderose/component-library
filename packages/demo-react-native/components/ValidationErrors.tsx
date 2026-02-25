import { View, Text, StyleSheet } from "react-native";
import type { ValidationResult } from "@component-library/core";
import { Colors, Spacing } from "../constants/theme";

interface ValidationErrorsProps {
  validation: ValidationResult;
  show: boolean;
}

export function ValidationErrors({ validation, show }: ValidationErrorsProps) {
  if (!show || validation.valid) return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      {validation.errors.map((error, i) => (
        <Text key={i} style={styles.error}>
          {error}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.xs,
  },
  error: {
    fontSize: 13,
    color: Colors.error,
  },
});
