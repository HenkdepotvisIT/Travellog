import { View, Text, Pressable, Image, StyleSheet, Dimensions, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInUp,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Adventure } from "../types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width - 40;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AdventureCardModernProps {
  adventure: Adventure;
  onPress: () => void;
  index: number;
}

export default function AdventureCardModern({
  adventure,
  onPress,
  index,
}: AdventureCardModernProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  // Use simpler animation on web
  const enterAnimation = Platform.OS === "web"
    ? FadeIn.delay(index * 50).duration(300)
    : FadeInUp.delay(index * 100).springify().damping(15);

  return (
    <Animated.View entering={enterAnimation}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.container, animatedStyle]}
      >
        {/* Background Image */}
        <Image
          source={{ uri: adventure.coverPhoto }}
          style={styles.backgroundImage}
          resizeMode="cover"
        />

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.9)"]}
          locations={[0, 0.5, 1]}
          style={styles.gradient}
        />

        {/* Top Badge */}
        <View style={styles.topBadge}>
          <BlurView intensity={80} tint="dark" style={styles.badgeBlur}>
            <Text style={styles.badgeText}>📍 {adventure.location}</Text>
          </BlurView>
        </View>

        {/* Favorite Badge */}
        {adventure.isFavorite && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.favoriteIcon}>❤️</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {adventure.title}
          </Text>
          <Text style={styles.dates}>
            {adventure.startDate} → {adventure.endDate}
          </Text>

          {/* Stats Row with Glass Effect */}
          <View style={styles.statsContainer}>
            <BlurView intensity={60} tint="dark" style={styles.statsBlur}>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>📸</Text>
                  <Text style={styles.statValue}>{adventure.mediaCount}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>📏</Text>
                  <Text style={styles.statValue}>{adventure.distance}km</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>⏱️</Text>
                  <Text style={styles.statValue}>{adventure.duration}d</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>📍</Text>
                  <Text style={styles.statValue}>{adventure.stops}</Text>
                </View>
              </View>
            </BlurView>
          </View>

          {/* AI Summary Preview */}
          {adventure.aiSummary && (
            <Text style={styles.summary} numberOfLines={2}>
              {adventure.aiSummary}
            </Text>
          )}

          {/* Photo Strip */}
          <View style={styles.photoStrip}>
            {adventure.photos.slice(0, 4).map((photo, idx) => (
              <View key={idx} style={styles.photoThumb}>
                <Image
                  source={{ uri: photo }}
                  style={styles.photoThumbImage}
                  resizeMode="cover"
                />
                {idx === 3 && adventure.photos.length > 4 && (
                  <View style={styles.morePhotos}>
                    <Text style={styles.morePhotosText}>
                      +{adventure.photos.length - 4}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Border Glow */}
        <View style={styles.borderGlow} />
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 420,
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 24,
    backgroundColor: "#1a1a2e",
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  topBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  badgeBlur: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  favoriteBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIcon: {
    fontSize: 18,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dates: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 16,
  },
  statsContainer: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  statsBlur: {
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  stat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statIcon: {
    fontSize: 14,
  },
  statValue: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  summary: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 18,
    marginBottom: 12,
  },
  photoStrip: {
    flexDirection: "row",
    gap: 8,
  },
  photoThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  photoThumbImage: {
    width: "100%",
    height: "100%",
  },
  morePhotos: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  morePhotosText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  borderGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});