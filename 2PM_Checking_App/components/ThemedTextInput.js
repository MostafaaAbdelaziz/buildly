/**
 * ThemedTextInput — shared text field for forms. 
 *
 * @example
 * // Basic (e.g. LoginScreen)
 * <ThemedTextInput placeholder="Email" value={email} onChangeText={setEmail} />
 *
 * @example
 * // With label and keyboard options (e.g. RegisterScreen)
 * <ThemedTextInput label="Email" placeholder="Email" keyboardType="email-address"
 *   autoCapitalize="none" value={email} onChangeText={setEmail} />
 *
 * @example
 * // With validation error
 * <ThemedTextInput label="Password" placeholder="Password" secureTextEntry
 *   value={password} onChangeText={setPassword} error={passwordError} />
 *
 * Props: label?, placeholder?, value, onChangeText, secureTextEntry?, keyboardType?,
 * autoCapitalize?, error?, style?, inputStyle?; other TextInput props forwarded via ...rest
 */
import React, { useState } from "react";
import { TextInput, View, StyleSheet } from "react-native";
import { colors, typography } from "../constants/theme";
import AppText from "./AppText";

export default function ThemedTextInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  style,
  inputStyle,
  ...rest
}) {
  const [focused, setFocused] = useState(false);

  const shadowOffset = focused ? 2 : 4;
  const inputTransform = focused ? 2 : 0;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <AppText variant="body" bold style={styles.label}>
          {label}
        </AppText>
      ) : null}
      
      <View style={styles.inputWrapper}>
        {/* Hard shadow */}
        <View
          style={[
            styles.inputShadow,
            {
              top: shadowOffset,
              left: shadowOffset,
            },
            error && styles.errorShadow,
          ]}
        />
        
        {/* Input field */}
        <View
          style={[
            styles.inputContainer,
            {
              transform: [
                { translateX: inputTransform },
                { translateY: inputTransform },
              ],
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              error && styles.inputError,
              inputStyle,
            ]}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            {...rest}
          />
        </View>
      </View>
      
      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}
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
  errorShadow: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
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
    color: colors.text,
    fontWeight: "600",
    fontSize: 16,
  },
  inputError: {
    borderColor: colors.accent,
  },
  error: {
    color: colors.accent,
    marginTop: 6,
    fontWeight: "700",
    fontSize: 12,
  },
});
