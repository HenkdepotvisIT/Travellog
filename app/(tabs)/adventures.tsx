import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  useWindowDimensions,
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

export default function AdventuresTab() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  
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
          style={[styles.header, isSmallScreen && styles.headerCompact]}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.title, isSmallScreen && styles.titleCompact]}>Adventures</Text>
            <Text style={[styles.subtitle, isSmallScreen && styles.subtitleCompact]}>
              {adventures.length} {adventures.length === 1 ? "trip" : "trips"}
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
              Try adjusting your filters
            </Text>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.scrollContent, isSmallScreen && styles.scrollContentCompact]}
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
                              <Text style={[styles.listItemTitle, isSmallScreen && styles.listItemTitleCompact]} numberOfLines={1}>
                                {adventure.title}
                              </Text>
                              <Text style={styles.listItemLocation} numberOfLines={1}>📍 {adventure.location}</Text>
                              <Text style={styles.listItemDates} numberOfLines={1}>
                                {adventure.startDate} - {adventure.endDate}
                              </Text>
                            </View>
                            <View style={styles.listItemRight}>
                              <View style={styles.listItemStats}>
                                <Text style={styles.listItemStat}>{adventure.mediaCount} 📸</Text>
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

            <View style={{ height: 120 }} />
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
  headerRight: {
    flexDirection: "row",
    gap: 6,
  },
  viewModeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 16,
    color: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  scrollContentCompact: {
    paddingHorizontal: 12,
  },
  gridContainer: {
    alignItems: "center",
    gap: 16,
  },
  listContainer: {
    gap: 10,
  },
  listItem: {
    borderRadius: 14,
    overflow: "hidden",
  },
  listItemBlur: {
    borderRadius: 14,
  },
  listItemGradient: {
    padding: 14,
    borderRadius: 14,
  },
  listItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItemLeft: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 3,
  },
  listItemTitleCompact: {
    fontSize: 14,
  },
  listItemLocation: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 2,
  },
  listItemDates: {
    fontSize: 11,
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
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    marginBottom: 2,
  },
  favoriteIcon: {
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
  retryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  retryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
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