import React from "react";
import { View, Text, StyleSheet } from "react-native"
import { firebase_auth } from "../firebaseConfig/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../constants/roles";
import { getRoleConfig } from "../constants/roleConfig";

export default function DashboardScreen() {
  const { user, role } = useAuth();
  //const user = firebase_auth.currentUser;
  
  const name = user ? user.displayName : "User";
  const roleLabel = role ? ROLES[role] : "User";
  const roleConfig = getRoleConfig(role);
  const homeTitle = roleConfig.homeTitle;


  return (
    <View style={styles.container}>
      <Text style={styles.title}>{homeTitle}</Text>
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
