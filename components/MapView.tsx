import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from "react-native";
import { Adventure } from "../types";

const { width, height } = Dimensions.get("window");

// Conditionally import MapLibre only on native platforms
let MapLibreGL: any = null;
if (Platform.OS !== "web") {
  try {
    MapLibreGL = require("@maplibre/maplibre-react-native").default;
    MapLibreGL.setAccessToken(null); // MapLibre doesn't need a token for free tile sources
  } catch (e) {
    console.log("MapLibre not available");
  }
}

interface MapViewProps {
  adventures: Adventure[];
  onAdventurePress: (id: string) => void;
}

// Web fallback component
function WebMapFallback({ adventures, onAdventurePress }: MapViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <View style={styles.mapBackground}>
          <Text style={styles.mapEmoji}>🗺️</Text>
        </View>

        {adventures.map((adventure) => {
          const x = ((adventure.coordinates.lng + 180) / 360) * (width - 40);
          const y = ((90 - adventure.coordinates.lat) / 180) * (height * 0.5);

          return (
            <Pressable
              key={adventure.id}
              style={[
                styles.pin,
                {
                  left: Math.max(20, Math.min(x, width - 60)),
                  top: Math.max(20, Math.min(y, height * 0.4)),
                },
              ]}
              onPress={() => onAdventurePress(adventure.id)}
            >
              <View style={styles.pinMarker}>
                <Text style={styles.pinEmoji}>📍</Text>
              </View>
              <View style={styles.pinLabel}>
                <Text style={styles.pinTitle} numberOfLines={1}>
                  {adventure.title}
                </Text>
                <Text style={styles.pinSubtitle}>
                  {adventure.mediaCount} photos
                </Text>
              </View>
            </Pressable>
          );
        })}

        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Your Adventures</Text>
          <Text style={styles.legendSubtitle}>
            {adventures.length} trips • Tap a pin to explore
          </Text>
        </View>
      </View>

      <View style={styles.listOverlay}>
        {adventures.slice(0, 3).map((adventure) => (
          <Pressable
            key={adventure.id}
            style={styles.listItem}
            onPress={() => onAdventurePress(adventure.id)}
          >
            <View style={styles.listItemDot} />
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{adventure.location}</Text>
              <Text style={styles.listItemDate}>{adventure.startDate}</Text>
            </View>
            <Text style={styles.listItemArrow}>→</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// Native MapLibre component
function NativeMapView({ adventures, onAdventurePress }: MapViewProps) {
  if (!MapLibreGL) {
    return <WebMapFallback adventures={adventures} onAdventurePress={onAdventurePress} />;
  }

  // Calculate bounds to fit all adventures
  const coordinates = adventures.map((a) => [a.coordinates.lng, a.coordinates.lat]);
  
  // Default center if no adventures
  const defaultCenter = coordinates.length > 0
    ? [
        coordinates.reduce((sum, c) => sum + c[0], 0) / coordinates.length,
        coordinates.reduce((sum, c) => sum + c[1], 0) / coordinates.length,
      ]
    : [0, 20];

  return (
    <View style={styles.container}>
      <MapLibreGL.MapView
        style={styles.map}
        styleURL="https://demotiles.maplibre.org/style.json"
        logoEnabled={false}
        attributionEnabled={true}
        attributionPosition={{ bottom: 8, right: 8 }}
      >
        <MapLibreGL.Camera
          zoomLevel={2}
          centerCoordinate={defaultCenter}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* Adventure markers */}
        {adventures.map((adventure) => (
          <MapLibreGL.MarkerView
            key={adventure.id}
            coordinate={[adventure.coordinates.lng, adventure.coordinates.lat]}
          >
            <Pressable
              style={styles.markerContainer}
              onPress={() => onAdventurePress(adventure.id)}
            >
              <View style={styles.marker}>
                <Text style={styles.markerEmoji}>📍</Text>
              </View>
              <View style={styles.markerLabel}>
                <Text style={styles.markerTitle} numberOfLines={1}>
                  {adventure.location}
                </Text>
              </View>
            </Pressable>
          </MapLibreGL.MarkerView>
        ))}

        {/* Route lines for each adventure */}
        {adventures.map((adventure) => {
          if (adventure.route.length < 2) return null;
          
          const routeCoordinates = adventure.route.map((point) => [point.lng, point.lat]);
          
          return (
            <MapLibreGL.ShapeSource
              key={`route-${adventure.id}`}
              id={`route-${adventure.id}`}
              shape={{
                type: "Feature",
                properties: {},
                geometry: {
                  type: "LineString",
                  coordinates: routeCoordinates,
                },
              }}
            >
              <MapLibreGL.LineLayer
                id={`routeLine-${adventure.id}`}
                style={{
                  lineColor: "#3b82f6",
                  lineWidth: 3,
                  lineOpacity: 0.8,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </MapLibreGL.ShapeSource>
          );
        })}
      </MapLibreGL.MapView>

      {/* Legend overlay */}
      <View style={styles.legendOverlay}>
        <Text style={styles.legendTitle}>Your Adventures</Text>
        <Text style={styles.legendSubtitle}>
          {adventures.length} trips • Tap a pin to explore
        </Text>
      </View>

      {/* Adventure list overlay */}
      <View style={styles.listOverlay}>
        {adventures.slice(0, 3).map((adventure) => (
          <Pressable
            key={adventure.id}
            style={styles.listItem}
            onPress={() => onAdventurePress(adventure.id)}
          >
            <View style={styles.listItemDot} />
            <View style={styles.listItemContent}>
              <Text style={styles.listItemTitle}>{adventure.location}</Text>
              <Text style={styles.listItemDate}>{adventure.startDate}</Text>
            </View>
            <Text style={styles.listItemArrow}>→</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function MapView(props: MapViewProps) {
  if (Platform.OS === "web") {
    return <WebMapFallback {...props} />;
  }
  return <NativeMapView {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    borderRadius: 16,
    margin: 20,
    overflow: "hidden",
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: "#1e3a5f",
    borderRadius: 16,
    margin: 20,
    overflow: "hidden",
    position: "relative",
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.3,
  },
  mapEmoji: {
    fontSize: 200,
  },
  pin: {
    position: "absolute",
    alignItems: "center",
  },
  pinMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  pinEmoji: {
    fontSize: 20,
  },
  pinLabel: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    maxWidth: 120,
  },
  pinTitle: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  pinSubtitle: {
    color: "#94a3b8",
    fontSize: 8,
  },
  legend: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    padding: 12,
    borderRadius: 10,
  },
  legendOverlay: {
    position: "absolute",
    top: 36,
    left: 36,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    padding: 12,
    borderRadius: 10,
  },
  legendTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  legendSubtitle: {
    color: "#94a3b8",
    fontSize: 11,
    marginTop: 2,
  },
  listOverlay: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 12,
    padding: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  listItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3b82f6",
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  listItemDate: {
    color: "#64748b",
    fontSize: 11,
  },
  listItemArrow: {
    color: "#64748b",
    fontSize: 16,
  },
  markerContainer: {
    alignItems: "center",
  },
  marker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 20,
  },
  markerLabel: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  markerTitle: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
});