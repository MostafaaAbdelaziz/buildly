export const colors = {
  primary: "#2563eb",
  neutral: "#f5f5f0",
  neutralBorder: "#e5e5e0",
  accent: "#dc2626",
  text: "#1a1a1a",
  textSecondary: "#6b7280",
  textOnPrimary: "#ffffff",
};

export const typography = {
  title: { fontSize: 22, fontWeight: "700" },
  body: { fontSize: 16, fontWeight: "400" },
  caption: { fontSize: 13, fontWeight: "400" },
};

// Button-specific palette tuned to the 2 p.m. check-in visuals.
// Button-specific palette tuned to the 2 p.m. check-in visuals.
export const buttonColors = {
  // Strong, saturated actions (READY / NOT READY, primary CTAs)
  primaryPositive: {
    background: "#16a34a",
    border: "#15803d",
  },
  primaryNegative: {
    background: colors.accent,
    border: "#b91c1c",
  },

  // Low-emphasis / tertiary versions (less saturated, smaller text)
  tertiaryPositive: {
    background: "#bbf7d0",
    border: "#16a34a",
  },
  tertiaryNegative: {
    background: "#fecaca",
    border: colors.accent,
  },

  // Neutral secondary button (e.g. confirm with photo)
  secondary: {
    background: colors.neutral,
    border: colors.neutralBorder,
  },

  shadow: "#111827",
};

export const layout = {
  floatingTabBarHeight: 72, // Icon height (48px) + padding (24px)
};
