import { View, StyleSheet, ViewStyle, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, FadeIn } from "react-native-reanimated";

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  delay?: number;
  direction?: "up" | "down";
}

export default function GlassCard({
  children,
  style,
  intensity = 60,
  delay = 0,
  direction = "up",
}: GlassCardProps) {
  // Use simpler animation on web to avoid DOM issues
  const enterAnimation = Platform.OS === "web"
    ? FadeIn.delay(delay).duration(300)
    : direction === "up" 
      ? FadeInUp.delay(delay).springify().damping(15)
      : FadeInDown.delay(delay).springify().damping(15);

  return (
    <Animated.View entering={enterAnimation} style={[styles.container, style]}>
      <View style={styles.glassContainer}>
        <BlurView intensity={intensity} tint="light" style={styles.blur}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.9)",
              "rgba(255, 255, 255, 0.7)",
              "rgba(255, 255, 255, 0.5)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.content}>{children}</View>
          </LinearGradient>
        </BlurView>
        <View style={styles.border} />
        <View style={styles.shadow} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: "visible",
  },
  glassContainer: {
    position: "relative",
    borderRadius: 24,
    overflow: "hidden",
  },
  blur: {
    overflow: "hidden",
    borderRadius: 24,
  },
  gradient: {
    borderRadius: 24,
  },
  content: {
    padding: 20,
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.08)",
    pointerEvents: "none",
  },
  shadow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: "transparent",
    pointerEvents: "none",
  },
});