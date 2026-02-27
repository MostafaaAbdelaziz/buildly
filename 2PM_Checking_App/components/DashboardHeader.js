import React from "react";
import { View, StyleSheet } from "react-native";
import AppText from "./AppText";

export default function DashboardHeader({ title }) {
  return (
    <View style={styles.header}>
      <AppText variant="title" style={styles.title}>
        {title || "HOME"}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    textAlign: "center",
  },
});
