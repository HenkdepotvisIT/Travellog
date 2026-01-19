import { View, Text, Pressable, StyleSheet, Dimensions, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useEffect } from "react";
import { Adventure } from "../types";

const { width, height } = Dimensions.get("window");

interface MapViewModernProps {
  adventures: Adventure[];
  onAdventurePress: (id: string) => void;
}

function PulsingDot({ delay = 0 }: { delay?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withTiming(1.5, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
    opacity.value = withRepeat(
      withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.pulsingRing, animatedStyle]} />
  );
}

export default function MapViewModern({
  adventures,
  onAdventurePress,
}: MapViewModernProps) {
  return (
    <View style={styles.container}>
      {/* Map Background */}
      <LinearGradient
        colors={["#0c1929", "#162544", "#1e3a5f"]}
        style={styles.mapBackground}
      >
        {/* Grid Lines */}
        <View style={styles.gridContainer}>
          {[...Array(10)].map((_, i) => (
            <View
              key={`h-${i}`}
              style={[styles.gridLine, styles.horizontalLine, { top: `${i * 10}%` }]}
            />
          ))}
          {[...Array(10)].map((_, i) => (
            <View
              key={`v-${i}`}
              style={[styles.gridLine, styles.verticalLine, { left: `${i * 10}%` }]}
            />
          ))}
        </View>

        {/* Globe Emoji as placeholder */}
        <Animated.Text
          entering={FadeIn.delay(200).duration(1000)}
          style={styles.globeEmoji}
        >
          🌍
        </Animated.Text>

        {/* Adventure Pins */}
        {adventures.map((adventure, index) => {
          const x = ((adventure.coordinates.lng + 180) / 360) * (width - 80) + 20;
          const y = ((90 - adventure.coordinates.lat) / 180) * (height * 0.45) + 20;

          return (
            <Animated.View
              key={adventure.id}
              entering={FadeInDown.delay(300 + index * 100).springify()}
              style={[
                styles.pinContainer,
                {
                  left: Math.max(30, Math.min(x, width - 70)),
                  top: Math.max(30, Math.min(y, height * 0.35)),
                },
              ]}
            >
              <Pressable onPress={() => onAdventurePress(adventure.id)}>
                <PulsingDot />
                <View style={styles.pinDot}>
                  <LinearGradient
                    colors={["#3b82f6", "#2563eb"]}
                    style={styles.pinGradient}
                  >
                    <Text style={styles.pinEmoji}>📍</Text>
                  </LinearGradient>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </LinearGradient>

      {/* Legend Card */}
      <Animated.View
        entering={FadeInUp.delay(500).springify()}
        style={styles.legendContainer}
      >
        <BlurView intensity={80} tint="dark" style={styles.legendBlur}>
          <LinearGradient
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
            style={styles.legendGradient}
          >
            <Text style={styles.legendTitle}>🗺️ Your Adventures</Text>
            <Text style={styles.legendSubtitle}>
              {adventures.length} trips across the globe
            </Text>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Adventure List Overlay */}
      <Animated.View
        entering={FadeInUp.delay(600).springify()}
        style={styles.listContainer}
      >
        <BlurView intensity={80} tint="dark" style={styles.listBlur}>
          <LinearGradient
            colors={["rgba(255,255,255,0.08)", "rgba(255,255,255,0.02)"]}
            style={styles.listGradient}
          >
            {adventures.slice(0, 3).map((adventure, index) => (
              <Pressable
                key={adventure.id}
                style={[
                  styles.listItem,
                  index < 2 && styles.listItemBorder,
                ]}
                onPress={() => onAdventurePress(adventure.id)}
              >
                <View style={styles.listItemDot}>
                  <LinearGradient
                    colors={["#3b82f6", "#8b5cf6"]}
                    style={styles.listItemDotGradient}
                  />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{adventure.location}</Text>
                  <Text style={styles.listItemDate}>{adventure.startDate}</Text>
                </View>
                <Text style={styles.listItemArrow}>→</Text>
              </Pressable>
            ))}
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Border */}
      <View style={styles.mapBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    borderRadius: 28,
    overflow: "hidden",
  },
  mapBackground: {
    flex: 1,
    position: "relative",
  },
  gridContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  horizontalLine: {
    left: 0,
    right: 0,
    height: 1,
  },
  verticalLine: {
    top: 0,
    bottom: 0,
    width: 1,
  },
  globeEmoji: {
    position: "absolute",
    fontSize: 150,
    opacity: 0.15,
    top: "30%",
    left: "50%",
    marginLeft: -75,
    marginTop: -75,
  },
  pinContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  pulsingRing: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3b82f6",
    top: -10,
    left: -10,
  },
  pinDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  pinGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pinEmoji: {
    fontSize: 16,
  },
  legendContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    borderRadius: 16,
    overflow: "hidden",
  },
  legendBlur: {
    borderRadius: 16,
  },
  legendGradient: {
    padding: 16,
    borderRadius: 16,
  },
  legendTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  legendSubtitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    marginTop: 4,
  },
  listContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  listBlur: {
    borderRadius: 20,
  },
  listGradient: {
    padding: 8,
    borderRadius: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  listItemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginRight: 12,
  },
  listItemDotGradient: {
    flex: 1,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  listItemDate: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  listItemArrow: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 18,
  },
  mapBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});