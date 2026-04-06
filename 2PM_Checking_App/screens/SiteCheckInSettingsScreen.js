import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import { useRoute } from "@react-navigation/native";
import DateTimePicker from "@react-native-community/datetimepicker";
import Screen from "../components/Screen";
import AppText from "../components/AppText";
import Button from "../components/Button";
import Card from "../components/Card";
import { colors } from "../constants/theme";
import { useSiteDetail } from "../hooks/useSiteDetail";
import { updateSiteCheckInSettings } from "../services/siteRepository";
import { useTabBarPadding } from "../hooks/useTabBarPadding";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DEFAULT_WORK_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri
const DEFAULT_CHECK_IN_TIME = "14:00";

function parseTime(timeStr) {
  const [h, m] = (timeStr || DEFAULT_CHECK_IN_TIME).split(":").map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function formatDisplayTime(timeStr) {
  const [h, m] = (timeStr || DEFAULT_CHECK_IN_TIME).split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export default function SiteCheckInSettingsScreen({ navigation }) {
  const route = useRoute();
  const { siteId, siteName } = route.params || {};
  const tabBarPadding = useTabBarPadding();

  const { site, loading } = useSiteDetail(siteId);

  const initialTime = useMemo(
    () => parseTime(site?.checkInTime || DEFAULT_CHECK_IN_TIME),
    [site?.checkInTime]
  );
  const initialDays = useMemo(
    () => site?.workDays || DEFAULT_WORK_DAYS,
    [site?.workDays]
  );

  const [selectedTime, setSelectedTime] = useState(initialTime);
  const [selectedDays, setSelectedDays] = useState(initialDays);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync state when site data loads
  React.useEffect(() => {
    if (site) {
      setSelectedTime(parseTime(site.checkInTime || DEFAULT_CHECK_IN_TIME));
      setSelectedDays(site.workDays || DEFAULT_WORK_DAYS);
    }
  }, [site?.checkInTime, site?.workDays]);

  function toggleDay(dayIndex) {
    setSelectedDays((prev) =>
      prev.includes(dayIndex)
        ? prev.filter((d) => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  }

  async function handleSave() {
    if (selectedDays.length === 0) {
      Alert.alert("Select at least one workday", "Choose the days check-in reminders should be sent.");
      return;
    }
    setSaving(true);
    try {
      await updateSiteCheckInSettings(siteId, {
        checkInTime: formatTime(selectedTime),
        workDays: selectedDays,
      });
      Alert.alert("Saved", "Check-in settings updated. Push reminders will follow the new schedule.");
      navigation.goBack();
    } catch (e) {
      Alert.alert("Error", e?.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen padding={{ paddingHorizontal: 16, paddingVertical: 12 }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarPadding + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <AppText variant="title" bold style={[styles.title, styles.topTitle]}>
          Check-in Settings
        </AppText>
        <AppText variant="caption" style={styles.subtitle}>
          {siteName || site?.name || "this site"}
        </AppText>

        {loading ? (
          <AppText variant="body" style={styles.loadingText}>Loading…</AppText>
        ) : (
          <>
            {/* Time picker */}
            <Card style={styles.section}>
              <AppText variant="body" bold style={styles.sectionLabel}>
                Daily reminder time
              </AppText>
              <AppText variant="caption" style={styles.sectionHint}>
                All active members receive a push notification at this time.
              </AppText>

              {Platform.OS === "ios" ? (
                <View style={styles.iosPickerWrapper}>
                  <DateTimePicker
                    mode="time"
                    value={selectedTime}
                    display="spinner"
                    is24Hour={false}
                    onChange={(_, date) => { if (date) setSelectedTime(date); }}
                    style={styles.iosPicker}
                  />
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.timeButton}
                    onPress={() => setShowPicker(true)}
                    activeOpacity={0.7}
                  >
                    <AppText variant="body" bold style={styles.timeButtonText}>
                      {formatDisplayTime(formatTime(selectedTime))}
                    </AppText>
                    <AppText variant="caption" style={styles.timeButtonHint}>
                      Tap to change
                    </AppText>
                  </TouchableOpacity>

                  {showPicker && (
                    <DateTimePicker
                      mode="time"
                      value={selectedTime}
                      display="default"
                      is24Hour={false}
                      onChange={(_, date) => {
                        setShowPicker(false);
                        if (date) setSelectedTime(date);
                      }}
                    />
                  )}
                </>
              )}
            </Card>

            {/* Day picker */}
            <Card style={styles.section}>
              <AppText variant="body" bold style={styles.sectionLabel}>
                Active workdays
              </AppText>
              <AppText variant="caption" style={styles.sectionHint}>
                Reminders are only sent on the selected days.
              </AppText>

              <View style={styles.daysRow}>
                {DAY_LABELS.map((label, idx) => {
                  const isSelected = selectedDays.includes(idx);
                  return (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => toggleDay(idx)}
                      activeOpacity={0.7}
                      style={[
                        styles.dayChip,
                        isSelected && styles.dayChipSelected,
                      ]}
                    >
                      <AppText
                        variant="caption"
                        bold
                        style={[
                          styles.dayChipText,
                          isSelected && styles.dayChipTextSelected,
                        ]}
                      >
                        {label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Card>

            <Button
              testID="checkin-settings-save"
              title="Save settings"
              variant="primary"
              tone="positive"
              size="lg"
              fullWidth
              loading={saving}
              disabled={saving}
              onPress={handleSave}
              style={styles.saveBtn}
            />
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    marginBottom: 4,
  },
  topTitle: {
    marginTop: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    marginBottom: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 40,
  },
  section: {
    marginBottom: 16,
    padding: 16,
  },
  sectionLabel: {
    marginBottom: 4,
  },
  sectionHint: {
    color: colors.textSecondary,
    marginBottom: 14,
  },
  iosPickerWrapper: {
    alignItems: "center",
  },
  iosPicker: {
    width: "100%",
    height: 120,
  },
  timeButton: {
    borderWidth: 2.5,
    borderColor: "#111",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  timeButtonText: {
    fontSize: 24,
    letterSpacing: 1,
  },
  timeButtonHint: {
    color: colors.textSecondary,
    marginTop: 4,
  },
  daysRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayChip: {
    borderWidth: 2.5,
    borderColor: "#111",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 44,
    alignItems: "center",
  },
  dayChipSelected: {
    backgroundColor: "#111",
  },
  dayChipText: {
    color: colors.text,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  dayChipTextSelected: {
    color: "#fff",
  },
  saveBtn: {
    marginTop: 8,
  },
});
