import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { Adventure } from "../types";

const { width, height } = Dimensions.get("window");

interface MapViewProps {
  adventures: Adventure[];
  onAdventurePress: (id: string) => void;
}

export default function MapView({ adventures, onAdventurePress }: MapViewProps) {
  // Simple map visualization without native maps
  // In production, you'd use react-native-maps

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        {/* World map background */}
        <View style={styles.mapBackground}>
          <Text style={styles.mapEmoji}>🗺️</Text>
        </View>

        {/* Adventure pins */}
        {adventures.map((adventure) => {
          // Convert lat/lng to approximate screen position
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

        {/* Map legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Your Adventures</Text>
          <Text style={styles.legendSubtitle}>
            {adventures.length} trips • Tap a pin to explore
          </Text>
        </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
});