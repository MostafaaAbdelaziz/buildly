import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from "react-native";
import { colors, typography, buttonColors } from "../constants/theme";
import AppText from "./AppText";

/**
 * Button — shared action button component.
 *
 * Variants:
 * - primary: main CTA, filled with primary color.
 * - secondary: neutral background with primary border/text.
 * - tertiary: text-only, no border, for low-emphasis actions.
 *
 * Props:
 * - title: string (button label)
 * - onPress: () => void
 * - variant?: "primary" | "secondary" | "tertiary"
 * - tone?: "positive" | "negative" | "neutral" (for primary/tertiary color)
 * - disabled?: boolean
 * - loading?: boolean (shows spinner, disables press)
 * - icon?: React.ReactNode (rendered to the left of the label)
 * - style?: ViewStyle (container override)
 * - textStyle?: TextStyle (label override)
 * - ...rest: forwarded to TouchableOpacity
 */
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
  ...rest
}) {
  const [pressed, setPressed] = useState(false);
  const isDisabled = disabled || loading;

  const { containerStyle, labelColor, spinnerColor, isTertiary } = getVariantStyles(
    variant,
    isDisabled,
    tone
  );

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={isDisabled ? undefined : onPress}
      onPressIn={() => {
        if (!isDisabled) setPressed(true);
      }}
      onPressOut={() => {
        setPressed(false);
      }}
      style={[
        styles.base,
        containerStyle,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {/* Grainy overlay to mimic textured buttons */}
      <View pointerEvents="none" style={styles.grainLayer} />
      {loading && (
        <ActivityIndicator
          size="small"
          color={spinnerColor}
          style={styles.spinner}
        />
      )}
      {!!icon && !loading && <View style={styles.icon}>{icon}</View>}
      <AppText
        variant={isTertiary ? "caption" : "body"}
        bold
        style={[styles.label, { color: labelColor }, textStyle]}
        numberOfLines={1}
      >
        {title}
      </AppText>
    </TouchableOpacity>
  );
}

function getVariantStyles(variant, disabled, tone) {
  const toneKey = tone === "negative" ? "Negative" : "Positive";

  switch (variant) {
    case "secondary":
      return {
        containerStyle: {
          backgroundColor: buttonColors.secondary.background,
          borderColor: buttonColors.secondary.border,
          borderWidth: 1,
          shadowOpacity: 0.2,
        },
        labelColor: disabled ? colors.textSecondary : colors.text,
        spinnerColor: colors.text,
        isTertiary: false,
      };
    case "tertiary":
      const tertiaryPalette =
        tone === "negative" ? buttonColors.tertiaryNegative : buttonColors.tertiaryPositive;
      return {
        containerStyle: {
          backgroundColor: tertiaryPalette.background,
          borderColor: tertiaryPalette.border,
          borderWidth: 1,
          minHeight: 40,
          paddingVertical: 10,
          shadowOpacity: 0.2,
        },
        labelColor: disabled ? colors.textSecondary : tertiaryPalette.border,
        spinnerColor: tertiaryPalette.border,
        isTertiary: true,
      };
    case "primary":
    default:
      const primaryPalette =
        tone === "negative" ? buttonColors.primaryNegative : buttonColors.primaryPositive;
      return {
        containerStyle: {
          backgroundColor: primaryPalette.background,
          borderColor: primaryPalette.border,
          borderWidth: 1,
        },
        labelColor: colors.textOnPrimary,
        spinnerColor: colors.textOnPrimary,
        isTertiary: false,
      };
  }
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginVertical: 4,
    shadowColor: buttonColors.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    position: "relative",
    overflow: "hidden",
  },
  label: {
    ...typography.body,
  },
  pressed: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    transform: [{ translateY: 2 }],
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
  grainLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.18)",
    opacity: 0.6,
  },
});

