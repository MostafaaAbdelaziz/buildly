import React, { useState, useRef } from "react";
import { View, Pressable, Animated, StyleSheet } from "react-native";
import AppText from "./AppText";
import { colors } from "../constants/theme";

const MENU_ITEMS = [
  { key: "invite", label: "Invite Member", icon: "+" },
  { key: "delete", label: "Delete Site", icon: "×", destructive: true },
];

export default function SiteActionsMenu({ onInvite, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const translate = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  const handlePressIn = () => {
    Animated.timing(translate, {
      toValue: { x: 4, y: 4 },
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(translate, {
      toValue: { x: 0, y: 0 },
      duration: 80,
      useNativeDriver: true,
    }).start();
    setMenuOpen((o) => !o);
  };

  const handleAction = (key) => {
    setMenuOpen(false);
    if (key === "invite") {
      onInvite?.();
    } else if (key === "delete") {
      onDelete?.();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonWrapper}>
        <View style={styles.shadow} />
        <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.pressable}>
          <Animated.View
            style={[
              styles.button,
              {
                transform: [{ translateX: translate.x }, { translateY: translate.y }],
              },
            ]}
          >
            <AppText variant="title" style={styles.dotsLabel}>
              ⋮
            </AppText>
          </Animated.View>
        </Pressable>
      </View>

      {menuOpen && (
        <View style={styles.menuWrapper}>
          <View style={styles.menuShadow} />
          <View style={styles.menu}>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
                onPress={() => handleAction(item.key)}
              >
                <View style={[styles.iconCircle, item.destructive && styles.iconCircleDestructive]}>
                  <AppText variant="body" style={[styles.menuIcon, item.destructive && styles.menuIconDestructive]}>
                    {item.icon}
                  </AppText>
                </View>
                <AppText variant="body" style={[styles.menuLabel, item.destructive && styles.menuLabelDestructive]}>
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    right: 12,
    zIndex: 10,
  },
  buttonWrapper: {
    position: "relative",
    width: 40,
    height: 40,
  },
  shadow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: "#919191",
    borderWidth: 3,
    borderColor: "#919191",
    borderRadius: 8,
  },
  pressable: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  button: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: "#111",
    borderRadius: 8,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  dotsLabel: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.text,
    lineHeight: 28,
    marginTop: 7,
  },
  menuWrapper: {
    position: "absolute",
    top: 48,
    right: 0,
    zIndex: 20,
  },
  menuShadow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: "#d0d0d0",
    borderWidth: 3,
    borderColor: "#d0d0d0",
    borderRadius: 8,
  },
  menu: {
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#111",
    minWidth: 180,
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuItemPressed: {
    backgroundColor: colors.neutral,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral,
    borderWidth: 2,
    borderColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconCircleDestructive: {
    backgroundColor: "#fee",
    borderColor: colors.accent,
  },
  menuIcon: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    lineHeight: 18,
  },
  menuIconDestructive: {
    color: colors.accent,
  },
  menuLabel: {
    fontWeight: "600",
  },
  menuLabelDestructive: {
    color: colors.accent,
  },
});
