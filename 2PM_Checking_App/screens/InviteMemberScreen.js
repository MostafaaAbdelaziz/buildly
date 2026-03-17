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

  const { inviteByEmail, loading: inviting, error: inviteError } = useSiteMembers({
    uid: user?.uid ?? "",
    name: user?.email ?? "",
  });

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState(ROLES.FOREMAN);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviteSuccess(false);
    const result = await inviteByEmail({
      siteId,
      siteName,
      email: inviteEmail.trim(),
      role: inviteRole,
    });
    if (result === "ok") {
      setInviteEmail("");
      setInviteSuccess(true);
      setTimeout(() => {
        setInviteSuccess(false);
        navigation.goBack();
      }, 2000);
    }
  };

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerBlock}>
          <AppText variant="title" bold style={styles.title}>
            INVITE MEMBER
          </AppText>
          <AppText variant="body" style={styles.subtitle}>
            {siteName}
          </AppText>
          <AppText variant="caption" style={styles.description}>
            Enter the email address of the person you want to invite to this site.
          </AppText>
        </View>

        <Card style={styles.formCard}>
          <ThemedTextInput
            label="Email address"
            placeholder="crew@example.com"
            value={inviteEmail}
            onChangeText={setInviteEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.emailInput}
          />

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

          {inviteError ? (
            <AppText variant="caption" style={styles.errorText}>
              {inviteError}
            </AppText>
          ) : null}

          {inviteSuccess ? (
            <AppText variant="caption" style={styles.successText}>
              Invitation sent! Returning to site...
            </AppText>
          ) : null}
        </Card>

        <View style={styles.actions}>
          <Button
            title="Send Invite"
            variant="primary"
            tone="positive"
            onPress={handleInvite}
            loading={inviting}
            disabled={inviting || !inviteEmail.trim()}
            fullWidth
          />
          <Button
            title="Cancel"
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
    marginBottom: 16,
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
  errorText: {
    color: "#dc2626",
    marginTop: 8,
  },
  successText: {
    color: "#16a34a",
    fontWeight: "700",
    marginTop: 8,
  },
  actions: {
    gap: 8,
  },
});
