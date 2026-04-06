import React, { useRef, useState } from "react";
import { StyleSheet, View, TouchableOpacity, Animated } from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { ref, set } from "firebase/database";
import { firebase_auth, firebase_db } from "../firebaseConfig/firebaseConfig";
import ThemedTextInput from "../components/ThemedTextInput";
import Button from "../components/Button";
import AppText from "../components/AppText";
import Screen from "../components/Screen";

function RoleButton({ label, active, onPress }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: 4, duration: 80, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 4, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    onPress?.();
  };

  return (
    <View style={roleStyles.wrapper}>
      <View style={[roleStyles.shadow, active && roleStyles.shadowActive]} />
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            roleStyles.face,
            active && roleStyles.faceActive,
            { transform: [{ translateX }, { translateY }] },
          ]}
        >
          <AppText variant="body" bold style={[roleStyles.label, active && roleStyles.labelActive]}>
            {label}
          </AppText>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const roleStyles = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
    marginVertical: 4,
  },
  shadow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: "#111",
    borderWidth: 2.5,
    borderColor: "#111",
  },
  shadowActive: {
    backgroundColor: "#111",
  },
  face: {
    borderWidth: 2.5,
    borderColor: "#111",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  faceActive: {
    backgroundColor: "#111",
  },
  label: {
    letterSpacing: 1,
    textTransform: "uppercase",
    color: "#111",
    opacity: 0.7,
  },
  labelActive: {
    color: "#fff",
    opacity: 1,
  },
});

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
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

      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);

      await updateProfile(auth.currentUser, {
        displayName: `${cleanFirst} ${cleanLast}`,
      });

      await set(ref(firebase_db, `users/${cred.user.uid}`), {
        role,
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
    <Screen padding={{ paddingHorizontal: 24, paddingVertical: 32 }}>
      <View style={styles.inner}>
        <AppText variant="title" bold style={styles.header}>
          Create Account
        </AppText>

        <AppText variant="caption" bold style={styles.label}>
          Choose Role
        </AppText>
        <View style={styles.roleRow}>
          <RoleButton
            label="Foreman / Sub"
            active={role === "foreman"}
            onPress={() => setRole("foreman")}
          />
          <RoleButton
            label="Manager"
            active={role === "manager"}
            onPress={() => setRole("manager")}
          />
        </View>

        <ThemedTextInput
          label="First name"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <ThemedTextInput
          label="Last name"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <ThemedTextInput
          label="Email"
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
        <ThemedTextInput
          label="Password"
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <View style={styles.buttonContainer}>
          <Button title="Sign Up" onPress={handleSignUp} fullWidth />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            variant="secondary"
            title="Back to Login"
            onPress={() => navigation.goBack()}
            fullWidth
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: 24,
    textAlign: "center",
  },
  label: {
    opacity: 0.65,
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  roleRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  buttonContainer: {
    paddingVertical: 4,
  },
});
