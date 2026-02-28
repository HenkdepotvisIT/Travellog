import { Adventure } from "../types";
import styles from "./AdventureCardHorizontal.module.css";

interface AdventureCardHorizontalProps {
  adventure: Adventure;
  onPress: () => void;
  index: number;
}

export default function AdventureCardHorizontal({
  adventure,
  onPress,
  index,
}: AdventureCardHorizontalProps) {
  return (
    <button
      className={styles.container}
      onClick={onPress}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <img src={adventure.coverPhoto} alt={adventure.title} className={styles.backgroundImage} />
      <div className={styles.gradient} />

      {adventure.isFavorite && (
        <div className={styles.favoriteBadge}>
          <span>❤️</span>
        </div>
      )}

      <div className={styles.content}>
        <div className={styles.locationRow}>
          <span className={styles.locationEmoji}>📍</span>
          <span className={styles.location}>{adventure.location}</span>
        </div>

        <h3 className={styles.title}>{adventure.title}</h3>

        <p className={styles.dates}>
          {adventure.startDate} - {adventure.endDate}
        </p>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{adventure.mediaCount}</span>
            <span className={styles.statLabel}>photos</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{adventure.duration}d</span>
            <span className={styles.statLabel}>days</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{adventure.distance}km</span>
            <span className={styles.statLabel}>dist</span>
          </div>
        </div>

        {adventure.aiSummary && (
          <p className={styles.summary}>{adventure.aiSummary}</p>
        )}
      </div>
    </button>
  );
}
