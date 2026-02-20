import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

export default function MapScreen() {
  const [marker, setMarker] = useState(null);

  const initialRegion = {
    latitude: 44.6488,
    longitude: -63.5752,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={initialRegion}
        onPress={(e) => setMarker(e.nativeEvent.coordinate)}
      >
        {marker && (
          <Marker
            coordinate={marker}
            title="New pin"
            description="Tap location chosen"
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
});
