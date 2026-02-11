import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function IssuesScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Issues</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.navigate("CreateIssue")}
      >
        <Text style={styles.btnText}>+ Create Issue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.btn, styles.secondary]}
        onPress={() =>
          navigation.navigate("IssueDetail", {
            issue: { title: "Missing materials", status: "Open", priority: "High" },
          })
        }
      >
        <Text style={styles.btnText}>Open Demo Issue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: "center" },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16, textAlign: "center" },
  btn: { backgroundColor: "black", padding: 14, borderRadius: 12, marginBottom: 12 },
  secondary: { backgroundColor: "#333" },
  btnText: { color: "white", fontWeight: "700", textAlign: "center" },
});