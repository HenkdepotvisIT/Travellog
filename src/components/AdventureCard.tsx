import { Adventure } from "../types";
import styles from "./AdventureCard.module.css";

interface AdventureCardProps {
  adventure: Adventure;
  onPress: () => void;
}

export default function AdventureCard({ adventure, onPress }: AdventureCardProps) {
  return (
    <button className={styles.container} onClick={onPress}>
      <div className={styles.imageContainer}>
        <img src={adventure.coverPhoto} alt={adventure.title} className={styles.coverImage} />
        <div className={styles.imageOverlay} />
        <div className={styles.locationBadge}>
          <span className={styles.locationText}>📍 {adventure.location}</span>
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{adventure.title}</h3>
        <p className={styles.dates}>
          {adventure.startDate} - {adventure.endDate}
        </p>

        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{adventure.mediaCount}</span>
            <span className={styles.statLabel}>Photos</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{adventure.distance}km</span>
            <span className={styles.statLabel}>Distance</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{adventure.duration}d</span>
            <span className={styles.statLabel}>Duration</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statValue}>{adventure.stops}</span>
            <span className={styles.statLabel}>Stops</span>
          </div>
        </div>

        <div className={styles.photoGrid}>
          {adventure.photos.slice(0, 4).map((photo, index) => (
            <div key={index} className={styles.gridPhotoWrapper}>
              <img src={photo} alt="" className={styles.gridPhoto} />
              {index === 3 && adventure.photos.length > 4 && (
                <div className={styles.morePhotosOverlay}>
                  <span className={styles.morePhotosText}>
                    +{adventure.photos.length - 4}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {adventure.aiSummary && (
          <p className={styles.summary}>{adventure.aiSummary}</p>
        )}

        <div className={styles.viewMore}>
          <span className={styles.viewMoreText}>View Adventure →</span>
        </div>
      </div>
    </button>
  );
}
