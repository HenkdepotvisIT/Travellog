import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { useAdventures } from "../hooks/useAdventures";
import { useImmichConnection } from "../hooks/useImmichConnection";
import MapView from "../components/MapView";
import AdventureCard from "../components/AdventureCard";
import FilterControls from "../components/FilterControls";
import ConnectionModal from "../components/ConnectionModal";

const { width } = Dimensions.get("window");

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<"map" | "timeline">("map");
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: null as { start: Date; end: Date } | null,
    country: null as string | null,
    minDistance: 0,
  });

  const { isConnected, serverUrl, connect, disconnect } = useImmichConnection();
  const { adventures, loading, error, refresh } = useAdventures(filters);

  useEffect(() => {
    if (!isConnected) {
      setShowConnectionModal(true);
    }
  }, [isConnected]);

  const filteredAdventures = adventures;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Travel Log</Text>
          <Text style={styles.subtitle}>
            {isConnected
              ? `Connected to ${serverUrl}`
              : "Not connected to Immich"}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <Pressable
            style={styles.headerButton}
            onPress={() => setShowConnectionModal(true)}
          >
            <Text style={styles.headerButtonText}>
              {isConnected ? "🔗" : "🔗"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.push("/settings")}
          >
            <Text style={styles.headerButtonText}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <Pressable
          style={[styles.toggleButton, viewMode === "map" && styles.toggleActive]}
          onPress={() => setViewMode("map")}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === "map" && styles.toggleTextActive,
            ]}
          >
            🗺️ Map
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.toggleButton,
            viewMode === "timeline" && styles.toggleActive,
          ]}
          onPress={() => setViewMode("timeline")}
        >
          <Text
            style={[
              styles.toggleText,
              viewMode === "timeline" && styles.toggleTextActive,
            ]}
          >
            📅 Timeline
          </Text>
        </Pressable>
      </View>

      {/* Filter Controls */}
      <FilterControls filters={filters} onFiltersChange={setFilters} />

      {/* Main Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Loading adventures...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Pressable style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : viewMode === "map" ? (
        <MapView
          adventures={filteredAdventures}
          onAdventurePress={(id) => router.push(`/adventure/${id}`)}
        />
      ) : (
        <ScrollView style={styles.timeline} showsVerticalScrollIndicator={false}>
          {filteredAdventures.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateEmoji}>🌍</Text>
              <Text style={styles.emptyStateTitle}>No adventures yet</Text>
              <Text style={styles.emptyStateText}>
                Connect to your Immich server to discover your travel adventures
              </Text>
            </View>
          ) : (
            filteredAdventures.map((adventure) => (
              <AdventureCard
                key={adventure.id}
                adventure={adventure}
                onPress={() => router.push(`/adventure/${adventure.id}`)}
              />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Connection Modal */}
      <ConnectionModal
        visible={showConnectionModal}
        onClose={() => setShowConnectionModal(false)}
        onConnect={connect}
        onDisconnect={disconnect}
        isConnected={isConnected}
        currentUrl={serverUrl}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 20,
  },
  viewToggle: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#3b82f6",
  },
  toggleText: {
    color: "#94a3b8",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#ffffff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  timeline: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});