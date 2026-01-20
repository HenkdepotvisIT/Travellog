import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { useAdventures } from "../../hooks/useAdventures";
import GradientBackground from "../../components/ui/GradientBackground";
import MapViewModern from "../../components/MapViewModern";
import { router } from "expo-router";

export default function MapTab() {
  const [filters] = useState({
    dateRange: null as { start: Date; end: Date } | null,
    country: null as string | null,
    minDistance: 0,
  });

  const { adventures, loading } = useAdventures(filters);

  const headerAnimation = Platform.OS === "web"
    ? FadeIn.delay(50).duration(200)
    : FadeInDown.delay(100).springify();

  const handleAdventurePress = (adventureId: string) => {
    router.push(`/adventure/${adventureId}`);
  };

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View
          entering={headerAnimation}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.title}>World Map</Text>
            <Text style={styles.subtitle}>
              {adventures.length} adventures across {new Set(adventures.map(a => a.location)).size} countries
            </Text>
          </View>
        </Animated.View>

        {/* Map Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingEmoji}>🗺️</Text>
            <Text style={styles.loadingText}>Loading map...</Text>
          </View>
        ) : adventures.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🌍</Text>
            <Text style={styles.emptyTitle}>No adventures to map</Text>
            <Text style={styles.emptyText}>
              Connect to Immich to see your travels on the world map
            </Text>
          </View>
        ) : (
          <MapViewModern
            adventures={adventures}
            onAdventurePress={handleAdventurePress}
          />
        )}
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 24,
  },
});