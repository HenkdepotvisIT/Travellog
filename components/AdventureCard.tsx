import { View, Text, Pressable, Image, StyleSheet, Dimensions } from "react-native";
import { Adventure } from "../types";

const { width } = Dimensions.get("window");

interface AdventureCardProps {
  adventure: Adventure;
  onPress: () => void;
}

export default function AdventureCard({ adventure, onPress }: AdventureCardProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      {/* Cover Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: adventure.coverPhoto }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay} />
        <View style={styles.locationBadge}>
          <Text style={styles.locationText}>📍 {adventure.location}</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>{adventure.title}</Text>
        <Text style={styles.dates}>
          {adventure.startDate} - {adventure.endDate}
        </Text>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{adventure.mediaCount}</Text>
            <Text style={styles.statLabel}>Photos</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{adventure.distance}km</Text>
            <Text style={styles.statLabel}>Distance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{adventure.duration}d</Text>
            <Text style={styles.statLabel}>Duration</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{adventure.stops}</Text>
            <Text style={styles.statLabel}>Stops</Text>
          </View>
        </View>

        {/* Photo Grid Preview */}
        <View style={styles.photoGrid}>
          {adventure.photos.slice(0, 4).map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={[
                styles.gridPhoto,
                index === 3 && adventure.photos.length > 4 && styles.lastPhoto,
              ]}
              resizeMode="cover"
            />
          ))}
          {adventure.photos.length > 4 && (
            <View style={styles.morePhotosOverlay}>
              <Text style={styles.morePhotosText}>
                +{adventure.photos.length - 4}
              </Text>
            </View>
          )}
        </View>

        {/* AI Summary Preview */}
        <Text style={styles.summary} numberOfLines={2}>
          {adventure.aiSummary}
        </Text>

        {/* View More */}
        <View style={styles.viewMore}>
          <Text style={styles.viewMoreText}>View Adventure →</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
  },
  imageContainer: {
    height: 180,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  locationBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  locationText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  dates: {
    fontSize: 13,
    color: "#94a3b8",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  statLabel: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#334155",
  },
  photoGrid: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
    position: "relative",
  },
  gridPhoto: {
    flex: 1,
    height: 60,
    borderRadius: 8,
  },
  lastPhoto: {
    opacity: 0.5,
  },
  morePhotosOverlay: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: (width - 40 - 12) / 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 8,
  },
  morePhotosText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  summary: {
    fontSize: 13,
    color: "#94a3b8",
    lineHeight: 20,
    marginBottom: 12,
  },
  viewMore: {
    alignItems: "flex-end",
  },
  viewMoreText: {
    color: "#3b82f6",
    fontSize: 14,
    fontWeight: "600",
  },
});