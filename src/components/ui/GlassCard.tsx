import type { ReactNode, CSSProperties } from "react";
import styles from "./GlassCard.module.css";

interface GlassCardProps {
  children: ReactNode;
  style?: CSSProperties;
  delay?: number;
  direction?: "up" | "down";
}

export default function GlassCard({
  children,
  style,
  delay = 0,
  direction = "up",
}: GlassCardProps) {
  const animationName = direction === "up" ? "fadeInUp" : "fadeInDown";

  return (
    <div
      className={styles.container}
      style={{
        animation: `${animationName} 0.3s ease-out ${delay}ms both`,
        ...style,
      }}
    >
      <div className={styles.glass}>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
