import React, { useMemo, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import MapView from "react-native-map-clustering";
import { Marker } from "react-native-maps";
import { useAuth } from "../context/AuthContext";
import { useSites } from "../hooks/useSites";
import { useFirestoreIssuesBySites } from "../hooks/useFirestoreIssues";

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

function getSiteCoord(site) {
  const lat = site.location?.latitude;
  const lng = site.location?.longitude;
  const latitude = typeof lat === "string" ? parseFloat(lat) : lat;
  const longitude = typeof lng === "string" ? parseFloat(lng) : lng;
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    return { latitude, longitude };
  }
  return null;
}

export default function MapScreen({ route, navigation }) {
  const { user } = useAuth();
  const { sites } = useSites(user?.uid);
  const siteIds = useMemo(() => sites.map((s) => s.id), [sites]);
  const { issues } = useFirestoreIssuesBySites(siteIds);
  const tabBarHeight = useBottomTabBarHeight();

  const mode = route?.params?.mode || "view"; // "view" | "pick"
  const initialLocation = route?.params?.initialLocation || null;

  const [picked, setPicked] = useState(initialLocation);

  const issuesWithCoords = useMemo(() => {
    return (issues || [])
      .filter((i) => i.status !== "Resolved")
      .map((i) => ({ issue: i, coord: getIssueCoord(i) }))
      .filter((x) => x.coord);
  }, [issues]);

  const sitesWithCoords = useMemo(() => {
    return (sites || [])
      .map((s) => ({ site: s, coord: getSiteCoord(s) }))
      .filter((x) => x.coord);
  }, [sites]);

  const initialRegion = useMemo(() => {
    if (picked) {
      return { ...picked, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    }
    if (issuesWithCoords.length > 0) {
      return { ...issuesWithCoords[0].coord, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    }
    if (sitesWithCoords.length > 0) {
      return { ...sitesWithCoords[0].coord, latitudeDelta: 0.05, longitudeDelta: 0.05 };
    }
    return { latitude: 44.6488, longitude: -63.5752, latitudeDelta: 0.05, longitudeDelta: 0.05 };
  }, [picked, issuesWithCoords, sitesWithCoords]);

  function confirmPick() {
    if (!picked) return;
    setPicked(null);

    const returnTo = route?.params?.returnTo ?? "CreateIssue";

    if (returnTo === "NewSite") {
      navigation.navigate("Dashboard", {
        screen: "NewSite",
        params: {
          pickedLocation: picked,
          siteName: route?.params?.siteName,
          _ts: Date.now(),
        },
      });
    } else {
      navigation.getParent()?.navigate("CreateIssue", {
        pickedLocation: picked,
        _ts: Date.now(),
        siteId: route?.params?.siteId,
        siteName: route?.params?.siteName,
        linkedNotificationId: route?.params?.linkedNotificationId,
      });
    }

    navigation.setParams({
      mode: "view",
      initialLocation: null,
      returnTo: undefined,
      siteName: undefined,
    });
  }

  return (
    <View style={styles.container}>
      <MapView
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

        {mode === "view" &&
          sitesWithCoords.map(({ site, coord }) => (
            <Marker
              key={`site-${site.id}`}
              coordinate={coord}
              title={site.name}
              tracksViewChanges={false}
            >
              <Text style={styles.homeEmoji}>🏠</Text>
            </Marker>
          ))}
      </MapView>

      {mode === "pick" ? (
        <TouchableOpacity
          style={[
            styles.fab,
            { bottom: tabBarHeight + 38 },
            !picked && { opacity: 0.5 },
          ]}
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
  homeEmoji: {
    fontSize: 28,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    left: 16,
    right: 16,
    backgroundColor: "black",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  fabText: { color: "white", fontWeight: "900" },
});
