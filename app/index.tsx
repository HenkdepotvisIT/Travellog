import { useState, useEffect } from "react";
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
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useAdventures } from "../hooks/useAdventures";
import { useImmichConnection } from "../hooks/useImmichConnection";
import GradientBackground from "../components/ui/GradientBackground";
import GlassCard from "../components/ui/GlassCard";
import AnimatedButton from "../components/ui/AnimatedButton";
import MapViewModern from "../components/MapViewModern";
import AdventureCardModern from "../components/AdventureCardModern";
import FilterControlsModern from "../components/FilterControlsModern";
import ConnectionModal from "../components/ConnectionModal";

const { width } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function ViewToggle({
  viewMode,
  setViewMode,
}: {
  viewMode: "map" | "timeline";
  setViewMode: (mode: "map" | "timeline") => void;
}) {
  const enterAnimation = Platform.OS === "web"
    ? FadeIn.delay(100).duration(200)
    : FadeInDown.delay(200).springify();

  return (
    <Animated.View entering={enterAnimation} style={styles.viewToggle}>
      <BlurView intensity={60} tint="dark" style={styles.toggleBlur}>
        <LinearGradient
          colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
          style={styles.toggleGradient}
        >
          <Pressable
            style={[styles.toggleButton, viewMode === "map" && styles.toggleActive]}
            onPress={() => setViewMode("map")}
          >
            {viewMode === "map" ? (
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.toggleActiveGradient}
              >
                <Text style={styles.toggleTextActive}>🗺️ Map</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleText}>🗺️ Map</Text>
            )}
          </Pressable>
          <Pressable
            style={[styles.toggleButton, viewMode === "timeline" && styles.toggleActive]}
            onPress={() => setViewMode("timeline")}
          >
            {viewMode === "timeline" ? (
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.toggleActiveGradient}
              >
                <Text style={styles.toggleTextActive}>📅 Timeline</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleText}>📅 Timeline</Text>
            )}
          </Pressable>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

function HeaderButton({
  icon,
  onPress,
  delay = 0,
}: {
  icon: string;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.9);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={animatedStyle}
      >
        <BlurView intensity={60} tint="dark" style={styles.headerButtonBlur}>
          <LinearGradient
            colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.05)"]}
            style={styles.headerButtonGradient}
          >
            <Text style={styles.headerButtonText}>{icon}</Text>
          </LinearGradient>
        </BlurView>
      </AnimatedPressable>
    </Animated.View>
  );
}

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

  const headerAnimation = Platform.OS === "web"
    ? FadeIn.delay(50).duration(200)
    : FadeInDown.delay(100).springify();

  const filterAnimation = Platform.OS === "web"
    ? FadeIn.delay(150).duration(200)
    : FadeInDown.delay(300).springify();

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View
          entering={headerAnimation}
          style={styles.header}
        >
          <View>
            <Text style={styles.title}>Travel Log</Text>
            <View style={styles.subtitleRow}>
              <View
                style={[
                  styles.statusDot,
                  isConnected ? styles.statusConnected : styles.statusDisconnected,
                ]}
              />
              <Text style={styles.subtitle}>
                {isConnected ? "Connected" : "Not connected"}
              </Text>
            </View>
          </View>
          <View style={styles.headerButtons}>
            <HeaderButton
              icon="🔗"
              onPress={() => setShowConnectionModal(true)}
              delay={150}
            />
            <HeaderButton
              icon="⚙️"
              onPress={() => router.push("/settings")}
              delay={200}
            />
          </View>
        </Animated.View>

        {/* View Toggle */}
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />

        {/* Filter Controls */}
        <Animated.View entering={filterAnimation}>
          <FilterControlsModern filters={filters} onFiltersChange={setFilters} />
        </Animated.View>

        {/* Main Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <Animated.View entering={FadeIn.delay(100).duration(200)}>
              <GlassCard>
                <View style={styles.loadingContent}>
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text style={styles.loadingText}>Loading adventures...</Text>
                </View>
              </GlassCard>
            </Animated.View>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <GlassCard>
              <View style={styles.errorContent}>
                <Text style={styles.errorEmoji}>😕</Text>
                <Text style={styles.errorText}>{error}</Text>
                <AnimatedButton
                  title="Try Again"
                  icon="🔄"
                  onPress={refresh}
                  variant="primary"
                />
              </View>
            </GlassCard>
          </View>
        ) : viewMode === "map" ? (
          <MapViewModern
            adventures={adventures}
            onAdventurePress={(id) => router.push(`/adventure/${id}`)}
          />
        ) : (
          <ScrollView
            style={styles.timeline}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.timelineContent}
          >
            {adventures.length === 0 ? (
              <GlassCard delay={100}>
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateEmoji}>🌍</Text>
                  <Text style={styles.emptyStateTitle}>No adventures yet</Text>
                  <Text style={styles.emptyStateText}>
                    Connect to your Immich server to discover your travel adventures
                  </Text>
                  <AnimatedButton
                    title="Connect Now"
                    icon="🔗"
                    onPress={() => setShowConnectionModal(true)}
                    variant="primary"
                    style={{ marginTop: 16 }}
                  />
                </View>
              </GlassCard>
            ) : (
              adventures.map((adventure, index) => (
                <AdventureCardModern
                  key={adventure.id}
                  adventure={adventure}
                  onPress={() => router.push(`/adventure/${adventure.id}`)}
                  index={index}
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusDisconnected: {
    backgroundColor: "#ef4444",
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 12,
  },
  headerButtonBlur: {
    borderRadius: 22,
    overflow: "hidden",
  },
  headerButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  headerButtonText: {
    fontSize: 20,
  },
  viewToggle: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  toggleBlur: {
    borderRadius: 16,
  },
  toggleGradient: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
  },
  toggleButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  toggleActive: {},
  toggleActiveGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  toggleText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "600",
    fontSize: 15,
    textAlign: "center",
    paddingVertical: 14,
  },
  toggleTextActive: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingContent: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 16,
    fontSize: 15,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  errorContent: {
    alignItems: "center",
    padding: 20,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 15,
  },
  timeline: {
    flex: 1,
  },
  timelineContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    lineHeight: 22,
  },
});