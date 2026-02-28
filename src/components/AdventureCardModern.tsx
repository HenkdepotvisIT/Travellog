import { Adventure } from "../types";
import styles from "./AdventureCardModern.module.css";

interface AdventureCardModernProps {
  adventure: Adventure;
  onPress: () => void;
  index: number;
}

export default function AdventureCardModern({
  adventure,
  onPress,
  index,
}: AdventureCardModernProps) {
  return (
    <button
      className={styles.container}
      onClick={onPress}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <img src={adventure.coverPhoto} alt={adventure.title} className={styles.backgroundImage} />
      <div className={styles.gradient} />

      <div className={styles.topBadge}>
        <span className={styles.badgeText}>📍 {adventure.location}</span>
      </div>

      {adventure.isFavorite && (
        <div className={styles.favoriteBadge}>
          <span>❤️</span>
        </div>
      )}

      <div className={styles.content}>
        <h3 className={styles.title}>{adventure.title}</h3>
        <p className={styles.dates}>
          {adventure.startDate} → {adventure.endDate}
        </p>

        <div className={styles.statsContainer}>
          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <span className={styles.statIcon}>📸</span>
              <span className={styles.statValue}>{adventure.mediaCount}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statIcon}>📏</span>
              <span className={styles.statValue}>{adventure.distance}km</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statIcon}>⏱️</span>
              <span className={styles.statValue}>{adventure.duration}d</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statIcon}>📍</span>
              <span className={styles.statValue}>{adventure.stops}</span>
            </div>
          </div>
        </div>

        {adventure.aiSummary && (
          <p className={styles.summary}>{adventure.aiSummary}</p>
        )}

        <div className={styles.photoStrip}>
          {adventure.photos.slice(0, 4).map((photo, idx) => (
            <div key={idx} className={styles.photoThumb}>
              <img src={photo} alt="" className={styles.photoThumbImage} />
              {idx === 3 && adventure.photos.length > 4 && (
                <div className={styles.morePhotos}>
                  <span className={styles.morePhotosText}>
                    +{adventure.photos.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}
