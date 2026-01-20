import { View, Text, Pressable, Image, StyleSheet, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeInRight,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { Adventure } from "../types";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.8;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AdventureCardHorizontalProps {
  adventure: Adventure;
  onPress: () => void;
  index: number;
}

export default function AdventureCardHorizontal({
  adventure,
  onPress,
  index,
}: AdventureCardHorizontalProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  // Use simpler animation on web
  const enterAnimation = Platform.OS === "web"
    ? FadeIn.delay(index * 100).duration(300)
    : FadeInRight.delay(index * 150).springify().damping(15);

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
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.8)"]}
          locations={[0, 0.6, 1]}
          style={styles.gradient}
        />

        {/* Favorite Badge */}
        {adventure.isFavorite && (
          <View style={styles.favoriteBadge}>
            <Text style={styles.favoriteIcon}>❤️</Text>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.locationRow}>
            <Text style={styles.locationEmoji}>📍</Text>
            <Text style={styles.location}>{adventure.location}</Text>
          </View>
          
          <Text style={styles.title} numberOfLines={2}>
            {adventure.title}
          </Text>
          
          <Text style={styles.dates}>
            {adventure.startDate} - {adventure.endDate}
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{adventure.mediaCount}</Text>
              <Text style={styles.statLabel}>photos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{adventure.duration}d</Text>
              <Text style={styles.statLabel}>duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{adventure.distance}km</Text>
              <Text style={styles.statLabel}>distance</Text>
            </View>
          </View>

          {/* AI Summary */}
          {adventure.aiSummary && (
            <Text style={styles.summary} numberOfLines={2}>
              {adventure.aiSummary}
            </Text>
          )}
        </View>

        {/* Border */}
        <View style={styles.border} />
      </AnimatedPressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: 320,
    borderRadius: 24,
    overflow: "hidden",
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
  favoriteBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  favoriteIcon: {
    fontSize: 16,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationEmoji: {
    fontSize: 14,
    marginRight: 6,
  },
  location: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  dates: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
    backdropFilter: "blur(10px)",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 2,
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
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});