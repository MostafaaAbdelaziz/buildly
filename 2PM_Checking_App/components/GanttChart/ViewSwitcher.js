import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { VIEW_MODES } from "./constants";
import { styles } from "./styles";

export function ViewSwitcher({ active, onChange, compact }) {
  const wrapStyle = compact ? styles.switcherWrapFloating : styles.switcherWrap;
  const pillStyle = compact ? styles.switcherPillFloating : styles.switcherPill;
  const textStyle = compact ? styles.switcherTextFloating : styles.switcherText;
  return (
    <View style={wrapStyle}>
      {VIEW_MODES.map((mode) => {
        const isActive = active === mode;
        return (
          <TouchableOpacity
            key={mode}
            onPress={() => onChange(mode)}
            style={[pillStyle, isActive && styles.switcherPillActive]}
            activeOpacity={0.8}
          >
            <Text style={[textStyle, isActive && styles.switcherTextActive]}>
              {mode}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
