import React from "react";
import { Text, StyleSheet } from "react-native";
import { colors, typography } from "../constants/theme";

const variantStyles = {
  title: [typography.title, { color: colors.text }],
  body: [typography.body, { color: colors.text }],
  caption: [typography.caption, { color: colors.textSecondary }],
};

export default function AppText({ variant = "body", bold, children, style, ...rest }) {
  const base = variantStyles[variant] || variantStyles.body;
  const combined = [styles.base, ...base, bold && styles.bold, style];
  return (
    <Text style={combined} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {},
  bold: { fontWeight: "700" },
});
