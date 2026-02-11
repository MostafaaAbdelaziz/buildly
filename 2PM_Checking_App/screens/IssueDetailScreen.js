import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function IssueDetailScreen({ route }) {
  const issue = route?.params?.issue;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Issue Detail</Text>
      <Text style={styles.line}>Title: {issue?.title ?? "N/A"}</Text>
      <Text style={styles.line}>Status: {issue?.status ?? "N/A"}</Text>
      <Text style={styles.line}>Priority: {issue?.priority ?? "N/A"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 12, textAlign: "center" },
  line: { fontSize: 16, marginBottom: 8 },
});