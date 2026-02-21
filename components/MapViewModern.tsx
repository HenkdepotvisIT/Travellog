import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { Adventure } from "../types";

interface MapViewModernProps {
  adventures: Adventure[];
  onAdventurePress: (id: string) => void;
}

export default function MapViewModern({
  adventures,
  onAdventurePress,
}: MapViewModernProps) {
  // Calculate initial region to show all adventures
  const getInitialRegion = () => {
    if (adventures.length === 0) {
      return {
        latitude: 20,
        longitude: 0,
        latitudeDelta: 100,
        longitudeDelta: 100,
      };
    }

    const lats = adventures.map((a) => a.coordinates.lat);
    const lngs = adventures.map((a) => a.coordinates.lng);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latDelta = Math.max((maxLat - minLat) * 1.5, 10);
    const lngDelta = Math.max((maxLng - minLng) * 1.5, 10);

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  const legendAnimation = Platform.OS === "web" 
    ? FadeIn.delay(300).duration(300)
    : FadeInUp.delay(500).springify();
  
  const listAnimation = Platform.OS === "web"
    ? FadeIn.delay(400).duration(300)
    : FadeInUp.delay(600).springify();

  return (
    <View style={styles.container}>
      {/* Real Map */}
      <MapView
        style={styles.map}
        initialRegion={getInitialRegion()}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        customMapStyle={mapStyle}
      >
        {adventures.map((adventure) => (
          <Marker
            key={adventure.id}
            coordinate={{
              latitude: adventure.coordinates.lat,
              longitude: adventure.coordinates.lng,
            }}
            title={adventure.location}
            description={`${adventure.mediaCount} photos • ${adventure.duration} days`}
            onPress={() => onAdventurePress(adventure.id)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerDot}>
                <LinearGradient
                  colors={["#3b82f6", "#2563eb"]}
                  style={styles.markerGradient}
                >
                  <Text style={styles.markerEmoji}>📍</Text>
                </LinearGradient>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Legend Card */}
      <Animated.View
        entering={legendAnimation}
        style={styles.legendContainer}
      >
        <BlurView intensity={80} tint="light" style={styles.legendBlur}>
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
            style={styles.legendGradient}
          >
            <Text style={styles.legendTitle}>🗺️ Your Adventures</Text>
            <Text style={styles.legendSubtitle}>
              {adventures.length} trips across the globe
            </Text>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Adventure List Overlay */}
      {adventures.length > 0 && (
        <Animated.View
          entering={listAnimation}
          style={styles.listContainer}
        >
          <BlurView intensity={80} tint="light" style={styles.listBlur}>
            <LinearGradient
              colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
              style={styles.listGradient}
            >
              {adventures.slice(0, 3).map((adventure, index) => (
                <Pressable
                  key={adventure.id}
                  style={[
                    styles.listItem,
                    index < Math.min(2, adventures.length - 1) && styles.listItemBorder,
                  ]}
                  onPress={() => onAdventurePress(adventure.id)}
                >
                  <View style={styles.listItemDot}>
                    <LinearGradient
                      colors={["#3b82f6", "#8b5cf6"]}
                      style={styles.listItemDotGradient}
                    />
                  </View>
                  <View style={styles.listItemContent}>
                    <Text style={styles.listItemTitle}>{adventure.location}</Text>
                    <Text style={styles.listItemDate}>{adventure.startDate}</Text>
                  </View>
                  <Text style={styles.listItemArrow}>→</Text>
                </Pressable>
              ))}
            </LinearGradient>
          </BlurView>
        </Animated.View>
      )}

      {/* Border */}
      <View style={styles.mapBorder} />
    </View>
  );
}

// Custom map style for a cleaner look
const mapStyle = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    borderRadius: 28,
    overflow: "hidden",
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  markerGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  markerEmoji: {
    fontSize: 18,
  },
  legendContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendBlur: {
    borderRadius: 16,
  },
  legendGradient: {
    padding: 16,
    borderRadius: 16,
  },
  legendTitle: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "bold",
  },
  legendSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  listContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  listBlur: {
    borderRadius: 20,
  },
  listGradient: {
    padding: 8,
    borderRadius: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  listItemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginRight: 12,
  },
  listItemDotGradient: {
    flex: 1,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "600",
  },
  listItemDate: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  listItemArrow: {
    color: "#94a3b8",
    fontSize: 18,
  },
  mapBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    pointerEvents: "none",
  },
});
