import type { CSSProperties } from "react";
import styles from "./AnimatedButton.module.css";

interface AnimatedButtonProps {
  onPress: () => void;
  title: string;
  icon?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: CSSProperties;
  textStyle?: CSSProperties;
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
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]} ${styles[size]}`}
      style={style}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.text} style={textStyle}>
        {title}
      </span>
    </button>
  );
}
