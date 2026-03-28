import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import ThemedTextInput from "../components/ThemedTextInput";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useSiteMembers } from "../hooks/useSiteMembers";
import { ROLES } from "../constants/roles";
import { useTabBarPadding } from "../hooks/useTabBarPadding";

const ROLE_LABELS = {
  [ROLES.MANAGER]: "Manager",
  [ROLES.FOREMAN]: "Foreman",
  [ROLES.SUBCONTRACTOR]: "Sub",
};

const ROLE_OPTIONS = [ROLES.FOREMAN, ROLES.SUBCONTRACTOR, ROLES.MANAGER];

export default function InviteMemberScreen({ navigation }) {
  const route = useRoute();
  const { siteId, siteName } = route.params || {};
  const { user } = useAuth();
  const tabBarPadding = useTabBarPadding();

  const { inviteByEmail, loading: inviting } = useSiteMembers({
    uid: user?.uid ?? "",
    name: user?.email ?? "",
  });

  const [emailsText, setEmailsText] = useState("");
  const [inviteRole, setInviteRole] = useState(ROLES.FOREMAN);
  const [resultMessage, setResultMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  const parseEmails = (text) =>
    text
      .split(/[\n,]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

  const handleInvite = async () => {
    const emails = parseEmails(emailsText);
    if (emails.length === 0) return;

    setResultMessage(null);
    setIsError(false);

    let successes = 0;
    let failures = [];

    for (const email of emails) {
      try {
        const result = await inviteByEmail({ siteId, siteName, email, role: inviteRole });
        if (result === "ok") {
          successes++;
        } else {
          failures.push(`${email}: not found`);
        }
      } catch (err) {
        failures.push(`${email}: ${err.message || "failed"}`);
      }
    }

    if (failures.length === 0) {
      setResultMessage(
        `${successes} invitation${successes !== 1 ? "s" : ""} sent successfully!`
      );
      setIsError(false);
      setEmailsText("");
    } else if (successes === 0) {
      setResultMessage(
        `Failed to send invites:\n${failures.join("\n")}`
      );
      setIsError(true);
    } else {
      setResultMessage(
        `${successes} sent successfully.\nFailed:\n${failures.join("\n")}`
      );
      setIsError(true);
    }
  };

  const emails = parseEmails(emailsText);
  const canSend = emails.length > 0 && !inviting;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <AppText variant="title" bold style={styles.title}>
            INVITE MEMBERS
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            {siteName}
          </AppText>
          <AppText variant="caption" style={styles.description}>
            Enter one or more email addresses, separated by commas or new lines.
          </AppText>
        </View>

        <Card style={styles.formCard}>
          <ThemedTextInput
            label="Email addresses"
            placeholder={"crew1@example.com\ncrew2@example.com, crew3@example.com"}
            value={emailsText}
            onChangeText={setEmailsText}
            autoCapitalize="none"
            keyboardType="email-address"
            multiline
            numberOfLines={6}
            inputStyle={styles.multilineInput}
            style={styles.emailInput}
          />

          {emails.length > 0 ? (
            <AppText variant="caption" style={styles.emailCount}>
              {emails.length} email{emails.length !== 1 ? "s" : ""} entered
            </AppText>
          ) : null}

          <AppText variant="caption" style={styles.roleLabel}>
            Role
          </AppText>
          <View style={styles.roleRow}>
            {ROLE_OPTIONS.map((r) => (
              <Button
                key={r}
                title={ROLE_LABELS[r]}
                variant={inviteRole === r ? "primary" : "secondary"}
                tone="positive"
                size="sm"
                onPress={() => setInviteRole(r)}
                style={styles.roleChip}
              />
            ))}
          </View>

          {resultMessage ? (
            <AppText
              variant="caption"
              style={[styles.resultText, isError ? styles.errorText : styles.successText]}
            >
              {resultMessage}
            </AppText>
          ) : null}
        </Card>

        <View style={styles.actions}>
          <Button
            title={inviting ? "Sending..." : `Send Invite${emails.length > 1 ? "s" : ""}`}
            variant="primary"
            tone="positive"
            onPress={handleInvite}
            loading={inviting}
            disabled={!canSend}
            fullWidth
          />
          <Button
            title="Back"
            variant="secondary"
            onPress={() => navigation.goBack()}
            fullWidth
          />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 32,
  },
  headerBlock: {
    marginBottom: 16,
  },
  title: {
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontWeight: "700",
    marginBottom: 8,
  },
  description: {
    opacity: 0.7,
  },
  formCard: {
    marginBottom: 16,
  },
  emailInput: {
    marginBottom: 4,
  },
  multilineInput: {
    minHeight: 120,
    textAlignVertical: "top",
    paddingTop: 14,
  },
  emailCount: {
    opacity: 0.6,
    marginBottom: 12,
  },
  roleLabel: {
    color: "#6b7280",
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  roleChip: {
    minWidth: 90,
  },
  resultText: {
    marginTop: 8,
    fontWeight: "700",
  },
  errorText: {
    color: "#dc2626",
  },
  successText: {
    color: "#16a34a",
  },
  actions: {
    gap: 8,
  },
});
