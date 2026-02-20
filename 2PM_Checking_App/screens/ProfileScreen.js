import React from "react";
import { View, Text, StyleSheet, Button } from "react-native";
import { signOut } from "firebase/auth";
import { firebase_auth } from "../firebaseConfig/firebaseConfig";

export default function ProfileScreen({ navigation }) {
  const handleLogout = async () => {
    try {
      await signOut(firebase_auth);
      navigation.replace("Login");
    } catch (error) {
      console.log(error);
      Alert.alert("Logout failed", error?.message ?? "Unknown error");
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>User info + role (Foreman / PM) goes here.</Text>
      <View style={styles.logoutBtn}>
        <Button title="Log out" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  title: { fontSize: 24, fontWeight: "800", marginBottom: 10 },
  logoutBtn: { width: 200 },

});