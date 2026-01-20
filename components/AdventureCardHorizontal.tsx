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
    scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  // Use simpler animation on web
  const enterAnimation = Platform.OS === "web"
    ? FadeIn.delay(index * 100).duration(300)
    : FadeInRight.delay(index * 150).springify().damping(15);

  return (
    <Animated.View entering={enterAnimation} style={styles.wrapper}>
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
          colors={["transparent", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]}
          locations={[0, 0.5, 1]}
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
            <Text style={styles.location} numberOfLines={1}>{adventure.location}</Text>
          </View>
          
          <Text style={styles.title} numberOfLines={2}>
            {adventure.title}
          </Text>
          
          <Text style={styles.dates} numberOfLines={1}>
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
              <Text style={styles.statLabel}>days</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statValue}>{adventure.distance}km</Text>
              <Text style={styles.statLabel}>dist</Text>
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
  wrapper: {
    flex: 1,
  },
  container: {
    flex: 1,
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteIcon: {
    fontSize: 14,
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  locationEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  location: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dates: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  summary: {
    fontSize: 11,
    color: "rgba(255, 255, 255, 0.7)",
    lineHeight: 16,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    pointerEvents: "none",
  },
});