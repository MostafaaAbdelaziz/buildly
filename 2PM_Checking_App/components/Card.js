import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../constants/theme";

export default function Card({ children, accent, style }) {
  return (
    <View style={[styles.card, accent && { borderLeftWidth: 4, borderLeftColor: colors.accent }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.neutralBorder,
    marginBottom: 10,
  },
});
