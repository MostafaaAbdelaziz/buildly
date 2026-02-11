import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { useIssues } from "../context/IssuesContext";

export default function CreateIssueScreen({ navigation }) {
  const { addIssue } = useIssues();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");

  function handleSave() {
    if (!title.trim()) return;
    addIssue({ title: title.trim(), priority: priority.trim() });
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Issue</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter issue title" />

      <Text style={styles.label}>Priority</Text>

        <View style={styles.priorityRow}>
            {["Low", "Medium", "High"].map((p) => (
                <TouchableOpacity
                    key={p}
                    style={[styles.priorityBtn, priority === p && styles.priorityBtnActive]}
                    onPress={() => setPriority(p)}
                >
                    <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>
                        {p}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

      <TouchableOpacity style={styles.btn} onPress={handleSave}>
        <Text style={styles.btnText}>Save Issue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16 },
  label: { fontWeight: "700", marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12 },
  btn: { marginTop: 18, backgroundColor: "black", padding: 14, borderRadius: 12 },
  btnText: { color: "white", fontWeight: "800", textAlign: "center" },
  priorityRow: { flexDirection: "row", gap: 10, marginTop: 6 },
  priorityBtn: {flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#ddd", alignItems: "center",},
  priorityBtnActive: { backgroundColor: "black", borderColor: "black" },
  priorityText: { fontWeight: "700" },
  priorityTextActive: { color: "white" },
});