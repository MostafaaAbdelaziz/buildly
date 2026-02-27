import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { get, ref } from "firebase/database";
import { firebase_auth, firebase_db } from "../firebaseConfig/firebaseConfig";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    try {
      const cred = await signInWithEmailAndPassword(
        firebase_auth,
        email.trim(),
        password
      );

      // Load role from DB
      const roleSnap = await get(ref(firebase_db, `users/${cred.user.uid}/role`));
      const role = roleSnap.exists() ? roleSnap.val() : "foreman";

      // Navigate (role will also be available via AuthContext if you use it)
      navigation.replace("Tabs", { role });

      alert(`Signed in as ${role}: ${email.trim()}`);
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome</Text>

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
        <Button title="Sign In" onPress={handleSignIn} />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Don't have an account? Sign Up"
          onPress={() => navigation.navigate("Register")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 16, backgroundColor: "#f2f2f2" },
  header: { fontSize: 24, marginBottom: 24, textAlign: "center" },
  input: { height: 40, borderColor: "#ccc", borderWidth: 1, marginBottom: 12, paddingHorizontal: 8, borderRadius: 4, backgroundColor: "white" },
  buttonContainer: { padding: 10 },
});