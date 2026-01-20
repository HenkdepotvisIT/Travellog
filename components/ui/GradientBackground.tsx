import { View, StyleSheet, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { useEffect } from "react";

const { width, height } = Dimensions.get("window");

interface GradientBackgroundProps {
  children: React.ReactNode;
}

function FloatingParticle({ 
  size, 
  color, 
  initialX, 
  initialY, 
  duration,
  delay = 0 
}: {
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  duration: number;
  delay?: number;
}) {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (Platform.OS !== "web") {
      // Vertical floating motion
      translateY.value = withRepeat(
        withTiming(-50, { 
          duration: duration + Math.random() * 2000, 
          easing: Easing.inOut(Easing.sine) 
        }),
        -1,
        true
      );

      // Horizontal drift
      translateX.value = withRepeat(
        withTiming(30, { 
          duration: duration * 1.5, 
          easing: Easing.inOut(Easing.sine) 
        }),
        -1,
        true
      );

      // Opacity pulse
      opacity.value = withRepeat(
        withTiming(0.1, { 
          duration: duration * 0.8, 
          easing: Easing.inOut(Easing.ease) 
        }),
        -1,
        true
      );

      // Scale pulse
      scale.value = withRepeat(
        withTiming(1.2, { 
          duration: duration * 1.2, 
          easing: Easing.inOut(Easing.ease) 
        }),
        -1,
        true
      );
    }
  }, [duration]);

  const animatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === "web") {
      return {
        opacity: 0.2,
      };
    }
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          width: size,
          height: size,
          backgroundColor: color,
          left: initialX,
          top: initialY,
        },
        animatedStyle,
      ]}
    />
  );
}

function MovingOrb({ 
  size, 
  color, 
  initialPosition, 
  shadowColor 
}: {
  size: number;
  color: string;
  initialPosition: { x: number; y: number };
  shadowColor: string;
}) {
  const rotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (Platform.OS !== "web") {
      rotation.value = withRepeat(
        withTiming(360, { duration: 25000, easing: Easing.linear }),
        -1,
        false
      );

      translateX.value = withRepeat(
        withTiming(50, { duration: 8000, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      );

      translateY.value = withRepeat(
        withTiming(30, { duration: 12000, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      );

      scale.value = withRepeat(
        withTiming(1.1, { duration: 6000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
    }
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    if (Platform.OS === "web") {
      return {};
    }
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          backgroundColor: color,
          left: initialPosition.x,
          top: initialPosition.y,
          shadowColor,
        },
        animatedStyle,
      ]}
    />
  );
}

export default function GradientBackground({ children }: GradientBackgroundProps) {
  // Generate random particles
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 4)],
    initialX: Math.random() * width,
    initialY: Math.random() * height,
    duration: Math.random() * 3000 + 4000,
    delay: Math.random() * 2000,
  }));

  return (
    <View style={styles.container}>
      {/* Base gradient */}
      <LinearGradient
        colors={["#0a0a1a", "#0f172a", "#1a1a2e"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Moving orbs */}
      <View style={styles.orbContainer}>
        <MovingOrb
          size={width * 0.8}
          color="#3b82f6"
          initialPosition={{ x: -width * 0.2, y: -width * 0.2 }}
          shadowColor="#3b82f6"
        />
        <MovingOrb
          size={width * 0.6}
          color="#8b5cf6"
          initialPosition={{ x: width * 0.6, y: height * 0.7 }}
          shadowColor="#8b5cf6"
        />
        <MovingOrb
          size={width * 0.5}
          color="#06b6d4"
          initialPosition={{ x: -width * 0.1, y: height * 0.8 }}
          shadowColor="#06b6d4"
        />
      </View>

      {/* Floating particles */}
      <View style={styles.particleContainer}>
        {particles.map((particle) => (
          <FloatingParticle
            key={particle.id}
            size={particle.size}
            color={particle.color}
            initialX={particle.initialX}
            initialY={particle.initialY}
            duration={particle.duration}
            delay={particle.delay}
          />
        ))}
      </View>

      {/* Subtle grid overlay */}
      <View style={styles.gridOverlay}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              {
                top: `${i * 5}%`,
                width: '100%',
                height: 1,
                opacity: 0.03,
              },
            ]}
          />
        ))}
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              {
                left: `${i * 6.67}%`,
                height: '100%',
                width: 1,
                opacity: 0.03,
              },
            ]}
          />
        ))}
      </View>

      {/* Noise overlay */}
      <View style={styles.noiseOverlay} />

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a1a",
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    opacity: 0.4,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 100,
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: "absolute",
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "#3b82f6",
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  content: {
    flex: 1,
  },
});