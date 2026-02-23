import React, { useRef } from "react";
import { Pressable, StyleSheet, ActivityIndicator, View, Animated } from "react-native";
import { colors, typography, buttonColors } from "../constants/theme";
import AppText from "./AppText";

export default function Button({
  title,
  onPress,
  variant = "primary",
  tone = "positive",
  disabled,
  loading,
  icon,
  style,
  textStyle,
  size = "md",
  fullWidth = false,
  ...rest
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const isDisabled = disabled || loading;

  const sizes = {
    sm: { paddingH: 14, paddingV: 10, shadow: 3 },
    md: { paddingH: 18, paddingV: 14, shadow: 4 },
    lg: { paddingH: 24, paddingV: 18, shadow: 5 },
  };
  const s = sizes[size] || sizes.md;

  const { backgroundColor, labelColor, spinnerColor, borderColor } = getVariantStyles(
    variant,
    isDisabled,
    tone
  );

  const handlePressIn = () => {
    if (isDisabled) return;
    Animated.parallel([
      Animated.timing(translateX, { toValue: s.shadow, duration: 80, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: s.shadow, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.timing(translateX, { toValue: 0, duration: 80, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
    if (!isDisabled) {
      onPress?.();
    }
  };

  return (
    <View style={[styles.buttonWrapper, fullWidth && styles.fullWidth, style]}>
      <View
        style={[
          styles.shadow,
          {
            top: s.shadow,
            left: s.shadow,
            backgroundColor: colors.shadow || "#111",
            borderColor: colors.shadow || "#111",
          },
        ]}
      />

      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[styles.pressableWrapper, fullWidth && styles.fullWidth]}
        {...rest}
      >
        <Animated.View
          style={[
            styles.buttonFace,
            {
              backgroundColor,
              borderColor,
              paddingHorizontal: s.paddingH,
              paddingVertical: s.paddingV,
              transform: [{ translateX }, { translateY }],
            },
            fullWidth && styles.fullWidth,
            isDisabled && styles.disabled,
          ]}
        >
          <View style={[styles.contentRow, fullWidth && styles.fullWidth]}>
            {loading && (
              <ActivityIndicator
                size="small"
                color={spinnerColor}
                style={styles.spinner}
              />
            )}
            {!!icon && !loading && <View style={styles.icon}>{icon}</View>}
            <AppText
              variant="body"
              bold
              style={[styles.label, { color: labelColor }, textStyle]}
              numberOfLines={1}
            >
              {title}
            </AppText>
          </View>
        </Animated.View>
      </Pressable>
    </View>
  );
}

function getVariantStyles(variant, disabled, tone) {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: buttonColors.secondary.background,
        borderColor: colors.shadow || "#111",
        labelColor: disabled ? colors.textSecondary : colors.text,
        spinnerColor: colors.text,
      };
    case "tertiary":
      const tertiaryPalette =
        tone === "negative" ? buttonColors.tertiaryNegative : buttonColors.tertiaryPositive;
      return {
        backgroundColor: tertiaryPalette.background,
        borderColor: colors.shadow || "#111",
        labelColor: disabled ? colors.textSecondary : tertiaryPalette.border,
        spinnerColor: tertiaryPalette.border,
      };
    case "primary":
    default:
      const primaryPalette =
        tone === "negative" ? buttonColors.primaryNegative : buttonColors.primaryPositive;
      return {
        backgroundColor: primaryPalette.background,
        borderColor: colors.shadow || "#111",
        labelColor: colors.textOnPrimary,
        spinnerColor: colors.textOnPrimary,
      };
  }
}

const styles = StyleSheet.create({
  buttonWrapper: {
    position: "relative",
    marginVertical: 4,
  },
  fullWidth: {
    width: "100%",
    alignItems: "center",
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
  pressableWrapper: {
    position: "relative",
  },
  buttonFace: {
    borderWidth: 2.5,
    borderColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  label: {
    ...typography.body,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  disabled: {
    opacity: 0.6,
  },
  spinner: {
    marginRight: 8,
  },
  icon: {
    marginRight: 8,
  },
});

