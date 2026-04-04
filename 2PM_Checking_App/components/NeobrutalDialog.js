import React from "react";
import { View, StyleSheet, Modal, TouchableWithoutFeedback } from "react-native";
import { colors } from "../constants/theme";
import AppText from "./AppText";
import ThemedTextInput from "./ThemedTextInput";
import Button from "./Button";

/**
 * NeobrutalDialog — full-screen overlay with a bold, blocky dialog card.
 *
 * Props:
 * - visible: boolean
 * - title: string
 * - description?: string
 * - value: string
 * - onChangeText: (text: string) => void
 * - placeholder?: string
 * - inputLabel?: string (default "Site name")
 * - multiline?: boolean
 * - onOk: () => void
 * - onCancel: () => void
 */
export default function NeobrutalDialog({
  visible,
  title,
  description,
  value,
  onChangeText,
  placeholder,
  inputLabel = "Site name",
  multiline = false,
  onOk,
  onCancel,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.cardWrapper}>
              <View style={styles.cardShadow} />

              <View style={styles.card}>
                <AppText variant="title" bold style={styles.title}>
                  {title}
                </AppText>

                {description ? (
                  <AppText variant="body" style={styles.description}>
                    {description}
                  </AppText>
                ) : null}

                <ThemedTextInput
                  label={inputLabel}
                  placeholder={placeholder || "Enter site name"}
                  value={value}
                  onChangeText={onChangeText}
                  style={styles.input}
                  autoCapitalize={multiline ? "sentences" : "words"}
                  multiline={multiline}
                  inputStyle={multiline ? { minHeight: 120, textAlignVertical: "top" } : undefined}
                />

                <View style={styles.buttonsRow}>
                  <Button
                    title="Cancel"
                    variant="secondary"
                    onPress={onCancel}
                    size="sm"
                    style={styles.button}
                  />
                  <Button
                    title="OK"
                    variant="primary"
                    onPress={onOk}
                    size="sm"
                    style={styles.button}
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 420,
    position: "relative",
  },
  cardShadow: {
    position: "absolute",
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: "#111",
    borderWidth: 3,
    borderColor: "#111",
  },
  card: {
    backgroundColor: colors.neutral || "#f5f5f0",
    borderWidth: 3,
    borderColor: "#111",
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  title: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
  },
  input: {
    marginTop: 8,
    marginBottom: 12,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    minWidth: 110,
  },
});

