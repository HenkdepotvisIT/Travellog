import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  
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
          style={[styles.header, isSmallScreen && styles.headerCompact]}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.title, isSmallScreen && styles.titleCompact]}>World Map</Text>
            <Text style={[styles.subtitle, isSmallScreen && styles.subtitleCompact]}>
              {adventures.length} adventures • {new Set(adventures.map(a => a.location)).size} countries
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
            <Text style={styles.emptyTitle}>No adventures</Text>
            <Text style={styles.emptyText}>
              Connect to Immich to see your travels
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerCompact: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  titleCompact: {
    fontSize: 24,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  subtitleCompact: {
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingEmoji: {
    fontSize: 60,
    marginBottom: 12,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
});