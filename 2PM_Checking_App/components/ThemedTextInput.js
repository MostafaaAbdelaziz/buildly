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

  const borderColor = error
    ? colors.accent
    : focused
      ? colors.primary
      : colors.neutralBorder;

  return (
    <View style={[styles.container, style]}>
      {label ? (
        <AppText variant="body" bold style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <TextInput
        style={[
          styles.input,
          { borderColor },
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
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#fff",
    color: colors.text,
    ...typography.body,
  },
  error: {
    color: colors.accent,
    marginTop: 4,
  },
});
