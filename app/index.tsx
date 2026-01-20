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
import AdventureCardHorizontal from "../components/AdventureCardHorizontal";
import ConnectionModal from "../components/ConnectionModal";

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

export default function HomeScreen() {
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
            <HeaderButton
              icon="⚙️"
              onPress={() => router.push("/settings")}
              delay={200}
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
          <>
            {/* Adventures Section */}
            <View style={styles.adventuresSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Adventures</Text>
                <Text style={styles.sectionCount}>{adventures.length} trips</Text>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.adventuresScroll}
                decelerationRate="fast"
                snapToInterval={width * 0.8 + 16}
                snapToAlignment="start"
              >
                {adventures.map((adventure, index) => (
                  <AdventureCardHorizontal
                    key={adventure.id}
                    adventure={adventure}
                    onPress={() => router.push(`/adventure/${adventure.id}`)}
                    index={index}
                  />
                ))}
              </ScrollView>
            </View>

            {/* Quick Stats */}
            <Animated.View
              entering={FadeIn.delay(400).duration(300)}
              style={styles.statsSection}
            >
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {adventures.reduce((sum, a) => sum + a.mediaCount, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Photos</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {adventures.reduce((sum, a) => sum + a.distance, 0).toLocaleString()}km
                  </Text>
                  <Text style={styles.statLabel}>Traveled</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>
                    {new Set(adventures.map(a => a.location)).size}
                  </Text>
                  <Text style={styles.statLabel}>Countries</Text>
                </View>
              </View>
            </Animated.View>
          </>
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
  adventuresSection: {
    flex: 1,
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
  sectionCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
  },
  adventuresScroll: {
    paddingLeft: 24,
    paddingRight: 24,
    gap: 16,
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});