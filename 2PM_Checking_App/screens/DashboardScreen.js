import React from "react";
import { View, Text, StyleSheet } from "react-native"
import { firebase_auth } from "../firebaseConfig/firebaseConfig";


export default function DashboardScreen() {

  const user = firebase_auth.currentUser;
  const name = user ? user.displayName : "User";
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.welcome}>
        Hello {name} !
      </Text>
      <Text>Welcome to the 2PM Construction Coordination App</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  welcome: { fontSize: 30, marginBottom: 10 }
});