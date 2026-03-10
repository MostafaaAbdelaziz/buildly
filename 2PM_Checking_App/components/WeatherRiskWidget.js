import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import * as Location from "expo-location";

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

function messageFromCode(weatherCode) {
  const code = Number(weatherCode || 0);

  if ([95, 96, 99].includes(code)) return "Thunderstorm risk — consider pausing outdoor tasks.";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Rain expected — watch for slip hazards and delays.";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow/ice possible — verify traction and safety.";
  if ([45, 48].includes(code)) return "Foggy conditions — reduced visibility on site.";
  if ([0, 1].includes(code)) return "Clear/mostly clear — normal operations expected.";
  if ([2, 3].includes(code)) return "Cloudy — conditions stable but monitor changes.";
  return "Weather conditions available for site planning.";
}

export default function WeatherRiskWidget() {
  const [collapsed, setCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [wx, setWx] = useState(null);

  async function fetchWeather(latitude, longitude) {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,precipitation,wind_speed_10m,weather_code` +
      `&temperature_unit=celsius&wind_speed_unit=kmh&precipitation_unit=mm`;

    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Weather API error (${res.status}): ${text}`);
    }

    const data = await res.json();
    const current = data?.current;

    return {
      temp: Math.round(current?.temperature_2m ?? 0),
      precipitation: Number(current?.precipitation ?? 0),
      windKmh: Number(current?.wind_speed_10m ?? 0),
      weatherCode: Number(current?.weather_code ?? 0),
    };
  }

  async function loadWeather() {
    try {
      setLoading(true);
      setErrorMsg("");

      // Try GPS first
      const perm = await Location.requestForegroundPermissionsAsync();
      let coords = FALLBACK;

      if (perm.status === "granted") {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          coords = pos.coords;
        } catch {
          // GPS failed → fallback
          coords = FALLBACK;
        }
      } else {
        // permission denied → fallback
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
  const hint = useMemo(() => messageFromCode(wx?.weatherCode), [wx]);

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setCollapsed((v) => !v)}
        style={styles.headerRow}
      >
        <Text style={styles.headerTitle}>Weather Risk Widget</Text>
        <Text style={styles.chevron}>{collapsed ? "⌄" : "⌃"}</Text>
      </TouchableOpacity>

      {!collapsed && (
        <View style={styles.card}>
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator />
              <Text style={styles.muted}> Fetching weather...</Text>
            </View>
          ) : errorMsg ? (
            <>
              <Text style={styles.errorTitle}>Couldn’t load weather</Text>
              <Text style={styles.muted}>{errorMsg}</Text>

              <TouchableOpacity onPress={loadWeather} style={styles.retryBtn} activeOpacity={0.85}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.weatherRow}>
              <Text style={styles.icon}>🌦️</Text>

              <View style={{ flex: 1 }}>
                <View style={styles.tempRow}>
                  <Text style={styles.temp}>{wx?.temp}°</Text>
                  <Text style={styles.risk}>{risk}</Text>
                </View>

                <Text style={styles.subtitle}>{hint}</Text>

                <Text style={styles.details}>
                  Wind: {Math.round(wx?.windKmh)} km/h • Precip: {wx?.precipitation} mm
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
    paddingHorizontal: 20,
  },
  headerRow: {
    backgroundColor: "#ECECEC",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#111" },
  chevron: { fontSize: 16, color: "#555" },

  card: {
    marginTop: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#EEE",
    padding: 16,
  },
  loadingRow: { flexDirection: "row", alignItems: "center" },
  muted: { color: "#555", fontWeight: "600" },
  errorTitle: { color: "#b00020", fontWeight: "900", marginBottom: 4 },

  weatherRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  icon: { fontSize: 40 },
  tempRow: { flexDirection: "row", alignItems: "baseline", gap: 10 },
  temp: { fontSize: 40, fontWeight: "900", color: "#111" },
  risk: { fontSize: 22, fontWeight: "900", color: "#111" },
  subtitle: { marginTop: 2, color: "#555", fontWeight: "700" },
  details: { marginTop: 6, color: "#777", fontWeight: "600" },

  retryBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#ECECEC",
  },
  retryText: { fontWeight: "900", color: "#222" },
});