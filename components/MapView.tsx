import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from "react-native";
import { Adventure } from "../types";

const { width, height } = Dimensions.get("window");

// Conditionally import MapLibre for all platforms
let MapLibreGL: any = null;
try {
  MapLibreGL = require("@maplibre/maplibre-react-native").default;
  if (Platform.OS === "web") {
    // For web, we need to set up MapLibre GL JS
    MapLibreGL.setAccessToken(null); // MapLibre doesn't need a token
  }
} catch (e) {
  console.log("MapLibre not available:", e);
}

interface MapViewProps {
  adventures: Adventure[];
  onAdventurePress: (id: string) => void;
}

// Web fallback component with styled map placeholder
function WebMapFallback({ adventures, onAdventurePress }: MapViewProps) {
  const lats = adventures.map((a) => a.coordinates.lat);
  const lngs = adventures.map((a) => a.coordinates.lng);
  const minLat = Math.min(...lats, -90);
  const maxLat = Math.max(...lats, 90);
  const minLng = Math.min(...lngs, -180);
  const maxLng = Math.max(...lngs, 180);

  const mapWidth = width - 40;
  const mapHeight = 400;

  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * (mapWidth - 60) + 30;
    const y = ((maxLat - lat) / (maxLat - minLat || 1)) * (mapHeight - 60) + 30;
    return { x: Math.max(30, Math.min(x, mapWidth - 30)), y: Math.max(30, Math.min(y, mapHeight - 30)) };
  };

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}>
        {/* Map background with grid */}
        <View style={styles.mapBackground}>
          <View style={styles.gridOverlay}>
            {[...Array(8)].map((_, i) => (
              <View key={`h-${i}`} style={[styles.gridLine, { top: `${i * 12.5}%`, width: '100%', height: 1 }]} />
            ))}
            {[...Array(12)].map((_, i) => (
              <View key={`v-${i}`} style={[styles.gridLine, { left: `${i * 8.33}%`, height: '100%', width: 1 }]} />
            ))}
          </View>
          
          {/* World continents as simple shapes */}
          <View style={styles.continentsContainer}>
            {/* North America */}
            <View style={[styles.continent, { 
              left: '8%', top: '20%', width: '15%', height: '25%',
              borderRadius: 20, transform: [{ rotate: '-10deg' }]
            }]} />
            {/* South America */}
            <View style={[styles.continent, { 
              left: '18%', top: '45%', width: '8%', height: '30%',
              borderRadius: 15, transform: [{ rotate: '15deg' }]
            }]} />
            {/* Europe */}
            <View style={[styles.continent, { 
              left: '48%', top: '18%', width: '8%', height: '15%',
              borderRadius: 8
            }]} />
            {/* Africa */}
            <View style={[styles.continent, { 
              left: '50%', top: '30%', width: '10%', height: '35%',
              borderRadius: 12
            }]} />
            {/* Asia */}
            <View style={[styles.continent, { 
              left: '60%', top: '15%', width: '25%', height: '30%',
              borderRadius: 18
            }]} />
            {/* Australia */}
            <View style={[styles.continent, { 
              left: '75%', top: '60%', width: '12%', height: '10%',
              borderRadius: 10
            }]} />
          </View>
        </View>

        {/* Adventure markers */}
        {adventures.map((adventure, index) => {
          const pos = getPosition(adventure.coordinates.lat, adventure.coordinates.lng);
          return (
            <Pressable
              key={adventure.id}
              style={[styles.marker, { left: pos.x - 16, top: pos.y - 16 }]}
              onPress={() => onAdventurePress(adventure.id)}
            >
              <View style={styles.markerDot}>
                <Text style={styles.markerEmoji}>📍</Text>
              </View>
              <View style={styles.markerLabel}>
                <Text style={styles.markerText}>{adventure.location}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <StopsList adventures={adventures} onAdventurePress={onAdventurePress} />
    </View>
  );
}

// Native MapLibre component
function NativeMapView({ adventures, onAdventurePress }: MapViewProps) {
  if (!MapLibreGL || adventures.length === 0) {
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

  // Calculate appropriate zoom level based on coordinate spread
  const lngs = coordinates.map(c => c[0]);
  const lats = coordinates.map(c => c[1]);
  const lngSpread = Math.max(...lngs) - Math.min(...lngs);
  const latSpread = Math.max(...lats) - Math.min(...lats);
  const maxSpread = Math.max(lngSpread, latSpread);
  
  let zoomLevel = 2;
  if (maxSpread < 1) zoomLevel = 10;
  else if (maxSpread < 5) zoomLevel = 8;
  else if (maxSpread < 20) zoomLevel = 6;
  else if (maxSpread < 50) zoomLevel = 4;

  return (
    <View style={styles.container}>
      <View style={styles.nativeMapContainer}>
        <MapLibreGL.MapView
          style={styles.nativeMap}
          styleURL="https://demotiles.maplibre.org/style.json"
          logoEnabled={false}
          attributionEnabled={true}
          attributionPosition={{ bottom: 8, right: 8 }}
        >
          <MapLibreGL.Camera
            zoomLevel={zoomLevel}
            centerCoordinate={defaultCenter}
            animationMode="flyTo"
            animationDuration={1500}
          />

          {/* Adventure markers */}
          {adventures.map((adventure) => (
            <MapLibreGL.MarkerView
              key={adventure.id}
              coordinate={[adventure.coordinates.lng, adventure.coordinates.lat]}
            >
              <Pressable
                style={styles.nativeMarkerContainer}
                onPress={() => onAdventurePress(adventure.id)}
              >
                <View style={styles.nativeMarker}>
                  <Text style={styles.nativeMarkerEmoji}>📍</Text>
                </View>
                <View style={styles.nativeMarkerLabel}>
                  <Text style={styles.nativeMarkerName}>{adventure.location}</Text>
                  <Text style={styles.nativeMarkerPhotos}>{adventure.mediaCount} photos</Text>
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
      </View>

      <StopsList adventures={adventures} onAdventurePress={onAdventurePress} />
    </View>
  );
}

// Shared adventure list component
function StopsList({ adventures, onAdventurePress }: { adventures: Adventure[]; onAdventurePress: (id: string) => void }) {
  return (
    <View style={styles.adventuresList}>
      <Text style={styles.adventuresTitle}>🗺️ Your Adventures</Text>
      {adventures.slice(0, 4).map((adventure, index) => (
        <Pressable
          key={adventure.id}
          style={styles.adventureItem}
          onPress={() => onAdventurePress(adventure.id)}
        >
          <View style={styles.adventureNumber}>
            <Text style={styles.adventureNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.adventureInfo}>
            <Text style={styles.adventureName}>{adventure.title}</Text>
            <Text style={styles.adventureDetails}>
              {adventure.location} • {adventure.mediaCount} photos • {adventure.distance}km
            </Text>
          </View>
          <Text style={styles.adventureArrow}>→</Text>
        </Pressable>
      ))}
    </View>
  );
}

export default function MapView(props: MapViewProps) {
  // Use native MapLibre on native platforms, fallback on web
  if (Platform.OS === "web") {
    return <WebMapFallback {...props} />;
  }
  return <NativeMapView {...props} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
  },
  mapContainer: {
    backgroundColor: "#0c1929",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  mapBackground: {
    flex: 1,
    backgroundColor: "#0c1929",
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  continentsContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  continent: {
    position: "absolute",
    backgroundColor: "rgba(34, 197, 94, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.5)",
  },
  nativeMapContainer: {
    height: 400,
    borderRadius: 16,
    overflow: "hidden",
    margin: 20,
  },
  nativeMap: {
    flex: 1,
  },
  marker: {
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerEmoji: {
    fontSize: 16,
    color: "#ffffff",
  },
  markerLabel: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
    maxWidth: 120,
  },
  markerText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  nativeMarkerContainer: {
    alignItems: "center",
  },
  nativeMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  nativeMarkerEmoji: {
    fontSize: 18,
  },
  nativeMarkerLabel: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
    maxWidth: 150,
  },
  nativeMarkerName: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  nativeMarkerPhotos: {
    color: "#94a3b8",
    fontSize: 10,
    textAlign: "center",
  },
  adventuresList: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
    margin: 20,
  },
  adventuresTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  adventureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  adventureNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  adventureNumberText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  adventureInfo: {
    flex: 1,
  },
  adventureName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  adventureDetails: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  adventureArrow: {
    color: "#64748b",
    fontSize: 16,
  },
});