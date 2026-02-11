import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";

export default function CreateIssueScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Issue</Text>

      <Text style={styles.label}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholder="e.g., Missing materials"
      />

      <Text style={styles.label}>Details</Text>
      <TextInput
        value={details}
        onChangeText={setDetails}
        style={[styles.input, styles.multiline]}
        placeholder="Add context (who/what/where)"
        multiline
      />

      <TouchableOpacity
        style={styles.btn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.btnText}>Save (demo)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 16, textAlign: "center" },
  label: { fontWeight: "700", marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 12, padding: 12 },
  multiline: { height: 120, textAlignVertical: "top" },
  btn: { marginTop: 18, backgroundColor: "black", padding: 14, borderRadius: 12 },
  btnText: { color: "white", fontWeight: "800", textAlign: "center" },
});