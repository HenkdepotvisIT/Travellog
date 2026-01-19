import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { Coordinates, StopPoint } from "../types";

const { width } = Dimensions.get("window");

// Conditionally import MapLibre only on native platforms
let MapLibreGL: any = null;
if (Platform.OS !== "web") {
  try {
    MapLibreGL = require("@maplibre/maplibre-react-native").default;
  } catch (e) {
    console.log("MapLibre not available");
  }
}

interface AdventureMapProps {
  route: Coordinates[];
  stops: StopPoint[];
}

// Web fallback component
function WebMapFallback({ route, stops }: AdventureMapProps) {
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

  return (
    <View style={styles.container}>
      <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}>
        <View style={styles.mapBackground} />

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

      <StopsList stops={stops} />
    </View>
  );
}

// Native MapLibre component
function NativeMapView({ route, stops }: AdventureMapProps) {
  if (!MapLibreGL || route.length === 0) {
    return <WebMapFallback route={route} stops={stops} />;
  }

  // Calculate bounds
  const lngs = route.map((r) => r.lng);
  const lats = route.map((r) => r.lat);
  const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;

  // Calculate appropriate zoom level based on route spread
  const lngSpread = Math.max(...lngs) - Math.min(...lngs);
  const latSpread = Math.max(...lats) - Math.min(...lats);
  const maxSpread = Math.max(lngSpread, latSpread);
  const zoomLevel = maxSpread > 10 ? 4 : maxSpread > 5 ? 5 : maxSpread > 2 ? 6 : 8;

  const routeCoordinates = route.map((point) => [point.lng, point.lat]);

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
            centerCoordinate={[centerLng, centerLat]}
            animationMode="flyTo"
            animationDuration={1500}
          />

          {/* Route line */}
          {routeCoordinates.length > 1 && (
            <MapLibreGL.ShapeSource
              id="routeSource"
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
                id="routeLine"
                style={{
                  lineColor: "#3b82f6",
                  lineWidth: 4,
                  lineOpacity: 0.9,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </MapLibreGL.ShapeSource>
          )}

          {/* Stop markers */}
          {stops.map((stop, index) => (
            <MapLibreGL.MarkerView
              key={`stop-${index}`}
              coordinate={[stop.lng, stop.lat]}
            >
              <View style={styles.nativeMarkerContainer}>
                <View style={styles.nativeMarker}>
                  <Text style={styles.nativeMarkerNumber}>{index + 1}</Text>
                </View>
                <View style={styles.nativeMarkerLabel}>
                  <Text style={styles.nativeMarkerName}>{stop.name}</Text>
                  <Text style={styles.nativeMarkerPhotos}>{stop.photos} photos</Text>
                </View>
              </View>
            </MapLibreGL.MarkerView>
          ))}
        </MapLibreGL.MapView>
      </View>

      <StopsList stops={stops} />
    </View>
  );
}

// Shared stops list component
function StopsList({ stops }: { stops: StopPoint[] }) {
  return (
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
  );
}

export default function AdventureMap(props: AdventureMapProps) {
  if (Platform.OS === "web") {
    return <WebMapFallback {...props} />;
  }
  return <NativeMapView {...props} />;
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
  nativeMapContainer: {
    height: 300,
    borderRadius: 16,
    overflow: "hidden",
  },
  nativeMap: {
    flex: 1,
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
  nativeMarkerContainer: {
    alignItems: "center",
  },
  nativeMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  nativeMarkerNumber: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  nativeMarkerLabel: {
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 4,
  },
  nativeMarkerName: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "600",
  },
  nativeMarkerPhotos: {
    color: "#94a3b8",
    fontSize: 9,
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