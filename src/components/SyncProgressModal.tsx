import { SyncStatus } from "../types";
import styles from "./SyncProgressModal.module.css";

interface SyncProgressModalProps {
  visible: boolean;
  syncStatus: SyncStatus;
  onClose?: () => void;
}

export default function SyncProgressModal({
  visible,
  syncStatus,
  onClose,
}: SyncProgressModalProps) {
  const { syncProgress } = syncStatus;

  if (!visible) return null;

  const getPhaseIcon = () => {
    switch (syncProgress?.phase) {
      case "fetching": return "📡";
      case "clustering": return "🗺️";
      case "saving": return "💾";
      case "done": return "✅";
      default: return "🔄";
    }
  };

  const getPhaseTitle = () => {
    switch (syncProgress?.phase) {
      case "fetching": return "Fetching Photos";
      case "clustering": return "Creating Adventures";
      case "saving": return "Saving Data";
      case "done": return "Sync Complete!";
      default: return "Syncing...";
    }
  };

  const progress = syncProgress?.total && syncProgress.total > 0
    ? Math.round((syncProgress.current / syncProgress.total) * 100)
    : 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconContainer}>
          <span className={styles.icon}>{getPhaseIcon()}</span>
          {syncProgress?.phase !== "done" && (
            <div className={styles.spinner} />
          )}
        </div>

        <h2 className={styles.title}>{getPhaseTitle()}</h2>

        <p className={styles.message}>
          {syncProgress?.message || "Please wait..."}
        </p>

        {syncProgress && syncProgress.total > 0 && syncProgress.phase !== "done" && (
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <span className={styles.progressText}>{progress}%</span>
          </div>
        )}

        {syncProgress?.phase === "done" && (
          <div className={styles.statsContainer}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{syncProgress.current}</span>
              <span className={styles.statLabel}>Adventures</span>
            </div>
          </div>
        )}

        <div className={styles.infoBox}>
          <span className={styles.infoIcon}>💡</span>
          <span className={styles.infoText}>
            Photos are loaded directly from Immich - no storage space used!
          </span>
        </div>
      </div>
    </div>
  );
}
