import type { ReactNode } from "react";
import styles from "./GradientBackground.module.css";

interface GradientBackgroundProps {
  children: ReactNode;
}

export default function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <div className={styles.container}>
      <div className={styles.gradient} />
      <div className={styles.orbContainer}>
        <div className={`${styles.orb} ${styles.orbBlue}`} />
        <div className={`${styles.orb} ${styles.orbPurple}`} />
        <div className={`${styles.orb} ${styles.orbCyan}`} />
      </div>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
