import { View, Text, StyleSheet } from "react-native";
import { Colors, Spacing, Radius } from "../constants/theme";

interface StateDebugProps {
  label?: string;
  state: Record<string, unknown>;
}

export function StateDebug({ label = "State", state }: StateDebugProps) {
  const entries = Object.entries(state).map(([key, value]) => {
    let display: string;
    if (value instanceof Set) {
      display = `[${[...value].join(", ")}]`;
    } else if (Array.isArray(value)) {
      display = `[${value.join(", ")}]`;
    } else if (typeof value === "object" && value !== null) {
      display = JSON.stringify(value);
    } else {
      display = String(value);
    }
    return `${key}=${display}`;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{entries.join(" | ")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
  },
  value: {
    fontSize: 11,
    fontFamily: "monospace",
    color: Colors.textMuted,
  },
});
