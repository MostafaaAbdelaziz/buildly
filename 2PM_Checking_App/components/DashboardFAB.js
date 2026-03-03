import React, { useState } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";

const MENU_ITEMS = [
  { key: "rfi", label: "RFI" },
  { key: "issue", label: "Issue" },
  { key: "contactPm", label: "Contact PM" },
];

export default function DashboardFAB({ navigation }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleAction(key) {
    setMenuOpen(false);
    if (key === "issue" && navigation) {
      navigation.navigate("CreateIssue");
    } else if (key === "rfi" || key === "contactPm") {
      // Placeholder
    }
  }

  return (
    <View style={styles.fabContainer}>
      {menuOpen && (
        <View style={styles.menu}>
          {MENU_ITEMS.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
              onPress={() => handleAction(item.key)}
            >
              <AppText variant="body">{item.label}</AppText>
            </Pressable>
          ))}
        </View>
      )}
      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() => setMenuOpen((o) => !o)}
      >
        <AppText variant="title" style={styles.fabLabel}>+</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    bottom: 24,
    right: 16,
    alignItems: "flex-end",
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutralBorder,
    paddingVertical: 4,
    marginBottom: 8,
    minWidth: 140,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemPressed: {
    opacity: 0.7,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabLabel: {
    color: colors.textOnPrimary,
    fontSize: 28,
    lineHeight: 32,
  },
});
