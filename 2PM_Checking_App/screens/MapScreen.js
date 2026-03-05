import React, { useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useIssues } from "../context/IssuesContext";

function pinColorFromPriority(priority) {
  const p = String(priority || "").toLowerCase();
  if (p === "high") return "red";
  if (p === "medium" || p === "moderate") return "yellow";
  if (p === "low") return "blue";
  return "gray";
}

function getIssueCoord(issue) {
  const lat = issue.location?.latitude ?? issue.latitude ?? issue.lat;
  const lng = issue.location?.longitude ?? issue.longitude ?? issue.lng;

  const latitude = typeof lat === "string" ? parseFloat(lat) : lat;
  const longitude = typeof lng === "string" ? parseFloat(lng) : lng;

  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }
  return null;
}

export default function MapScreen({ route, navigation }) {
  const { issues } = useIssues();

  const mode = route?.params?.mode || "view"; // "view" | "pick"
  const initialLocation = route?.params?.initialLocation || null;
  

  const [picked, setPicked] = useState(initialLocation);

  const issuesWithCoords = useMemo(() => {
    return (issues || [])
      .map((i) => ({ issue: i, coord: getIssueCoord(i) }))
      .filter((x) => x.coord);
  }, [issues]);

  const mapKey = useMemo(() => {
  const lastId = issues?.[0]?.id || "none";
  return `${issues?.length || 0}_${lastId}_${mode}`;
}, [issues, mode]);

  const initialRegion = useMemo(() => {
    if (picked) {
      return { ...picked, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    }
    if (issuesWithCoords.length > 0) {
      return { ...issuesWithCoords[0].coord, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    }
    return { latitude: 44.6488, longitude: -63.5752, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  }, [picked, issuesWithCoords]);

  function confirmPick() {
  if (!picked) return;
  setPicked(null);

  // send picked coords back to CreateIssue (stack)
  navigation.getParent()?.navigate("CreateIssue", {
    pickedLocation: picked,
    _ts: Date.now(),
  });

  // ✅ reset this tab back to normal view mode
  navigation.setParams({ mode: "view", initialLocation: null });
}

  return (
    <View style={styles.container}>
      <MapView
  key={mapKey}
  style={styles.map}
  initialRegion={initialRegion}
  onPress={(e) => {
    if (mode === "pick") setPicked(e.nativeEvent.coordinate);
  }}
>
        {mode === "pick" && picked && (
          <Marker coordinate={picked} pinColor="black" title="Selected location" />
        )}

        {mode === "view" &&
          issuesWithCoords.map(({ issue, coord }) => (
            <Marker
              key={issue.id}
              coordinate={coord}
              pinColor={pinColorFromPriority(issue.priority)}
              title={issue.title}
              description={`${issue.priority} • ${issue.status || ""}`}
              onCalloutPress={() => navigation.getParent()?.navigate("IssueDetail", { issue })}
            />
          ))}
      </MapView>

      {mode === "pick" ? (
        <TouchableOpacity
          style={[styles.fab, !picked && { opacity: 0.5 }]}
          disabled={!picked}
          onPress={confirmPick}
        >
          <Text style={styles.fabText}>Use this location</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  fab: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: "black",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  fabText: { color: "white", fontWeight: "900" },
});