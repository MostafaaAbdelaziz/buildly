import React from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { firebase_auth } from "../firebaseConfig/firebaseConfig";
import { useAuth } from "../context/AuthContext";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../constants/theme";
import { useTabBarPadding } from "../hooks/useTabBarPadding";

export default function ProfileScreen({ navigation }) {
  const { user, role } = useAuth();
  const tabBarPadding = useTabBarPadding();

  const handleLogout = async () => {
    Alert.alert(
      "Log out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: async () => {
            try {
              await signOut(firebase_auth);
              navigation.replace("Login");
            } catch (error) {
              console.log(error);
              Alert.alert("Logout failed", error?.message ?? "Unknown error");
            }
          },
        },
      ]
    );
  };

  function getRoleDisplay(role) {
    if (!role) return "Unknown";
    if (role === "manager") return "Project Manager";
    if (role === "foreman") return "Foreman";
    return role.charAt(0).toUpperCase() + role.slice(1);
  }

  function getRoleBadgeColor(role) {
    if (role === "manager") return colors.primary;
    if (role === "foreman") return "#16a34a";
    return colors.textSecondary;
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title" bold style={styles.title}>
          Profile
        </AppText>

        <Card style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarCircle}>
              <AppText variant="title" bold style={styles.avatarText}>
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "?"}
              </AppText>
            </View>
          </View>

          <View style={styles.userInfo}>
            <AppText variant="body" bold style={styles.userName}>
              {user?.displayName || "User"}
            </AppText>
            <AppText variant="caption" style={styles.userEmail}>
              {user?.email || "No email"}
            </AppText>
          </View>

          <View
            style={[
              styles.roleBadge,
              { backgroundColor: getRoleBadgeColor(role) },
            ]}
          >
            <AppText variant="body" bold style={styles.roleText}>
              {getRoleDisplay(role)}
            </AppText>
          </View>
        </Card>

        <View style={styles.section}>
          <AppText variant="body" bold style={styles.sectionLabel}>
            Account
          </AppText>

          <Card>
            <View style={styles.infoRow}>
              <AppText variant="body" style={styles.infoLabel}>
                Email
              </AppText>
              <AppText variant="body" style={styles.infoValue}>
                {user?.email || "Not set"}
              </AppText>
            </View>
          </Card>

          <Card>
            <View style={styles.infoRow}>
              <AppText variant="body" style={styles.infoLabel}>
                Display Name
              </AppText>
              <AppText variant="body" style={styles.infoValue}>
                {user?.displayName || "Not set"}
              </AppText>
            </View>
          </Card>

          <Card>
            <View style={styles.infoRow}>
              <AppText variant="body" style={styles.infoLabel}>
                Role
              </AppText>
              <AppText variant="body" bold style={styles.infoValue}>
                {getRoleDisplay(role)}
              </AppText>
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <AppText variant="body" bold style={styles.sectionLabel}>
            About
          </AppText>

          <Card>
            <AppText variant="body" style={styles.aboutText}>
              Bob is your job site assistant for daily check-ins, issue tracking, and project coordination.
            </AppText>
            <AppText variant="caption" style={styles.versionText}>
              Version 1.0.0
            </AppText>
          </Card>
        </View>

        <Button
          variant="primary"
          tone="negative"
          title="Log out"
          onPress={handleLogout}
          fullWidth
          style={styles.logoutBtn}
        />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 28, // Additional padding on top of tab bar padding
  },

  title: {
    marginBottom: 20,
  },

  profileCard: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 24,
  },

  avatarSection: {
    marginBottom: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.shadow || "#111",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.neutral,
  },
  avatarText: {
    color: colors.textOnPrimary,
    fontSize: 32,
  },

  userInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  userName: {
    marginBottom: 4,
  },
  userEmail: {
    color: colors.textSecondary,
  },

  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2.5,
    borderColor: colors.shadow || "#111",
  },
  roleText: {
    color: colors.textOnPrimary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    marginBottom: 12,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    color: colors.textSecondary,
  },
  infoValue: {
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },

  aboutText: {
    lineHeight: 22,
    marginBottom: 12,
  },
  versionText: {
    color: colors.textSecondary,
  },

  logoutBtn: {
    marginTop: 16,
  },
});