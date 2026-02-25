import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Colors, Spacing } from "../constants/theme";

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Component Library</Text>
      <Text style={styles.subtitle}>React Native Demo</Text>

      <Text style={styles.body}>
        This app showcases each component from{" "}
        <Text style={styles.mono}>@component-library/core</Text>, wired up with
        the React Native <Text style={styles.mono}>useLogic</Text> hook.
      </Text>

      <Text style={styles.body}>
        Each screen uses the headless logic class directly so you can see the raw
        state updates and how the API works. In a real app you'd wrap these in
        styled components.
      </Text>

      <Text style={styles.body}>
        Use the tabs below to navigate between component demos.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.xl, gap: Spacing.lg },
  title: { fontSize: 28, fontWeight: "700", color: Colors.text },
  subtitle: {
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: -Spacing.sm,
  },
  body: { fontSize: 15, lineHeight: 22, color: Colors.text },
  mono: {
    fontFamily: "monospace",
    fontSize: 13,
    backgroundColor: Colors.background,
    color: Colors.primary,
  },
});
