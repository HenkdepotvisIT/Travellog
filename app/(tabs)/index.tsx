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
import { useAdventures } from "../../hooks/useAdventures";
import { useImmichConnection } from "../../hooks/useImmichConnection";
import GradientBackground from "../../components/ui/GradientBackground";
import AdventureCardHorizontal from "../../components/AdventureCardHorizontal";
import ConnectionModal from "../../components/ConnectionModal";

const { width } = Dimensions.get("window");

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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
        <View style={styles.headerButton}>
          <Text style={styles.headerButtonText}>{icon}</Text>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

function StatCard({
  icon,
  value,
  label,
  subtitle,
  color = "#3b82f6",
  delay = 0,
}: {
  icon: string;
  value: string | number;
  label: string;
  subtitle?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(300)}
      style={styles.statCard}
    >
      <BlurView intensity={60} tint="dark" style={styles.statCardBlur}>
        <LinearGradient
          colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
          style={styles.statCardGradient}
        >
          <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
            <Text style={styles.statIconText}>{icon}</Text>
          </View>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statLabel}>{label}</Text>
          {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

function LargeStatCard({
  icon,
  value,
  label,
  subtitle,
  color = "#3b82f6",
  delay = 0,
}: {
  icon: string;
  value: string | number;
  label: string;
  subtitle?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(300)}
      style={styles.largeStatCard}
    >
      <BlurView intensity={60} tint="dark" style={styles.largeStatCardBlur}>
        <LinearGradient
          colors={[`${color}20`, `${color}10`]}
          style={styles.largeStatCardGradient}
        >
          <View style={styles.largeStatContent}>
            <View style={[styles.largeStatIcon, { backgroundColor: `${color}30` }]}>
              <Text style={styles.largeStatIconText}>{icon}</Text>
            </View>
            <View style={styles.largeStatText}>
              <Text style={styles.largeStatValue}>{value}</Text>
              <Text style={styles.largeStatLabel}>{label}</Text>
              {subtitle && <Text style={styles.largeStatSubtitle}>{subtitle}</Text>}
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

export default function HomeTab() {
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [filters] = useState({
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

  // Calculate statistics
  const stats = {
    totalAdventures: adventures.length,
    totalPhotos: adventures.reduce((sum, a) => sum + a.mediaCount, 0),
    totalDistance: adventures.reduce((sum, a) => sum + a.distance, 0),
    totalDays: adventures.reduce((sum, a) => sum + a.duration, 0),
    countries: new Set(adventures.map(a => a.location)).size,
    averagePhotosPerTrip: adventures.length > 0 ? Math.round(adventures.reduce((sum, a) => sum + a.mediaCount, 0) / adventures.length) : 0,
    longestTrip: adventures.length > 0 ? Math.max(...adventures.map(a => a.duration)) : 0,
    mostPhotosInTrip: adventures.length > 0 ? Math.max(...adventures.map(a => a.mediaCount)) : 0,
    favoriteAdventures: adventures.filter(a => a.isFavorite).length,
    thisYear: adventures.filter(a => new Date(a.startDate).getFullYear() === new Date().getFullYear()).length,
  };

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
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.title}>Your Adventures</Text>
          </View>
          <View style={styles.headerRight}>
            <HeaderButton
              icon="🔗"
              onPress={() => setShowConnectionModal(true)}
              delay={150}
            />
          </View>
        </Animated.View>

        {/* Connection Status */}
        <Animated.View
          entering={FadeIn.delay(200).duration(300)}
          style={styles.statusContainer}
        >
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                isConnected ? styles.statusConnected : styles.statusDisconnected,
              ]}
            />
            <Text style={styles.statusText}>
              {isConnected ? `Connected to ${serverUrl?.split('//')[1]?.split('.')[0] || 'Immich'}` : "Not connected to Immich"}
            </Text>
          </View>
        </Animated.View>

        {/* Main Content */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading your adventures...</Text>
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
            <Text style={styles.emptyTitle}>No adventures yet</Text>
            <Text style={styles.emptyText}>
              Connect to your Immich server to discover your travel adventures
            </Text>
            <Pressable 
              style={styles.connectButton} 
              onPress={() => setShowConnectionModal(true)}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.connectButtonGradient}
              >
                <Text style={styles.connectButtonText}>Connect Now</Text>
              </LinearGradient>
            </Pressable>
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Stats */}
            <View style={styles.heroStatsSection}>
              <LargeStatCard
                icon="🌍"
                value={stats.totalAdventures}
                label="Adventures"
                subtitle={`${stats.thisYear} this year`}
                color="#3b82f6"
                delay={250}
              />
              <LargeStatCard
                icon="📸"
                value={stats.totalPhotos.toLocaleString()}
                label="Photos"
                subtitle={`${stats.averagePhotosPerTrip} avg per trip`}
                color="#8b5cf6"
                delay={300}
              />
            </View>

            {/* Detailed Stats Grid */}
            <View style={styles.statsGrid}>
              <StatCard
                icon="🗺️"
                value={`${stats.totalDistance.toLocaleString()}km`}
                label="Distance"
                subtitle="Total traveled"
                color="#06b6d4"
                delay={350}
              />
              <StatCard
                icon="🏳️"
                value={stats.countries}
                label="Countries"
                subtitle="Explored"
                color="#10b981"
                delay={400}
              />
              <StatCard
                icon="📅"
                value={`${stats.totalDays}d`}
                label="Days"
                subtitle="On adventures"
                color="#f59e0b"
                delay={450}
              />
              <StatCard
                icon="❤️"
                value={stats.favoriteAdventures}
                label="Favorites"
                subtitle="Loved trips"
                color="#ef4444"
                delay={500}
              />
            </View>

            {/* Record Stats */}
            <Animated.View
              entering={FadeIn.delay(550).duration(300)}
              style={styles.recordsSection}
            >
              <Text style={styles.recordsTitle}>🏆 Your Records</Text>
              <View style={styles.recordsGrid}>
                <View style={styles.recordCard}>
                  <Text style={styles.recordValue}>{stats.longestTrip}d</Text>
                  <Text style={styles.recordLabel}>Longest Trip</Text>
                </View>
                <View style={styles.recordCard}>
                  <Text style={styles.recordValue}>{stats.mostPhotosInTrip}</Text>
                  <Text style={styles.recordLabel}>Most Photos</Text>
                </View>
              </View>
            </Animated.View>

            {/* Recent Adventures Preview */}
            <View style={styles.adventuresSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Adventures</Text>
                <Pressable onPress={() => router.push("/(tabs)/adventures")}>
                  <Text style={styles.seeAllText}>See All →</Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.adventuresScroll}
                decelerationRate="fast"
                snapToInterval={width * 0.8 + 16}
                snapToAlignment="start"
              >
                {adventures.slice(0, 5).map((adventure, index) => (
                  <AdventureCardHorizontal
                    key={adventure.id}
                    adventure={adventure}
                    onPress={() => router.push(`/adventure/${adventure.id}`)}
                    index={index}
                  />
                ))}
              </ScrollView>
            </View>

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
  scrollContainer: {
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
  greeting: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  headerButtonText: {
    fontSize: 20,
  },
  statusContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
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
  statusText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
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
    marginBottom: 32,
  },
  connectButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  connectButtonGradient: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  connectButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  heroStatsSection: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 20,
  },
  largeStatCard: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
  },
  largeStatCardBlur: {
    borderRadius: 20,
  },
  largeStatCardGradient: {
    padding: 20,
    borderRadius: 20,
  },
  largeStatContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  largeStatIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  largeStatIconText: {
    fontSize: 24,
  },
  largeStatText: {
    flex: 1,
  },
  largeStatValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  largeStatLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  largeStatSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  statCardBlur: {
    borderRadius: 16,
  },
  statCardGradient: {
    padding: 16,
    alignItems: "center",
    borderRadius: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  statSubtitle: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 2,
  },
  recordsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  recordsTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  recordsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  recordCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  recordValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f59e0b",
    marginBottom: 4,
  },
  recordLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  adventuresSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  seeAllText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  adventuresScroll: {
    paddingLeft: 24,
    paddingRight: 24,
    gap: 16,
  },
});