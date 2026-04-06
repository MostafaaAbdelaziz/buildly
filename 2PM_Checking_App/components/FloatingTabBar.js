import React, { useEffect, useRef } from "react";
import { View, Pressable, StyleSheet, Platform, Animated } from "react-native";
import { colors } from "../constants/theme";

const TAB_WIDTH = 48;
const GAP = 8;

export default function FloatingTabBar({ state, descriptors, navigation }) {

  const pressAnimations = useRef(
    state.routes.map(() => new Animated.Value(0))
  ).current;

  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  useEffect(() => {
    state.routes.forEach((_, index) => {
      const targetDepth = index === state.index ? 0.6 : 0;
      Animated.spring(pressAnimations[index], {
        toValue: targetDepth,
        useNativeDriver: true,
        damping: 18,
        stiffness: 220,
        mass: 0.7,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const depth = pressAnimations[index] || new Animated.Value(0);

          const scale = depth.interpolate({
            inputRange: [0, 0.6, 1],
            outputRange: [1, 0.96, 0.92],
          });

          const shadowRadius = depth.interpolate({
            inputRange: [0, 0.6, 1],
            outputRange: [8, 3, 1],
          });

          const shadowOpacity = depth.interpolate({
            inputRange: [0, 0.6, 1],
            outputRange: [0.22, 0.12, 0.06],
          });

          const innerScale = depth.interpolate({
            inputRange: [0, 0.6, 1],
            outputRange: [1, 0.98, 0.96],
          });

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
            <AnimatedPressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              onPressIn={() => {
                Animated.spring(depth, {
                  toValue: 1,
                  useNativeDriver: true,
                  damping: 20,
                  stiffness: 260,
                  mass: 0.7,
                }).start();
              }}
              onPressOut={() => {
                Animated.spring(depth, {
                  toValue: isFocused ? 0.6 : 0,
                  useNativeDriver: true,
                  damping: 18,
                  stiffness: 220,
                  mass: 0.7,
                }).start();
              }}
              style={[
                styles.tabItem,
                isFocused ? styles.tabItemActive : styles.tabItemInactive,
                {
                  transform: [{ scale }],
                  shadowRadius,
                  shadowOpacity,
                },
              ]}
            >
              {IconComponent && (
                <Animated.View
                  style={[
                    styles.iconWrapper,
                    {
                      transform: [{ scale: innerScale }],
                    },
                  ]}
                >
                  <IconComponent
                    color={isFocused ? colors.primary : colors.textSecondary}
                  />
                </Animated.View>
              )}
            </AnimatedPressable>
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
    backgroundColor: "#fdfcf5",
    borderRadius: 32,
    paddingVertical: 14,
    paddingHorizontal: 24,
    gap: 12,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 14,
    borderWidth: 2,
    borderColor: "#111827",
  },
  tabItem: {
    width: TAB_WIDTH,
    height: TAB_WIDTH,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    shadowColor: "#111827",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    backgroundColor: "#fefce8",
  },
  tabItemInactive: {
    backgroundColor: "#fefce8",
    borderColor: "#111827",
  },
  tabItemActive: {
    backgroundColor: colors.primaryLight || "#fde68a",
    borderColor: "#111827",
  },
  iconWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
});
