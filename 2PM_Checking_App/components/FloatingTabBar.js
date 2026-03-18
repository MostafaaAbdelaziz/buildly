import React, { useEffect, useRef } from "react";
import { View, Pressable, StyleSheet, Platform, Animated } from "react-native";
import { colors } from "../constants/theme";

export default function FloatingTabBar({ state, descriptors, navigation }) {
  const indicatorPosition = useRef(new Animated.Value(0)).current;
  const TAB_WIDTH = 48;
  const GAP = 8;

  useEffect(() => {
    Animated.spring(indicatorPosition, {
      toValue: state.index * (TAB_WIDTH + GAP),
      useNativeDriver: true,
      damping: 15,
      stiffness: 150,
      mass: 1,
    }).start();
  }, [state.index]);

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <Animated.View
          style={[
            styles.indicatorContainer,
            {
              transform: [{ translateX: indicatorPosition }],
            },
          ]}
        >
          <View style={styles.pixelatedBorder}>
            {/* Top edge pixels */}
            <View style={styles.topEdge}>
              <View style={[styles.pixel, styles.corner]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.corner]} />
            </View>
            {/* Middle section */}
            <View style={styles.middleSection}>
              <View style={[styles.pixel, styles.side]} />
              <View style={styles.innerSpace} />
              <View style={[styles.pixel, styles.side]} />
            </View>
            {/* Bottom edge pixels */}
            <View style={styles.bottomEdge}>
              <View style={[styles.pixel, styles.corner]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.edge]} />
              <View style={[styles.pixel, styles.corner]} />
            </View>
          </View>
        </Animated.View>
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
              style={styles.tabItem}
            >
              {IconComponent && (
                <IconComponent
                  color={isFocused ? colors.primary : colors.textSecondary}
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
  indicatorContainer: {
    position: "absolute",
    width: 48,
    height: 48,
    top: 12,
    left: 20,
  },
  pixelatedBorder: {
    width: 48,
    height: 48,
  },
  topEdge: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  middleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    flex: 1,
  },
  bottomEdge: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  pixel: {
    backgroundColor: colors.primary,
  },
  corner: {
    width: 4,
    height: 4,
  },
  edge: {
    width: 4,
    height: 3,
  },
  side: {
    width: 3,
    height: 42,
  },
  innerSpace: {
    flex: 1,
  },
  tabItem: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});
