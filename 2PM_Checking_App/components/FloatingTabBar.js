import React from "react";
import { View, Pressable, StyleSheet, Platform } from "react-native";
import { colors } from "../constants/theme";

export default function FloatingTabBar({ state, descriptors, navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          const IconComponent = options.tabBarIcon;

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={[styles.tabItem, isFocused && styles.tabItemActive]}
            >
              {IconComponent && (
                <IconComponent
                  color={isFocused ? colors.textOnPrimary : colors.textSecondary}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
    pointerEvents: "box-none",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  tabItem: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  tabItemActive: {
    backgroundColor: colors.primary,
  },
});
