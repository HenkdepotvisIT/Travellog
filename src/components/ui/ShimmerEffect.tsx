import type { CSSProperties } from "react";
import styles from "./ShimmerEffect.module.css";

interface ShimmerEffectProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: CSSProperties;
}

export default function ShimmerEffect({
  width: shimmerWidth = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: ShimmerEffectProps) {
  return (
    <div
      className={styles.container}
      style={{ width: shimmerWidth, height, borderRadius, ...style }}
    >
      <div className={styles.shimmer} />
    </div>
  );
}
