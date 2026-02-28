import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdventures } from "../hooks/useAdventures";
import GradientBackground from "../components/ui/GradientBackground";
import MapViewModern from "../components/MapViewModern";
import styles from "./MapPage.module.css";

export function MapPage() {
  const isSmallScreen = window.innerWidth < 380;

  const [filters] = useState({
    dateRange: null as { start: Date; end: Date } | null,
    country: null as string | null,
    minDistance: 0,
  });

  const { adventures, loading } = useAdventures(filters);
  const navigate = useNavigate();

  const handleAdventurePress = (adventureId: string) => {
    navigate(`/adventure/${adventureId}`);
  };

  return (
    <GradientBackground>
      <div className={styles.container}>
        {/* Header */}
        <div
          className={`${styles.header} ${isSmallScreen ? styles.headerCompact : ""}`}
        >
          <div className={styles.headerLeft}>
            <h1 className={`${styles.title} ${isSmallScreen ? styles.titleCompact : ""}`}>
              World Map
            </h1>
            <p className={`${styles.subtitle} ${isSmallScreen ? styles.subtitleCompact : ""}`}>
              {adventures.length} adventures &bull;{" "}
              {new Set(adventures.map((a) => a.location)).size} countries
            </p>
          </div>
        </div>

        {/* Map Content */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <span className={styles.loadingEmoji}>&#x1F5FA;&#xFE0F;</span>
            <span className={styles.loadingText}>Loading map...</span>
          </div>
        ) : adventures.length === 0 ? (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyEmoji}>&#x1F30D;</span>
            <h2 className={styles.emptyTitle}>No adventures</h2>
            <p className={styles.emptyText}>
              Connect to Immich to see your travels
            </p>
          </div>
        ) : (
          <MapViewModern
            adventures={adventures}
            onAdventurePress={handleAdventurePress}
          />
        )}
      </div>
    </GradientBackground>
  );
}
