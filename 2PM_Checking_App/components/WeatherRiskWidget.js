import React, { useEffect, useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import * as Location from "expo-location";
import AppText from "./AppText";
import { colors } from "../constants/theme";

// fallback coords (Halifax)
const FALLBACK = { latitude: 44.6488, longitude: -63.5752 };

function riskFromOpenMeteo({ precipitation, windKmh, weatherCode }) {
  const p = Number(precipitation || 0);
  const w = Number(windKmh || 0);
  const code = Number(weatherCode || 0);

  if ([95, 96, 99].includes(code)) return "High";
  if (p >= 3 || w >= 45) return "High";
  if (p > 0 || w >= 25) return "Medium";
  return "Low";
}

function iconFromCode(weatherCode) {
  const code = Number(weatherCode || 0);

  if ([95, 96, 99].includes(code)) return "⛈️";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([0, 1].includes(code)) return "☀️";
  if ([2, 3].includes(code)) return "☁️";
  return "🌤️";
}

/**
 * Body-only weather block for use inside DashboardCollapsibleSection.
 * 7-day row is primary; current conditions are a small caption at the bottom.
 */
export default function WeatherRiskWidget() {
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [wx, setWx] = useState(null);

  async function fetchWeather(latitude, longitude) {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,precipitation,wind_speed_10m,weather_code` +
      `&daily=weather_code` +
      `&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm` +
      `&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Weather API error (${res.status}): ${text}`);
    }

    const data = await res.json();
    const current = data?.current;
    const daily = data?.daily;

    return {
      temp: Math.round(current?.temperature_2m ?? 0),
      precipitation: Number(current?.precipitation ?? 0),
      windKmh: Number(current?.wind_speed_10m ?? 0),
      weatherCode: Number(current?.weather_code ?? 0),
      daily:
        daily?.time?.map((t, i) => ({
          date: t,
          weatherCode: daily?.weather_code?.[i],
        })) || [],
    };
  }

  async function loadWeather() {
    try {
      setLoading(true);
      setErrorMsg("");

      const perm = await Location.requestForegroundPermissionsAsync();
      let coords = FALLBACK;

      if (perm.status === "granted") {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = pos.coords;
        } catch {
          coords = FALLBACK;
        }
      } else {
        coords = FALLBACK;
      }

      const data = await fetchWeather(coords.latitude, coords.longitude);
      setWx(data);
    } catch (e) {
      setErrorMsg(e?.message || "Failed to load weather.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadWeather();
  }, []);

  const risk = useMemo(() => riskFromOpenMeteo(wx || {}), [wx]);

  if (loading) {
    return (
      <View style={styles.loadingRow}>
        <ActivityIndicator color={colors.text} />
        <AppText variant="body" style={styles.muted}>
          {" "}
          Fetching weather...
        </AppText>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View>
        <AppText variant="body" bold style={styles.errorTitle}>
          Couldn&apos;t load weather
        </AppText>
        <AppText variant="caption" style={styles.muted}>
          {errorMsg}
        </AppText>
        <TouchableOpacity onPress={loadWeather} style={styles.retryBtn} activeOpacity={0.85}>
          <AppText variant="body" bold style={styles.retryText}>
            Retry
          </AppText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.forecastRow}>
        {wx?.daily?.map((day, idx) => {
          const d = new Date(day.date + "T12:00:00Z");
          const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
          return (
            <View key={idx} style={styles.forecastDay}>
              <AppText style={styles.forecastIcon}>{iconFromCode(day.weatherCode)}</AppText>
              <AppText variant="caption" bold style={styles.forecastDate}>
                {dayName}
              </AppText>
            </View>
          );
        })}
      </View>

      <AppText variant="caption" style={styles.todayStrip}>
        Now {wx?.temp}° • Risk {risk} • Wind {Math.round(wx?.windKmh)} km/h • Precip {wx?.precipitation} mm
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingRow: { flexDirection: "row", alignItems: "center" },
  muted: { color: colors.textSecondary },
  errorTitle: { color: colors.accent, marginBottom: 4 },

  forecastRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  forecastDay: {
    alignItems: "center",
  },
  forecastIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  forecastDate: {
    color: colors.textSecondary,
  },

  todayStrip: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutralBorder,
    color: colors.textSecondary,
  },

  retryBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: colors.neutral,
    borderWidth: 1.5,
    borderColor: colors.neutralBorder,
  },
  retryText: { color: colors.text },
});
