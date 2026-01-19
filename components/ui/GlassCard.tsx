import { View, StyleSheet, ViewStyle } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

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
  intensity = 40,
  delay = 0,
  direction = "up",
}: GlassCardProps) {
  const AnimatedView = Animated.View;
  const enterAnimation = direction === "up" 
    ? FadeInUp.delay(delay).springify().damping(15)
    : FadeInDown.delay(delay).springify().damping(15);

  return (
    <AnimatedView entering={enterAnimation} style={[styles.container, style]}>
      <View style={styles.glassContainer}>
        <BlurView intensity={intensity} tint="dark" style={styles.blur}>
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.12)",
              "rgba(255, 255, 255, 0.05)",
              "rgba(255, 255, 255, 0.02)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            <View style={styles.content}>{children}</View>
          </LinearGradient>
        </BlurView>
        <View style={styles.border} />
      </View>
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: "hidden",
  },
  glassContainer: {
    position: "relative",
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
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});