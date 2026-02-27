import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View, TouchableOpacity } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { firebase_auth, firebase_db } from "../firebaseConfig/firebaseConfig";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // ✅ role: "foreman" or "manager"
  const [role, setRole] = useState("foreman");

  const auth = firebase_auth;

  const handleSignUp = async () => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanFirst = firstName.trim();
      const cleanLast = lastName.trim();

      if (!cleanEmail) return alert("Please enter an email.");
      if (!password) return alert("Please enter a password.");
      if (!cleanFirst) return alert("Please enter first name.");
      if (!cleanLast) return alert("Please enter last name.");

      // Create auth user
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);

      // Set displayName
      await updateProfile(auth.currentUser, {
        displayName: `${cleanFirst} ${cleanLast}`,
      });

      // ✅ Save role + profile data in Realtime DB
      await set(ref(firebase_db, `users/${cred.user.uid}`), {
        role, // "manager" | "foreman"
        firstName: cleanFirst,
        lastName: cleanLast,
        email: cleanEmail,
        createdAt: Date.now(),
      });

      alert(`Sign up success. ${cleanEmail} (${role})`);
      navigation.replace("Login");
    } catch (error) {
      console.log("SIGNUP ERROR:", error.code, error.message);
      alert(error.code);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Registration</Text>

      <Text style={styles.label}>Choose Role</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity
          style={[styles.roleBtn, role === "foreman" && styles.roleBtnActive]}
          onPress={() => setRole("foreman")}
          activeOpacity={0.85}
        >
          <Text style={[styles.roleText, role === "foreman" && styles.roleTextActive]}>
            Foreman
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleBtn, role === "manager" && styles.roleBtnActive]}
          onPress={() => setRole("manager")}
          activeOpacity={0.85}
        >
          <Text style={[styles.roleText, role === "manager" && styles.roleTextActive]}>
            Manager
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={handleSignUp} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Back to Login" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16, backgroundColor: "#f2f2f2" },
  header: { fontSize: 24, marginBottom: 18, textAlign: "center", fontWeight: "900" },

  label: { fontWeight: "900", opacity: 0.65, marginBottom: 8 },

  roleRow: { flexDirection: "row", gap: 10, marginBottom: 12 },
  roleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "white",
  },
  roleBtnActive: { backgroundColor: "#111", borderColor: "#111" },
  roleText: { fontWeight: "900", opacity: 0.7 },
  roleTextActive: { color: "white", opacity: 1 },

  input: {
    height: 44,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "white",
  },
  buttonContainer: { paddingVertical: 6 },
});