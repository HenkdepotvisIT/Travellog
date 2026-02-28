import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdventures } from "../hooks/useAdventures";
import { useImmichConnection } from "../hooks/useImmichConnection";
import GradientBackground from "../components/ui/GradientBackground";
import AdventureCardHorizontal from "../components/AdventureCardHorizontal";
import ConnectionModal from "../components/ConnectionModal";
import SyncProgressModal from "../components/SyncProgressModal";
import styles from "./HomePage.module.css";

function HeaderButton({
  icon,
  onPress,
  delay = 0,
  badge,
}: {
  icon: string;
  onPress: () => void;
  delay?: number;
  badge?: string;
}) {
  const delayClass =
    delay <= 100
      ? styles.animDelay100
      : delay <= 150
        ? styles.animDelay150
        : styles.animDelay200;

  return (
    <div className={`${styles.headerButtonWrapper} ${delayClass}`}>
      <button
        className={styles.headerButtonPressable}
        onClick={onPress}
        type="button"
      >
        <div className={styles.headerButton}>
          <span className={styles.headerButtonText}>{icon}</span>
          {badge && (
            <div className={styles.badge}>
              <span className={styles.badgeText}>{badge}</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  subtitle,
  color = "#3b82f6",
  delay = 0,
  compact = false,
}: {
  icon: string;
  value: string | number;
  label: string;
  subtitle?: string;
  color?: string;
  delay?: number;
  compact?: boolean;
}) {
  const delayClass =
    delay <= 350
      ? styles.animDelay350
      : delay <= 400
        ? styles.animDelay400
        : delay <= 450
          ? styles.animDelay450
          : styles.animDelay500;

  return (
    <div
      className={`${styles.statCard} ${compact ? styles.statCardCompact : ""} ${delayClass}`}
    >
      <div className={styles.statCardBlur}>
        <div
          className={`${styles.statCardGradient} ${compact ? styles.statCardGradientCompact : ""}`}
        >
          <div
            className={`${styles.statIcon} ${compact ? styles.statIconCompact : ""}`}
            style={{ backgroundColor: `${color}20` }}
          >
            <span
              className={`${styles.statIconText} ${compact ? styles.statIconTextCompact : ""}`}
            >
              {icon}
            </span>
          </div>
          <span
            className={`${styles.statValue} ${compact ? styles.statValueCompact : ""}`}
          >
            {value}
          </span>
          <span
            className={`${styles.statLabel} ${compact ? styles.statLabelCompact : ""}`}
          >
            {label}
          </span>
          {subtitle && !compact && (
            <span className={styles.statSubtitle}>{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function LargeStatCard({
  icon,
  value,
  label,
  subtitle,
  color = "#3b82f6",
  delay = 0,
  compact = false,
}: {
  icon: string;
  value: string | number;
  label: string;
  subtitle?: string;
  color?: string;
  delay?: number;
  compact?: boolean;
}) {
  const delayClass =
    delay <= 250 ? styles.animDelay250 : styles.animDelay300;

  return (
    <div className={`${styles.largeStatCard} ${delayClass}`}>
      <div className={styles.largeStatCardBlur}>
        <div
          className={`${styles.largeStatCardGradient} ${compact ? styles.largeStatCardGradientCompact : ""}`}
        >
          <div
            className={`${styles.largeStatContent} ${compact ? styles.largeStatContentCompact : ""}`}
          >
            <div
              className={`${styles.largeStatIcon} ${compact ? styles.largeStatIconCompact : ""}`}
              style={{ backgroundColor: `${color}30` }}
            >
              <span
                className={`${styles.largeStatIconText} ${compact ? styles.largeStatIconTextCompact : ""}`}
              >
                {icon}
              </span>
            </div>
            <div className={styles.largeStatText}>
              <span
                className={`${styles.largeStatValue} ${compact ? styles.largeStatValueCompact : ""}`}
              >
                {value}
              </span>
              <span
                className={`${styles.largeStatLabel} ${compact ? styles.largeStatLabelCompact : ""}`}
              >
                {label}
              </span>
              {subtitle && (
                <span
                  className={`${styles.largeStatSubtitle} ${compact ? styles.largeStatSubtitleCompact : ""}`}
                >
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();

  const isSmallScreen =
    typeof window !== "undefined" && window.innerWidth < 380;

  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [filters] = useState({
    dateRange: null as { start: Date; end: Date } | null,
    country: null as string | null,
    minDistance: 0,
  });

  const { isConnected, serverUrl, connect, disconnect } =
    useImmichConnection();
  const { adventures, loading, error, refresh, syncWithImmich, syncStatus } =
    useAdventures(filters);

  // Show connection modal on first load if not connected
  useEffect(() => {
    if (!isConnected && !loading && adventures.length === 0) {
      const timer = setTimeout(() => setShowConnectionModal(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, loading, adventures.length]);

  // Handle sync button press
  const handleSync = async () => {
    if (!isConnected) {
      setShowConnectionModal(true);
      return;
    }

    const result = await syncWithImmich();

    if (result.success) {
      if (result.adventuresCreated > 0 || result.adventuresUpdated > 0) {
        window.alert(
          `Sync Complete!\n\n` +
            `Found ${result.photosWithGps} photos with GPS data.\n\n` +
            `- ${result.adventuresCreated} new adventures created\n` +
            `- ${result.adventuresUpdated} adventures updated\n\n` +
            `Photos are loaded live from Immich - no extra storage used!`
        );
      } else if (result.photosWithGps === 0) {
        window.alert(
          "No GPS Data Found\n\n" +
            "None of your photos have GPS location data. Make sure your camera or phone saves location info with photos."
        );
      } else {
        window.alert(
          "Already Up to Date\n\n" +
            `Your ${adventures.length} adventures are already synced with Immich.`
        );
      }
    } else {
      window.alert(
        "Sync Failed\n\n" +
          (result.error ||
            "Failed to sync with Immich. Please check your connection.")
      );
    }
  };

  // Calculate statistics
  const stats = {
    totalAdventures: adventures.length,
    totalPhotos: adventures.reduce((sum, a) => sum + a.mediaCount, 0),
    totalDistance: adventures.reduce((sum, a) => sum + a.distance, 0),
    totalDays: adventures.reduce((sum, a) => sum + a.duration, 0),
    countries: new Set(adventures.map((a) => a.location)).size,
    averagePhotosPerTrip:
      adventures.length > 0
        ? Math.round(
            adventures.reduce((sum, a) => sum + a.mediaCount, 0) /
              adventures.length
          )
        : 0,
    longestTrip:
      adventures.length > 0
        ? Math.max(...adventures.map((a) => a.duration))
        : 0,
    mostPhotosInTrip:
      adventures.length > 0
        ? Math.max(...adventures.map((a) => a.mediaCount))
        : 0,
    favoriteAdventures: adventures.filter((a) => a.isFavorite).length,
    thisYear: adventures.filter((a) => {
      try {
        return new Date(a.startDate).getFullYear() === new Date().getFullYear();
      } catch {
        return false;
      }
    }).length,
  };

  return (
    <GradientBackground>
      <div className={styles.container}>
        {/* Header */}
        <div
          className={`${styles.header} ${isSmallScreen ? styles.headerCompact : ""}`}
        >
          <div className={styles.headerLeft}>
            <p
              className={`${styles.greeting} ${isSmallScreen ? styles.greetingCompact : ""}`}
            >
              {isConnected ? "Connected to Immich" : "Welcome"}
            </p>
            <h1
              className={`${styles.title} ${isSmallScreen ? styles.titleCompact : ""}`}
            >
              Your Adventures
            </h1>
          </div>
          <div className={styles.headerRight}>
            {isConnected && (
              <HeaderButton icon="🔄" onPress={handleSync} delay={100} />
            )}
            <HeaderButton
              icon={isConnected ? "✓" : "🔗"}
              onPress={() => setShowConnectionModal(true)}
              delay={150}
              badge={isConnected ? undefined : "!"}
            />
          </div>
        </div>

        {/* Connection Status */}
        <div
          className={`${styles.statusContainer} ${isSmallScreen ? styles.statusContainerCompact : ""}`}
        >
          <button
            className={styles.statusRow}
            onClick={() =>
              isConnected ? handleSync() : setShowConnectionModal(true)
            }
            type="button"
          >
            <div
              className={`${styles.statusDot} ${isConnected ? styles.statusConnected : styles.statusDisconnected}`}
            />
            <span
              className={`${styles.statusText} ${isSmallScreen ? styles.statusTextCompact : ""}`}
            >
              {isConnected
                ? `${serverUrl?.split("//")[1]?.split("/")[0] || "Immich"} \u2022 Tap to sync`
                : "Tap to connect to Immich"}
            </span>
            {syncStatus.lastSyncTime && (
              <span className={styles.lastSyncText}>
                Last: {new Date(syncStatus.lastSyncTime).toLocaleDateString()}
              </span>
            )}
          </button>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading adventures...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <span className={styles.errorEmoji}>😕</span>
            <p className={styles.errorText}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={refresh}
              type="button"
            >
              <span className={styles.retryButtonText}>Try Again</span>
            </button>
          </div>
        ) : adventures.length === 0 ? (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyEmoji}>🌍</span>
            <h2 className={styles.emptyTitle}>
              {isConnected ? "Ready to Sync!" : "No adventures yet"}
            </h2>
            <p className={styles.emptyText}>
              {isConnected
                ? "Tap the sync button to discover adventures from your Immich photos. Only photos with GPS data will be used."
                : "Connect to your Immich server to automatically discover your travel adventures from your photos."}
            </p>
            <button
              className={styles.connectButton}
              onClick={() =>
                isConnected ? handleSync() : setShowConnectionModal(true)
              }
              type="button"
            >
              <div className={styles.connectButtonGradient}>
                <span className={styles.connectButtonText}>
                  {isConnected ? "🔄 Sync Now" : "🔗 Connect to Immich"}
                </span>
              </div>
            </button>

            {isConnected && (
              <p className={styles.storageNote}>
                Photos are loaded directly from Immich - no extra storage used!
              </p>
            )}
          </div>
        ) : (
          <div className={styles.scrollContainer}>
            {/* Hero Stats */}
            <div
              className={`${styles.heroStatsSection} ${isSmallScreen ? styles.heroStatsSectionCompact : ""}`}
            >
              <LargeStatCard
                icon="🌍"
                value={stats.totalAdventures}
                label="Adventures"
                subtitle={`${stats.thisYear} this year`}
                color="#3b82f6"
                delay={250}
                compact={isSmallScreen}
              />
              <LargeStatCard
                icon="📸"
                value={stats.totalPhotos.toLocaleString()}
                label="Photos"
                subtitle={`${stats.averagePhotosPerTrip} avg`}
                color="#8b5cf6"
                delay={300}
                compact={isSmallScreen}
              />
            </div>

            {/* Detailed Stats Grid */}
            <div
              className={`${styles.statsGrid} ${isSmallScreen ? styles.statsGridCompact : ""}`}
            >
              <div
                className={`${styles.statCardWrapper} ${isSmallScreen ? styles.statCardWrapperCompact : ""}`}
              >
                <StatCard
                  icon="🗺️"
                  value={`${(stats.totalDistance / 1000).toFixed(1)}k`}
                  label="Distance"
                  subtitle="km traveled"
                  color="#06b6d4"
                  delay={350}
                  compact={isSmallScreen}
                />
              </div>
              <div
                className={`${styles.statCardWrapper} ${isSmallScreen ? styles.statCardWrapperCompact : ""}`}
              >
                <StatCard
                  icon="🏳️"
                  value={stats.countries}
                  label="Countries"
                  subtitle="Explored"
                  color="#10b981"
                  delay={400}
                  compact={isSmallScreen}
                />
              </div>
              <div
                className={`${styles.statCardWrapper} ${isSmallScreen ? styles.statCardWrapperCompact : ""}`}
              >
                <StatCard
                  icon="📅"
                  value={`${stats.totalDays}d`}
                  label="Days"
                  subtitle="Traveling"
                  color="#f59e0b"
                  delay={450}
                  compact={isSmallScreen}
                />
              </div>
              <div
                className={`${styles.statCardWrapper} ${isSmallScreen ? styles.statCardWrapperCompact : ""}`}
              >
                <StatCard
                  icon="❤️"
                  value={stats.favoriteAdventures}
                  label="Favorites"
                  subtitle="Loved"
                  color="#ef4444"
                  delay={500}
                  compact={isSmallScreen}
                />
              </div>
            </div>

            {/* Record Stats */}
            <div
              className={`${styles.recordsSection} ${isSmallScreen ? styles.recordsSectionCompact : ""} ${styles.animDelay550}`}
            >
              <h3
                className={`${styles.recordsTitle} ${isSmallScreen ? styles.recordsTitleCompact : ""}`}
              >
                🏆 Records
              </h3>
              <div className={styles.recordsGrid}>
                <div className={styles.recordCard}>
                  <span
                    className={`${styles.recordValue} ${isSmallScreen ? styles.recordValueCompact : ""}`}
                  >
                    {stats.longestTrip}d
                  </span>
                  <span
                    className={`${styles.recordLabel} ${isSmallScreen ? styles.recordLabelCompact : ""}`}
                  >
                    Longest
                  </span>
                </div>
                <div className={styles.recordCard}>
                  <span
                    className={`${styles.recordValue} ${isSmallScreen ? styles.recordValueCompact : ""}`}
                  >
                    {stats.mostPhotosInTrip}
                  </span>
                  <span
                    className={`${styles.recordLabel} ${isSmallScreen ? styles.recordLabelCompact : ""}`}
                  >
                    Most Photos
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Adventures Preview */}
            <div className={styles.adventuresSection}>
              <div
                className={`${styles.sectionHeader} ${isSmallScreen ? styles.sectionHeaderCompact : ""}`}
              >
                <h3
                  className={`${styles.sectionTitle} ${isSmallScreen ? styles.sectionTitleCompact : ""}`}
                >
                  Recent
                </h3>
                <button
                  className={styles.seeAllButton}
                  onClick={() => navigate("/adventures")}
                  type="button"
                >
                  <span className={styles.seeAllText}>See All →</span>
                </button>
              </div>

              <div className={styles.adventuresScroll}>
                {adventures.slice(0, 5).map((adventure, index) => (
                  <div key={adventure.id} className={styles.adventureCardWrapper}>
                    <AdventureCardHorizontal
                      adventure={adventure}
                      onPress={() => navigate(`/adventure/${adventure.id}`)}
                      index={index}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.bottomSpacer} />
          </div>
        )}

        {/* Connection Modal */}
        <ConnectionModal
          visible={showConnectionModal}
          onClose={() => setShowConnectionModal(false)}
          onConnect={connect}
          onDisconnect={disconnect}
          isConnected={isConnected}
          currentUrl={serverUrl}
        />

        {/* Sync Progress Modal */}
        <SyncProgressModal
          visible={syncStatus.isSyncing}
          syncStatus={syncStatus}
        />
      </div>
    </GradientBackground>
  );
}
