import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants/theme";

const DEFAULT_PADDING = { paddingHorizontal: 16, paddingVertical: 16 };

export default function Screen({ children, padding = DEFAULT_PADDING, style, edges = ["top"] }) {
  return <SafeAreaView style={[styles.root, padding, style]} edges={edges}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral,
  },
});
