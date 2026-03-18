import React from "react";
import { View, StyleSheet } from "react-native";
import { colors } from "../constants/theme";
import AppText from "./AppText";

/**
 * NeobrutalInfoCard - Gamified info display with bold shadows and thick borders
 * 
 * Variants:
 * - "stacked": Classic neobrutal with offset shadow (default)
 * - "split": Two-tone card with colored accent strip
 * - "badge": Compact badge-style with icon slot
 * - "elevated": Extra-thick shadow for emphasis
 */
export default function NeobrutalInfoCard({
  variant = "stacked",
  children,
  accentColor = colors.primary,
  backgroundColor = "#fff",
  style,
}) {
  const renderVariant = () => {
    switch (variant) {
      case "split":
        return <SplitVariant accentColor={accentColor} backgroundColor={backgroundColor} style={style}>{children}</SplitVariant>;
      case "badge":
        return <BadgeVariant accentColor={accentColor} backgroundColor={backgroundColor} style={style}>{children}</BadgeVariant>;
      case "elevated":
        return <ElevatedVariant accentColor={accentColor} backgroundColor={backgroundColor} style={style}>{children}</ElevatedVariant>;
      case "stacked":
      default:
        return <StackedVariant accentColor={accentColor} backgroundColor={backgroundColor} style={style}>{children}</StackedVariant>;
    }
  };

  return renderVariant();
}

// VARIANT 1: STACKED - Classic neobrutal with offset shadow
function StackedVariant({ children, backgroundColor, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Shadow layer */}
      <View style={styles.shadow} />
      
      {/* Content face */}
      <View style={[styles.face, { backgroundColor }]}>
        {children}
      </View>
    </View>
  );
}

// VARIANT 2: SPLIT - Two-tone with colored accent strip on left
function SplitVariant({ children, accentColor, backgroundColor, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Shadow layer */}
      <View style={styles.shadow} />
      
      {/* Content face with split design */}
      <View style={[styles.face, styles.splitFace, { backgroundColor }]}>
        <View style={[styles.accentStrip, { backgroundColor: accentColor }]} />
        <View style={styles.splitContent}>
          {children}
        </View>
      </View>
    </View>
  );
}

// VARIANT 3: BADGE - Compact with optional icon slot
function BadgeVariant({ children, accentColor, backgroundColor, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Smaller shadow for compact look */}
      <View style={styles.badgeShadow} />
      
      {/* Colored border face */}
      <View style={[styles.face, styles.badgeFace, { 
        backgroundColor, 
        borderColor: accentColor,
        borderWidth: 3,
      }]}>
        {children}
      </View>
    </View>
  );
}

// VARIANT 4: ELEVATED - Extra-thick shadow for high emphasis
function ElevatedVariant({ children, accentColor, backgroundColor, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      {/* Thick shadow layer */}
      <View style={styles.elevatedShadow} />
      
      {/* Colored top border */}
      <View style={[styles.face, { backgroundColor }]}>
        <View style={[styles.topBorder, { backgroundColor: accentColor }]} />
        <View style={styles.elevatedContent}>
          {children}
        </View>
      </View>
    </View>
  );
}

// Helper components for structured content
export function InfoField({ label, value, style }) {
  return (
    <View style={[styles.fieldWrapper, style]}>
      <AppText variant="caption" style={styles.fieldLabel}>
        {label}
      </AppText>
      <AppText variant="body" bold style={styles.fieldValue}>
        {value}
      </AppText>
    </View>
  );
}

export function InfoSection({ title, children, style }) {
  return (
    <View style={[styles.sectionWrapper, style]}>
      {title && (
        <AppText variant="body" bold style={styles.sectionTitle}>
          {title}
        </AppText>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    marginVertical: 8,
  },
  
  // Shadows
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
  badgeShadow: {
    position: "absolute",
    top: 3,
    left: 3,
    right: -3,
    bottom: -3,
    backgroundColor: "#111",
    borderWidth: 2.5,
    borderColor: "#111",
  },
  elevatedShadow: {
    position: "absolute",
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: "#111",
    borderWidth: 2.5,
    borderColor: "#111",
  },
  
  // Base face
  face: {
    backgroundColor: "#fff",
    borderWidth: 2.5,
    borderColor: "#111",
    padding: 16,
    position: "relative",
  },
  
  // Split variant
  splitFace: {
    flexDirection: "row",
    padding: 0,
  },
  accentStrip: {
    width: 8,
  },
  splitContent: {
    flex: 1,
    padding: 16,
  },
  
  // Badge variant
  badgeFace: {
    padding: 12,
  },
  
  // Elevated variant
  topBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  elevatedContent: {
    paddingTop: 4,
  },
  
  // Content helpers
  fieldWrapper: {
    marginBottom: 12,
  },
  fieldLabel: {
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.7,
    marginBottom: 4,
  },
  fieldValue: {
    fontSize: 16,
  },
  sectionWrapper: {
    marginBottom: 8,
  },
  sectionTitle: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    fontSize: 14,
  },
});
