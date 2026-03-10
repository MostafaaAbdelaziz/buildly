import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";

export default function StatusCircle({ label, caption, size = 110 }) {
  return (
    <View style={styles.container}>
      <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
        <AppText variant="body" bold style={styles.label}>
          {label}
        </AppText>
      </View>
      {caption ? (
        <AppText variant="caption" style={styles.caption}>
          {caption}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  circle: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2.5,
    borderColor: colors.shadow || "#111",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  label: {
    textAlign: "center",
    paddingHorizontal: 8,
  },
  caption: {
    textAlign: "center",
    opacity: 0.7,
  },
});
