import React, { useRef } from "react";
import { View, Pressable, Animated, StyleSheet, Platform } from "react-native";
import { colors } from "../constants/theme";
import AppText from "./AppText";

export default function NeobrutalIconButton({
  onPress,
  label = "+",
  size = 48,
  backgroundColor = colors.primary,
  style,
}) {
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
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      <View style={[styles.shadow, { borderRadius: size / 2 }]} />

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <Animated.View
          style={[
            styles.face,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor,
              transform: [{ translateX: translate.x }, { translateY: translate.y }],
            },
          ]}
        >
          <AppText
            variant="title"
            style={[
              styles.label,
              {
                color: colors.textOnPrimary,
                fontSize: size * 0.5,
                marginTop: Platform.OS === "ios" ? -2 : 0,
              },
            ]}
          >
            {label}
          </AppText>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  shadow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: "#111",
    borderWidth: 2.5,
    borderColor: "#111",
  },
  pressable: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
  face: {
    borderWidth: 2.5,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "900",
  },
});

