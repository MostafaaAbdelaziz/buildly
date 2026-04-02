import React, { useRef } from "react";
import { View, Pressable, Animated, StyleSheet, LayoutAnimation, Platform, UIManager } from "react-native";
import NeobrutalInfoCard from "./NeobrutalInfoCard";
import AppText from "./AppText";
import NeobrutalIconButton from "./NeobrutalIconButton";
import { colors } from "../constants/theme";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function DotsCollapseButton({ onPress, accessibilityLabel }) {
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
    onPress?.();
  };

  return (
    <View style={styles.dotsWrapper}>
      <View style={styles.dotsShadow} />
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.dotsPressable}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || "Expand or collapse section"}
      >
        <Animated.View
          style={[
            styles.dotsButton,
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
  );
}

/**
 * Neobrutal split card with section title, optional add (+) button, and ⋮ collapse control.
 */
export default function DashboardCollapsibleSection({
  title,
  accentColor = colors.primary,
  collapsed,
  onToggle,
  onAddPress,
  children,
  style,
}) {
  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (onToggle) onToggle();
  };

  return (
    <NeobrutalInfoCard variant="split" accentColor={accentColor} style={[styles.card, style]}>
      <View style={styles.inner}>
        <View style={styles.headerRow}>
          <AppText variant="body" bold style={styles.title} numberOfLines={1}>
            {title}
          </AppText>
          <View style={styles.headerRight}>
            {onAddPress ? (
              <NeobrutalIconButton onPress={onAddPress} size={40} style={styles.addBtn} />
            ) : null}
            <DotsCollapseButton onPress={handleToggle} accessibilityLabel={`${title} section`} />
          </View>
        </View>
        {!collapsed ? <View style={styles.body}>{children}</View> : null}
      </View>
    </NeobrutalInfoCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
  },
  inner: {
    width: "100%",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  title: {
    flex: 1,
    minWidth: 0,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addBtn: {
    marginLeft: 0,
  },
  body: {
    marginTop: 12,
  },
  dotsWrapper: {
    position: "relative",
    width: 40,
    height: 40,
  },
  dotsShadow: {
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
  dotsPressable: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  dotsButton: {
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
});
