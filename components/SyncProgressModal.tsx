import { View, Text, Modal, StyleSheet, ActivityIndicator } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInUp } from "react-native-reanimated";
import { SyncStatus } from "../types";

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
  
  const getPhaseIcon = () => {
    switch (syncProgress?.phase) {
      case "fetching":
        return "📡";
      case "clustering":
        return "🗺️";
      case "saving":
        return "💾";
      case "done":
        return "✅";
      default:
        return "🔄";
    }
  };

  const getPhaseTitle = () => {
    switch (syncProgress?.phase) {
      case "fetching":
        return "Fetching Photos";
      case "clustering":
        return "Creating Adventures";
      case "saving":
        return "Saving Data";
      case "done":
        return "Sync Complete!";
      default:
        return "Syncing...";
    }
  };

  const progress = syncProgress?.total && syncProgress.total > 0
    ? Math.round((syncProgress.current / syncProgress.total) * 100)
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          entering={FadeInUp.springify().damping(15)}
          style={styles.container}
        >
          <BlurView intensity={100} tint="dark" style={styles.blur}>
            <LinearGradient
              colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.05)"]}
              style={styles.content}
            >
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{getPhaseIcon()}</Text>
                {syncProgress?.phase !== "done" && (
                  <ActivityIndicator 
                    style={styles.spinner} 
                    size="large" 
                    color="#3b82f6" 
                  />
                )}
              </View>

              {/* Title */}
              <Text style={styles.title}>{getPhaseTitle()}</Text>

              {/* Message */}
              <Text style={styles.message}>
                {syncProgress?.message || "Please wait..."}
              </Text>

              {/* Progress Bar */}
              {syncProgress && syncProgress.total > 0 && syncProgress.phase !== "done" && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <LinearGradient
                      colors={["#3b82f6", "#8b5cf6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${progress}%` }]}
                    />
                  </View>
                  <Text style={styles.progressText}>{progress}%</Text>
                </View>
              )}

              {/* Stats */}
              {syncProgress?.phase === "done" && (
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{syncProgress.current}</Text>
                    <Text style={styles.statLabel}>Adventures</Text>
                  </View>
                </View>
              )}

              {/* Info */}
              <View style={styles.infoBox}>
                <Text style={styles.infoIcon}>💡</Text>
                <Text style={styles.infoText}>
                  Photos are loaded directly from Immich - no storage space used!
                </Text>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  container: {
    width: "100%",
    maxWidth: 340,
    borderRadius: 24,
    overflow: "hidden",
  },
  blur: {
    borderRadius: 24,
  },
  content: {
    padding: 28,
    alignItems: "center",
    borderRadius: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 48,
  },
  spinner: {
    position: "absolute",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginBottom: 24,
  },
  progressContainer: {
    width: "100%",
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  statItem: {
    alignItems: "center",
    paddingHorizontal: 24,
  },
  statValue: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.6)",
    marginTop: 4,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(59, 130, 246, 0.15)",
    borderRadius: 12,
    padding: 12,
    width: "100%",
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 18,
  },
});