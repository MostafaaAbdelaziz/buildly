import React, { useState } from "react";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { colors } from "../constants/theme";
import AppText from "./AppText";

/**
 * DatePickerInput - A themed date picker that uses native date selectors
 * 
 * Props:
 * - label: string (optional) - Label for the input
 * - value: string (optional) - Date value in YYYY-MM-DD format
 * - onChange: (dateString: string) => void - Callback with YYYY-MM-DD format
 * - placeholder: string (optional) - Placeholder text
 * - style: ViewStyle (optional) - Container style override
 */
export default function DatePickerInput({
  label,
  value,
  onChange,
  placeholder = "Select date",
  style,
}) {
  const [showPicker, setShowPicker] = useState(false);

  // Convert YYYY-MM-DD string to Date object
  const dateValue = value ? new Date(value + "T00:00:00") : new Date();

  // Format date for display
  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }

    if (event.type === "set" && selectedDate) {
      // Convert Date to YYYY-MM-DD format
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
      const day = String(selectedDate.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    } else if (event.type === "dismissed") {
      setShowPicker(false);
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <AppText variant="body" bold style={styles.label}>
          {label}
        </AppText>
      )}

      <View style={styles.inputWrapper}>
        {/* Display input */}
        <Pressable onPress={() => setShowPicker(true)} style={styles.pressable}>
          <View style={styles.inputShadow} />
          <View style={styles.inputContainer}>
            <View style={styles.input}>
              <AppText
                variant="body"
                style={displayValue ? styles.valueText : styles.placeholderText}
              >
                {displayValue || placeholder}
              </AppText>
            </View>
          </View>
        </Pressable>

        {/* Clear button */}
        {displayValue && (
          <Pressable onPress={handleClear} hitSlop={8} style={styles.clearBtn}>
            <AppText variant="caption" style={styles.clearText}>
              ✕
            </AppText>
          </Pressable>
        )}
      </View>

      {/* Native date picker */}
      {showPicker && (
        <>
          {Platform.OS === "ios" ? (
            <View style={styles.iosPickerContainer}>
              <View style={styles.iosPickerHeader}>
                <Pressable onPress={() => setShowPicker(false)} hitSlop={10}>
                  <AppText variant="body" bold style={styles.doneBtn}>
                    Done
                  </AppText>
                </Pressable>
              </View>
              <DateTimePicker
                value={dateValue}
                mode="date"
                onChange={handleDateChange}
                style={styles.iosPicker}
              />
            </View>
          ) : (
            <DateTimePicker
              value={dateValue}
              mode="date"
              display="calendar"
              onChange={handleDateChange}
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 12,
    opacity: 0.8,
  },
  inputWrapper: {
    position: "relative",
  },
  pressable: {
    position: "relative",
  },
  inputShadow: {
    position: "absolute",
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: "#9CA3AF",
    borderWidth: 2.5,
    borderColor: "#9CA3AF",
  },
  inputContainer: {
    position: "relative",
  },
  input: {
    minHeight: 52,
    borderWidth: 2.5,
    borderColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  valueText: {
    color: colors.text,
    fontWeight: "600",
  },
  placeholderText: {
    color: colors.textSecondary,
    fontWeight: "600",
  },
  clearBtn: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    padding: 4,
  },
  clearText: {
    color: colors.accent,
    fontWeight: "800",
    fontSize: 16,
  },

  // iOS picker styles
  iosPickerContainer: {
    backgroundColor: "#fff",
    borderWidth: 2.5,
    borderColor: "#111",
    marginTop: 8,
    overflow: "hidden",
  },
  iosPickerHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutralBorder,
  },
  doneBtn: {
    color: colors.primary,
  },
  iosPicker: {
    height: 200,
  },
});
