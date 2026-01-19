import { View, Text, StyleSheet, Dimensions } from "react-native";
import { Coordinates, StopPoint } from "../types";

const { width } = Dimensions.get("window");

interface AdventureMapProps {
  route: Coordinates[];
  stops: StopPoint[];
}

export default function AdventureMap({ route, stops }: AdventureMapProps) {
  // Calculate bounds for positioning
  const lats = route.map((r) => r.lat);
  const lngs = route.map((r) => r.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const mapWidth = width - 40;
  const mapHeight = 300;

  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * (mapWidth - 60) + 30;
    const y = ((maxLat - lat) / (maxLat - minLat || 1)) * (mapHeight - 60) + 30;
    return { x, y };
  };

  // Generate SVG path for route
  const pathPoints = route.map((point) => {
    const pos = getPosition(point.lat, point.lng);
    return `${pos.x},${pos.y}`;
  });

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}>
        {/* Map background */}
        <View style={styles.mapBackground} />

        {/* Route line (simplified without SVG) */}
        {route.length > 1 && (
          <View style={styles.routeContainer}>
            {route.slice(0, -1).map((point, index) => {
              const start = getPosition(point.lat, point.lng);
              const end = getPosition(route[index + 1].lat, route[index + 1].lng);
              const length = Math.sqrt(
                Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
              );
              const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

              return (
                <View
                  key={index}
                  style={[
                    styles.routeLine,
                    {
                      left: start.x,
                      top: start.y,
                      width: length,
                      transform: [{ rotate: `${angle}deg` }],
                    },
                  ]}
                />
              );
            })}
          </View>
        )}

        {/* Stop markers */}
        {stops.map((stop, index) => {
          const pos = getPosition(stop.lat, stop.lng);
          return (
            <View
              key={index}
              style={[
                styles.stopMarker,
                {
                  left: pos.x - 20,
                  top: pos.y - 20,
                },
              ]}
            >
              <View style={styles.markerDot}>
                <Text style={styles.markerNumber}>{index + 1}</Text>
              </View>
              <View style={styles.markerLabel}>
                <Text style={styles.markerName}>{stop.name}</Text>
                <Text style={styles.markerPhotos}>{stop.photos} photos</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* Stops List */}
      <View style={styles.stopsList}>
        <Text style={styles.stopsTitle}>📍 Stops</Text>
        {stops.map((stop, index) => (
          <View key={index} style={styles.stopItem}>
            <View style={styles.stopNumber}>
              <Text style={styles.stopNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.stopInfo}>
              <Text style={styles.stopName}>{stop.name}</Text>
              <Text style={styles.stopPhotos}>{stop.photos} photos</Text>
            </View>
            {index < stops.length - 1 && <View style={styles.stopConnector} />}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  mapContainer: {
    backgroundColor: "#1e3a5f",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1e3a5f",
  },
  routeContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  routeLine: {
    position: "absolute",
    height: 3,
    backgroundColor: "#3b82f6",
    transformOrigin: "left center",
  },
  stopMarker: {
    position: "absolute",
    alignItems: "center",
  },
  markerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  markerNumber: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  markerLabel: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  markerName: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  markerPhotos: {
    color: "#94a3b8",
    fontSize: 8,
  },
  stopsList: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  stopsTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    position: "relative",
  },
  stopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stopNumberText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  stopPhotos: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  stopConnector: {
    position: "absolute",
    left: 13,
    top: 28,
    width: 2,
    height: 24,
    backgroundColor: "#334155",
  },
});