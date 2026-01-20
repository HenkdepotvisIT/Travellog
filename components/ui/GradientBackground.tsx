import { View, StyleSheet, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
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
  const opacity = useSharedValue(0.4);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (Platform.OS !== "web") {
      translateY.value = withRepeat(
        withTiming(-40, { 
          duration: duration + Math.random() * 2000, 
          easing: Easing.inOut(Easing.sine) 
        }),
        -1,
        true
      );

      translateX.value = withRepeat(
        withTiming(25, { 
          duration: duration * 1.5, 
          easing: Easing.inOut(Easing.sine) 
        }),
        -1,
        true
      );

      opacity.value = withRepeat(
        withTiming(0.1, { 
          duration: duration * 0.8, 
          easing: Easing.inOut(Easing.ease) 
        }),
        -1,
        true
      );

      scale.value = withRepeat(
        withTiming(1.1, { 
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
        opacity: 0.15,
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
        withTiming(360, { duration: 30000, easing: Easing.linear }),
        -1,
        false
      );

      translateX.value = withRepeat(
        withTiming(40, { duration: 10000, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      );

      translateY.value = withRepeat(
        withTiming(25, { duration: 15000, easing: Easing.inOut(Easing.sine) }),
        -1,
        true
      );

      scale.value = withRepeat(
        withTiming(1.05, { duration: 8000, easing: Easing.inOut(Easing.ease) }),
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
  // Generate light-colored particles
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 3 + 2,
    color: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'][Math.floor(Math.random() * 5)],
    initialX: Math.random() * width,
    initialY: Math.random() * height,
    duration: Math.random() * 4000 + 5000,
    delay: Math.random() * 2000,
  }));

  return (
    <View style={styles.container}>
      {/* Light gradient background */}
      <LinearGradient
        colors={["#f8fafc", "#e2e8f0", "#cbd5e1"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle colored orbs */}
      <View style={styles.orbContainer}>
        <MovingOrb
          size={width * 0.6}
          color="rgba(59, 130, 246, 0.08)"
          initialPosition={{ x: -width * 0.1, y: -width * 0.1 }}
          shadowColor="#3b82f6"
        />
        <MovingOrb
          size={width * 0.5}
          color="rgba(139, 92, 246, 0.06)"
          initialPosition={{ x: width * 0.7, y: height * 0.8 }}
          shadowColor="#8b5cf6"
        />
        <MovingOrb
          size={width * 0.4}
          color="rgba(6, 182, 212, 0.05)"
          initialPosition={{ x: -width * 0.05, y: height * 0.9 }}
          shadowColor="#06b6d4"
        />
      </View>

      {/* Light floating particles */}
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
        {Array.from({ length: 15 }).map((_, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLine,
              {
                top: `${i * 6.67}%`,
                width: '100%',
                height: 1,
                opacity: 0.02,
              },
            ]}
          />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLine,
              {
                left: `${i * 8.33}%`,
                height: '100%',
                width: 1,
                opacity: 0.02,
              },
            ]}
          />
        ))}
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 50,
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: "absolute",
    borderRadius: 999,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLine: {
    position: "absolute",
    backgroundColor: "#64748b",
  },
  content: {
    flex: 1,
  },
});