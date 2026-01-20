import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Platform,
  useWindowDimensions,
  Alert,
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
import SyncProgressModal from "../../components/SyncProgressModal";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function HeaderButton({
  icon,
  onPress,
  delay = 0,
  badge,
}: {
  icon: string;
  onPress: () => void;
  delay?: number;
  badge?: string;
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
          {badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          )}
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
  compact = false,
}: {
  icon: string;
  value: string | number;
  label: string;
  subtitle?: string;
  color?: string;
  delay?: number;
  compact?: boolean;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(300)}
      style={[styles.statCard, compact && styles.statCardCompact]}
    >
      <BlurView intensity={60} tint="light" style={styles.statCardBlur}>
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
          style={[styles.statCardGradient, compact && styles.statCardGradientCompact]}
        >
          <View style={[styles.statIcon, { backgroundColor: `${color}20` }, compact && styles.statIconCompact]}>
            <Text style={[styles.statIconText, compact && styles.statIconTextCompact]}>{icon}</Text>
          </View>
          <Text style={[styles.statValue, compact && styles.statValueCompact]}>{value}</Text>
          <Text style={[styles.statLabel, compact && styles.statLabelCompact]}>{label}</Text>
          {subtitle && !compact && <Text style={styles.statSubtitle}>{subtitle}</Text>}
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
  compact = false,
}: {
  icon: string;
  value: string | number;
  label: string;
  subtitle?: string;
  color?: string;
  delay?: number;
  compact?: boolean;
}) {
  return (
    <Animated.View
      entering={FadeIn.delay(delay).duration(300)}
      style={styles.largeStatCard}
    >
      <BlurView intensity={60} tint="light" style={styles.largeStatCardBlur}>
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "rgba(255,255,255,0.7)"]}
          style={[styles.largeStatCardGradient, compact && styles.largeStatCardGradientCompact]}
        >
          <View style={[styles.largeStatContent, compact && styles.largeStatContentCompact]}>
            <View style={[styles.largeStatIcon, { backgroundColor: `${color}30` }, compact && styles.largeStatIconCompact]}>
              <Text style={[styles.largeStatIconText, compact && styles.largeStatIconTextCompact]}>{icon}</Text>
            </View>
            <View style={styles.largeStatText}>
              <Text style={[styles.largeStatValue, compact && styles.largeStatValueCompact]}>{value}</Text>
              <Text style={[styles.largeStatLabel, compact && styles.largeStatLabelCompact]}>{label}</Text>
              {subtitle && <Text style={[styles.largeStatSubtitle, compact && styles.largeStatSubtitleCompact]}>{subtitle}</Text>}
            </View>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
}

export default function HomeTab() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [filters] = useState({
    dateRange: null as { start: Date; end: Date } | null,
    country: null as string | null,
    minDistance: 0,
  });

  const { isConnected, serverUrl, connect, disconnect } = useImmichConnection();
  const { adventures, loading, error, refresh, syncWithImmich, syncStatus } = useAdventures(filters);

  // Show connection modal on first load if not connected
  useEffect(() => {
    if (!isConnected && !loading && adventures.length === 0) {
      // Small delay to let the UI render first
      const timer = setTimeout(() => setShowConnectionModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, loading, adventures.length]);

  // Handle sync button press
  const handleSync = async () => {
    if (!isConnected) {
      setShowConnectionModal(true);
      return;
    }

    const result = await syncWithImmich();
    
    if (result.success) {
      if (result.adventuresCreated > 0 || result.adventuresUpdated > 0) {
        Alert.alert(
          "✅ Sync Complete!",
          `Found ${result.photosWithGps} photos with GPS data.\n\n` +
          `• ${result.adventuresCreated} new adventures created\n` +
          `• ${result.adventuresUpdated} adventures updated\n\n` +
          `Photos are loaded live from Immich - no extra storage used!`,
          [{ text: "Awesome!" }]
        );
      } else if (result.photosWithGps === 0) {
        Alert.alert(
          "No GPS Data Found",
          "None of your photos have GPS location data. Make sure your camera or phone saves location info with photos.",
          [{ text: "OK" }]
        );
      } else {
        Alert.alert(
          "Already Up to Date",
          `Your ${adventures.length} adventures are already synced with Immich.`,
          [{ text: "OK" }]
        );
      }
    } else {
      Alert.alert(
        "Sync Failed",
        result.error || "Failed to sync with Immich. Please check your connection.",
        [{ text: "OK" }]
      );
    }
  };

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
    thisYear: adventures.filter(a => {
      try {
        return new Date(a.startDate).getFullYear() === new Date().getFullYear();
      } catch {
        return false;
      }
    }).length,
  };

  const headerAnimation = Platform.OS === "web"
    ? FadeIn.delay(50).duration(200)
    : FadeInDown.delay(100).springify();

  const cardWidth = isSmallScreen ? width * 0.85 : width * 0.8;
  const statCardWidth = isSmallScreen ? (width - 48) / 2 : (width - 60) / 2;

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View
          entering={headerAnimation}
          style={[styles.header, isSmallScreen && styles.headerCompact]}
        >
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, isSmallScreen && styles.greetingCompact]}>
              {isConnected ? "Connected to Immich" : "Welcome"}
            </Text>
            <Text style={[styles.title, isSmallScreen && styles.titleCompact]}>Your Adventures</Text>
          </View>
          <View style={styles.headerRight}>
            {isConnected && (
              <HeaderButton
                icon="🔄"
                onPress={handleSync}
                delay={100}
              />
            )}
            <HeaderButton
              icon={isConnected ? "✓" : "🔗"}
              onPress={() => setShowConnectionModal(true)}
              delay={150}
              badge={isConnected ? undefined : "!"}
            />
          </View>
        </Animated.View>

        {/* Connection Status */}
        <Animated.View
          entering={FadeIn.delay(200).duration(300)}
          style={[styles.statusContainer, isSmallScreen && styles.statusContainerCompact]}
        >
          <Pressable 
            style={styles.statusRow}
            onPress={() => isConnected ? handleSync() : setShowConnectionModal(true)}
          >
            <View
              style={[
                styles.statusDot,
                isConnected ? styles.statusConnected : styles.statusDisconnected,
              ]}
            />
            <Text style={[styles.statusText, isSmallScreen && styles.statusTextCompact]} numberOfLines={1}>
              {isConnected 
                ? `${serverUrl?.split('//')[1]?.split('/')[0] || 'Immich'} • Tap to sync`
                : "Tap to connect to Immich"}
            </Text>
            {syncStatus.lastSyncTime && (
              <Text style={styles.lastSyncText}>
                Last: {new Date(syncStatus.lastSyncTime).toLocaleDateString()}
              </Text>
            )}
          </Pressable>
        </Animated.View>

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
            <Text style={styles.emptyTitle}>
              {isConnected ? "Ready to Sync!" : "No adventures yet"}
            </Text>
            <Text style={styles.emptyText}>
              {isConnected 
                ? "Tap the sync button to discover adventures from your Immich photos. Only photos with GPS data will be used."
                : "Connect to your Immich server to automatically discover your travel adventures from your photos."}
            </Text>
            <Pressable 
              style={styles.connectButton} 
              onPress={() => isConnected ? handleSync() : setShowConnectionModal(true)}
            >
              <LinearGradient
                colors={["#3b82f6", "#2563eb"]}
                style={styles.connectButtonGradient}
              >
                <Text style={styles.connectButtonText}>
                  {isConnected ? "🔄 Sync Now" : "🔗 Connect to Immich"}
                </Text>
              </LinearGradient>
            </Pressable>
            
            {isConnected && (
              <Text style={styles.storageNote}>
                💡 Photos are loaded directly from Immich - no extra storage used!
              </Text>
            )}
          </View>
        ) : (
          <ScrollView 
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Hero Stats */}
            <View style={[styles.heroStatsSection, isSmallScreen && styles.heroStatsSectionCompact]}>
              <LargeStatCard
                icon="🌍"
                value={stats.totalAdventures}
                label="Adventures"
                subtitle={`${stats.thisYear} this year`}
                color="#3b82f6"
                delay={250}
                compact={isSmallScreen}
              />
              <LargeStatCard
                icon="📸"
                value={stats.totalPhotos.toLocaleString()}
                label="Photos"
                subtitle={`${stats.averagePhotosPerTrip} avg`}
                color="#8b5cf6"
                delay={300}
                compact={isSmallScreen}
              />
            </View>

            {/* Detailed Stats Grid */}
            <View style={[styles.statsGrid, isSmallScreen && styles.statsGridCompact]}>
              <View style={[styles.statCardWrapper, { width: statCardWidth }]}>
                <StatCard
                  icon="🗺️"
                  value={`${(stats.totalDistance / 1000).toFixed(1)}k`}
                  label="Distance"
                  subtitle="km traveled"
                  color="#06b6d4"
                  delay={350}
                  compact={isSmallScreen}
                />
              </View>
              <View style={[styles.statCardWrapper, { width: statCardWidth }]}>
                <StatCard
                  icon="🏳️"
                  value={stats.countries}
                  label="Countries"
                  subtitle="Explored"
                  color="#10b981"
                  delay={400}
                  compact={isSmallScreen}
                />
              </View>
              <View style={[styles.statCardWrapper, { width: statCardWidth }]}>
                <StatCard
                  icon="📅"
                  value={`${stats.totalDays}d`}
                  label="Days"
                  subtitle="Traveling"
                  color="#f59e0b"
                  delay={450}
                  compact={isSmallScreen}
                />
              </View>
              <View style={[styles.statCardWrapper, { width: statCardWidth }]}>
                <StatCard
                  icon="❤️"
                  value={stats.favoriteAdventures}
                  label="Favorites"
                  subtitle="Loved"
                  color="#ef4444"
                  delay={500}
                  compact={isSmallScreen}
                />
              </View>
            </View>

            {/* Record Stats */}
            <Animated.View
              entering={FadeIn.delay(550).duration(300)}
              style={[styles.recordsSection, isSmallScreen && styles.recordsSectionCompact]}
            >
              <Text style={[styles.recordsTitle, isSmallScreen && styles.recordsTitleCompact]}>🏆 Records</Text>
              <View style={styles.recordsGrid}>
                <View style={styles.recordCard}>
                  <Text style={[styles.recordValue, isSmallScreen && styles.recordValueCompact]}>{stats.longestTrip}d</Text>
                  <Text style={[styles.recordLabel, isSmallScreen && styles.recordLabelCompact]}>Longest</Text>
                </View>
                <View style={styles.recordCard}>
                  <Text style={[styles.recordValue, isSmallScreen && styles.recordValueCompact]}>{stats.mostPhotosInTrip}</Text>
                  <Text style={[styles.recordLabel, isSmallScreen && styles.recordLabelCompact]}>Most Photos</Text>
                </View>
              </View>
            </Animated.View>

            {/* Recent Adventures Preview */}
            <View style={styles.adventuresSection}>
              <View style={[styles.sectionHeader, isSmallScreen && styles.sectionHeaderCompact]}>
                <Text style={[styles.sectionTitle, isSmallScreen && styles.sectionTitleCompact]}>Recent</Text>
                <Pressable onPress={() => router.push("/(tabs)/adventures")}>
                  <Text style={styles.seeAllText}>See All →</Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.adventuresScroll}
                decelerationRate="fast"
                snapToInterval={cardWidth + 16}
                snapToAlignment="start"
              >
                {adventures.slice(0, 5).map((adventure, index) => (
                  <View key={adventure.id} style={{ width: cardWidth }}>
                    <AdventureCardHorizontal
                      adventure={adventure}
                      onPress={() => router.push(`/adventure/${adventure.id}`)}
                      index={index}
                    />
                  </View>
                ))}
              </ScrollView>
            </View>

            <View style={{ height: 120 }} />
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

        {/* Sync Progress Modal */}
        <SyncProgressModal
          visible={syncStatus.isSyncing}
          syncStatus={syncStatus}
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
  greeting: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  greetingCompact: {
    fontSize: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  titleCompact: {
    fontSize: 22,
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  headerButtonText: {
    fontSize: 18,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ef4444",
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "bold",
  },
  statusContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statusContainerCompact: {
    paddingHorizontal: 16,
    marginBottom: 16,
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
    backgroundColor: "#f59e0b",
  },
  statusText: {
    fontSize: 13,
    color: "#475569",
    flex: 1,
  },
  statusTextCompact: {
    fontSize: 11,
  },
  lastSyncText: {
    fontSize: 11,
    color: "#94a3b8",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    color: "#64748b",
    marginTop: 16,
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
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  retryButtonText: {
    color: "#1e293b",
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
    color: "#1e293b",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  connectButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  connectButtonGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  connectButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 15,
  },
  storageNote: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 16,
  },
  heroStatsSection: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  heroStatsSectionCompact: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  largeStatCard: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  largeStatCardBlur: {
    borderRadius: 16,
  },
  largeStatCardGradient: {
    padding: 16,
    borderRadius: 16,
  },
  largeStatCardGradientCompact: {
    padding: 12,
  },
  largeStatContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  largeStatContentCompact: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  largeStatIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  largeStatIconCompact: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 0,
    marginBottom: 8,
  },
  largeStatIconText: {
    fontSize: 20,
  },
  largeStatIconTextCompact: {
    fontSize: 16,
  },
  largeStatText: {
    flex: 1,
  },
  largeStatValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  largeStatValueCompact: {
    fontSize: 20,
  },
  largeStatLabel: {
    fontSize: 13,
    color: "#475569",
    fontWeight: "600",
  },
  largeStatLabelCompact: {
    fontSize: 11,
  },
  largeStatSubtitle: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  largeStatSubtitleCompact: {
    fontSize: 10,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  statsGridCompact: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  statCardWrapper: {
    // Width set dynamically
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    overflow: "hidden",
  },
  statCardCompact: {
    borderRadius: 12,
  },
  statCardBlur: {
    borderRadius: 14,
  },
  statCardGradient: {
    padding: 14,
    alignItems: "center",
    borderRadius: 14,
  },
  statCardGradientCompact: {
    padding: 10,
    borderRadius: 12,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statIconCompact: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginBottom: 6,
  },
  statIconText: {
    fontSize: 18,
  },
  statIconTextCompact: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  statValueCompact: {
    fontSize: 14,
  },
  statLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  statLabelCompact: {
    fontSize: 10,
  },
  statSubtitle: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 2,
  },
  recordsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recordsSectionCompact: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  recordsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  recordsTitleCompact: {
    fontSize: 16,
    marginBottom: 10,
  },
  recordsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  recordCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  recordValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f59e0b",
    marginBottom: 4,
  },
  recordValueCompact: {
    fontSize: 18,
  },
  recordLabel: {
    fontSize: 11,
    color: "#64748b",
    textAlign: "center",
  },
  recordLabelCompact: {
    fontSize: 10,
  },
  adventuresSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionHeaderCompact: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  sectionTitleCompact: {
    fontSize: 16,
  },
  seeAllText: {
    fontSize: 13,
    color: "#3b82f6",
    fontWeight: "600",
  },
  adventuresScroll: {
    paddingLeft: 20,
    paddingRight: 20,
    gap: 16,
  },
});