import { View, Text, Pressable, Modal, StyleSheet, ScrollView, Animated } from "react-native";
import { useRef, useEffect } from "react";
import { useLogic } from "@component-library/react-native";
import { ModalLogic } from "@component-library/core";
import { StateDebug } from "../components/StateDebug";
import { Colors, Spacing, Radius } from "../constants/theme";

export default function ModalScreen() {
  const [state, logic] = useLogic(
    () =>
      new ModalLogic({
        closeOnEscape: true,
        closeOnOverlayClick: true,
      })
  );

  // Animated opacity driven by the status state machine
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const panelScale = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    if (state.status === "opening") {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(panelScale, {
          toValue: 1,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
      ]).start(() => {
        logic.finishOpen();
      });
    } else if (state.status === "closing") {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(panelScale, {
          toValue: 0.95,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start(() => {
        logic.finishClose();
      });
    }
  }, [state.status]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.description}>
        Uses the ModalLogic status state machine (closed → opening → open →
        closing → closed) to drive React Native animations.
      </Text>

      <Pressable
        style={styles.openButton}
        onPress={() => logic.open()}
      >
        <Text style={styles.openButtonText}>Open Modal</Text>
      </Pressable>

      <Modal
        visible={state.open}
        transparent
        animationType="none"
        onRequestClose={() => logic.close()}
        statusBarTranslucent
      >
        <Animated.View
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <Pressable
            style={styles.overlayPressable}
            onPress={() => logic.handleOverlayClick()}
          >
            <Animated.View
              style={[
                styles.panel,
                { transform: [{ scale: panelScale }] },
              ]}
            >
              <Pressable>
                {/* Inner Pressable prevents overlay dismiss when tapping panel */}
                <Text style={styles.title}>Dialog Title</Text>

                <Text style={styles.body}>
                  This modal demonstrates the ModalLogic status state machine. The
                  opening and closing animations are driven by the{" "}
                  <Text style={styles.mono}>status</Text> field, with{" "}
                  <Text style={styles.mono}>finishOpen()</Text> and{" "}
                  <Text style={styles.mono}>finishClose()</Text> called when
                  animations complete.
                </Text>

                <Text style={styles.body}>
                  Tap the overlay or press the button below to close.
                </Text>

                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.secondaryButton}
                    onPress={() => logic.close()}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    style={styles.primaryButton}
                    onPress={() => logic.close()}
                  >
                    <Text style={styles.primaryButtonText}>Confirm</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>

      <StateDebug
        state={{
          status: state.status,
          open: state.open,
          hasOpened: state.hasOpened,
        }}
      />

      <View style={styles.features}>
        <Text style={styles.featuresTitle}>Features</Text>
        <Text style={styles.featureItem}>
          • Status state machine: closed → opening → open → closing → closed
        </Text>
        <Text style={styles.featureItem}>
          • Animated.spring for open, Animated.timing for close
        </Text>
        <Text style={styles.featureItem}>
          • finishOpen() / finishClose() hooks for animation completion
        </Text>
        <Text style={styles.featureItem}>
          • Overlay dismiss via handleOverlayClick()
        </Text>
        <Text style={styles.featureItem}>
          • Android back button via onRequestClose
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.surface },
  content: { padding: Spacing.xl, gap: Spacing.md },
  description: { fontSize: 14, lineHeight: 21, color: Colors.textMuted },
  openButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: "center",
  },
  openButtonText: {
    color: Colors.textInverse,
    fontSize: 15,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
  },
  overlayPressable: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.xl,
  },
  panel: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    gap: Spacing.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  title: { fontSize: 20, fontWeight: "700", color: Colors.text },
  body: { fontSize: 14, lineHeight: 21, color: Colors.text },
  mono: {
    fontFamily: "monospace",
    fontSize: 12,
    backgroundColor: Colors.background,
    color: Colors.primary,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  secondaryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: { fontSize: 14, fontWeight: "500", color: Colors.text },
  primaryButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textInverse,
  },
  features: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.xs,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  featureItem: { fontSize: 13, lineHeight: 20, color: Colors.textMuted },
});
