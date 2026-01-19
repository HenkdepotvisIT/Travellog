import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  icon?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AnimatedButton({
  onPress,
  title,
  icon,
  variant = "primary",
  size = "md",
  disabled = false,
  style,
  textStyle,
}: AnimatedButtonProps) {
  const scale = useSharedValue(1);
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: disabled ? 0.5 : 1,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    pressed.value = withTiming(1, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    pressed.value = withTiming(0, { duration: 200 });
  };

  const sizeStyles = {
    sm: { paddingVertical: 10, paddingHorizontal: 16 },
    md: { paddingVertical: 14, paddingHorizontal: 24 },
    lg: { paddingVertical: 18, paddingHorizontal: 32 },
  };

  const textSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  };

  const gradientColors = {
    primary: ["#3b82f6", "#2563eb", "#1d4ed8"] as const,
    secondary: ["rgba(255,255,255,0.15)", "rgba(255,255,255,0.08)"] as const,
    ghost: ["transparent", "transparent"] as const,
    danger: ["#ef4444", "#dc2626", "#b91c1c"] as const,
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      style={[animatedStyle, style]}
    >
      <LinearGradient
        colors={gradientColors[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          sizeStyles[size],
          variant === "secondary" && styles.secondaryBorder,
          variant === "ghost" && styles.ghostButton,
        ]}
      >
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text
          style={[
            styles.text,
            { fontSize: textSizes[size] },
            variant === "ghost" && styles.ghostText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    gap: 8,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  text: {
    color: "#ffffff",
    fontWeight: "600",
  },
  ghostText: {
    color: "#94a3b8",
  },
  icon: {
    fontSize: 18,
  },
});