import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { useAdventures } from "../../hooks/useAdventures";
import GradientBackground from "../../components/ui/GradientBackground";
import AdventureCardModern from "../../components/AdventureCardModern";
import FilterControlsModern from "../../components/FilterControlsModern";
import { AdventureFilters } from "../../types";

const { width } = Dimensions.get("window");

export default function AdventuresTab() {
  const [filters, setFilters] = useState<AdventureFilters>({
    dateRange: null,
    country: null,
    minDistance: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { adventures, loading, error, refresh } = useAdventures(filters);

  const headerAnimation = Platform.OS === "web"
    ? FadeIn.delay(50).duration(200)
    : FadeInDown.delay(100).springify();

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View
          entering={headerAnimation}
          style={styles.header}
        >
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Adventures</Text>
            <Text style={styles.subtitle}>
              {adventures.length} {adventures.length === 1 ? "trip" : "trips"} discovered
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Pressable
              style={[
                styles.viewModeButton,
                viewMode === "grid" && styles.viewModeButtonActive,
              ]}
              onPress={() => setViewMode("grid")}
            >
              <Text style={styles.viewModeIcon}>⊞</Text>
            </Pressable>
            <Pressable
              style={[
                styles.viewModeButton,
                viewMode === "list" && styles.viewModeButtonActive,
              ]}
              onPress={() => setViewMode("list")}
            >
              <Text style={styles.viewModeIcon}>☰</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* Filters */}
        <FilterControlsModern
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Main Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading adventures...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>😕</Text>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryButton} onPress={refresh}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </Pressable>
          </View>
        ) : adventures.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🌍</Text>
            <Text style={styles.emptyTitle}>No adventures found</Text>
            <Text style={styles.emptyText}>
              Try adjusting your filters or connect to Immich to discover your travels
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {viewMode === "grid" ? (
              <View style={styles.gridContainer}>
                {adventures.map((adventure, index) => (
                  <AdventureCardModern
                    key={adventure.id}
                    adventure={adventure}
                    onPress={() => router.push(`/adventure/${adventure.id}`)}
                    index={index}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.listContainer}>
                {adventures.map((adventure, index) => (
                  <Animated.View
                    key={adventure.id}
                    entering={FadeIn.delay(index * 50).duration(300)}
                  >
                    <Pressable
                      style={styles.listItem}
                      onPress={() => router.push(`/adventure/${adventure.id}`)}
                    >
                      <BlurView intensity={60} tint="dark" style={styles.listItemBlur}>
                        <LinearGradient
                          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
                          style={styles.listItemGradient}
                        >
                          <View style={styles.listItemContent}>
                            <View style={styles.listItemLeft}>
                              <Text style={styles.listItemTitle}>{adventure.title}</Text>
                              <Text style={styles.listItemLocation}>📍 {adventure.location}</Text>
                              <Text style={styles.listItemDates}>
                                {adventure.startDate} - {adventure.endDate}
                              </Text>
                            </View>
                            <View style={styles.listItemRight}>
                              <View style={styles.listItemStats}>
                                <Text style={styles.listItemStat}>{adventure.mediaCount} photos</Text>
                                <Text style={styles.listItemStat}>{adventure.distance}km</Text>
                                <Text style={styles.listItemStat}>{adventure.duration}d</Text>
                              </View>
                              {adventure.isFavorite && (
                                <Text style={styles.favoriteIcon}>❤️</Text>
                              )}
                            </View>
                          </View>
                        </LinearGradient>
                      </BlurView>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}

            <View style={{ height: 100 }} />
          </ScrollView>
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
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  viewModeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  viewModeButtonActive: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  viewModeIcon: {
    fontSize: 18,
    color: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  gridContainer: {
    alignItems: "center",
    gap: 20,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    borderRadius: 16,
    overflow: "hidden",
  },
  listItemBlur: {
    borderRadius: 16,
  },
  listItemGradient: {
    padding: 16,
    borderRadius: 16,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemLeft: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  listItemLocation: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  listItemDates: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
  },
  listItemRight: {
    alignItems: "flex-end",
  },
  listItemStats: {
    alignItems: "flex-end",
    marginBottom: 4,
  },
  listItemStat: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 2,
  },
  favoriteIcon: {
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
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