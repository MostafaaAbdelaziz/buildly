
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { firebase_auth } from "../firebaseConfig/firebaseConfig";

export default function RegisterScreen({ navigation }) {
  // State variables to track email and password inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // our authentication, initialized in the beginning
  const auth = firebase_auth;

   const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);

       await updateProfile(auth.currentUser, {
        displayName: `${firstName} ${lastName}`,
      });

      alert("Sign up success. User: " + email + " signed up.");
      navigation.replace("Login");
    } catch (error) {
      console.log(error.message);
      alert(error.message);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.header}>Registeration Page</Text>
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
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
        />
  
        <View style={styles.buttonContainer}>
          <Button title="Sign Up" onPress={handleSignUp} />
        </View>
      </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f2f2f2",
  },
  header: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  buttonContainer: {
    padding: 20,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    color: "#888",
  },
});
