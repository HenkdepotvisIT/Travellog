import styles from "./StatsCard.module.css";

interface StatsCardProps {
  icon: string;
  value: string | number;
  label: string;
}

export default function StatsCard({ icon, value, label }: StatsCardProps) {
  return (
    <div className={styles.container}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  );
}
