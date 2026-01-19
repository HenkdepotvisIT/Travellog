import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  FlatList,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useAdventure } from "../../hooks/useAdventure";
import PhotoGrid from "../../components/PhotoGrid";
import AdventureMap from "../../components/AdventureMap";
import StatsCard from "../../components/StatsCard";

const { width } = Dimensions.get("window");

export default function AdventureDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { adventure, loading, error, updateNarrative } = useAdventure(id);
  const [isEditingNarrative, setIsEditingNarrative] = useState(false);
  const [narrativeText, setNarrativeText] = useState("");
  const [activeTab, setActiveTab] = useState<"photos" | "map" | "story">("photos");

  useEffect(() => {
    if (adventure?.narrative) {
      setNarrativeText(adventure.narrative);
    }
  }, [adventure?.narrative]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading adventure...</Text>
      </View>
    );
  }

  if (error || !adventure) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>❌ {error || "Adventure not found"}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleSaveNarrative = () => {
    updateNarrative(narrativeText);
    setIsEditingNarrative(false);
  };

  return (
    <View style={styles.container}>
      {/* Header with Cover Image */}
      <View style={styles.coverContainer}>
        <Image
          source={{ uri: adventure.coverPhoto }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.coverOverlay} />
        <Pressable style={styles.backButtonHeader} onPress={() => router.back()}>
          <Text style={styles.backButtonIcon}>←</Text>
        </Pressable>
        <View style={styles.coverContent}>
          <Text style={styles.adventureTitle}>{adventure.title}</Text>
          <Text style={styles.adventureDates}>
            {adventure.startDate} - {adventure.endDate}
          </Text>
          <View style={styles.locationBadge}>
            <Text style={styles.locationText}>📍 {adventure.location}</Text>
          </View>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <StatsCard icon="📸" value={adventure.mediaCount} label="Photos" />
        <StatsCard icon="📏" value={`${adventure.distance}km`} label="Distance" />
        <StatsCard icon="⏱️" value={`${adventure.duration}d`} label="Duration" />
        <StatsCard icon="📍" value={adventure.stops} label="Stops" />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "photos" && styles.tabActive]}
          onPress={() => setActiveTab("photos")}
        >
          <Text style={[styles.tabText, activeTab === "photos" && styles.tabTextActive]}>
            Photos
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "map" && styles.tabActive]}
          onPress={() => setActiveTab("map")}
        >
          <Text style={[styles.tabText, activeTab === "map" && styles.tabTextActive]}>
            Map
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "story" && styles.tabActive]}
          onPress={() => setActiveTab("story")}
        >
          <Text style={[styles.tabText, activeTab === "story" && styles.tabTextActive]}>
            Story
          </Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === "photos" && (
          <PhotoGrid photos={adventure.photos} />
        )}

        {activeTab === "map" && (
          <AdventureMap
            route={adventure.route}
            stops={adventure.stopPoints}
          />
        )}

        {activeTab === "story" && (
          <View style={styles.storyContainer}>
            <View style={styles.storyHeader}>
              <Text style={styles.storyTitle}>Adventure Story</Text>
              <Pressable
                style={styles.editButton}
                onPress={() => setIsEditingNarrative(!isEditingNarrative)}
              >
                <Text style={styles.editButtonText}>
                  {isEditingNarrative ? "Cancel" : "✏️ Edit"}
                </Text>
              </Pressable>
            </View>

            {isEditingNarrative ? (
              <View>
                <TextInput
                  style={styles.narrativeInput}
                  value={narrativeText}
                  onChangeText={setNarrativeText}
                  multiline
                  placeholder="Write your adventure story..."
                  placeholderTextColor="#64748b"
                />
                <Pressable style={styles.saveButton} onPress={handleSaveNarrative}>
                  <Text style={styles.saveButtonText}>Save Story</Text>
                </Pressable>
              </View>
            ) : (
              <Text style={styles.narrativeText}>
                {adventure.narrative || "No story written yet. Tap edit to add your adventure narrative."}
              </Text>
            )}

            {/* AI Generated Summary */}
            <View style={styles.aiSummaryContainer}>
              <View style={styles.aiSummaryHeader}>
                <Text style={styles.aiSummaryTitle}>✨ AI Summary</Text>
              </View>
              <Text style={styles.aiSummaryText}>{adventure.aiSummary}</Text>
            </View>

            {/* Highlights */}
            <View style={styles.highlightsContainer}>
              <Text style={styles.highlightsTitle}>🌟 Highlights</Text>
              {adventure.highlights.map((highlight, index) => (
                <View key={index} style={styles.highlightItem}>
                  <Text style={styles.highlightBullet}>•</Text>
                  <Text style={styles.highlightText}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Export Button */}
      <View style={styles.exportContainer}>
        <Pressable style={styles.exportButton}>
          <Text style={styles.exportButtonText}>📤 Export Adventure</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 20,
  },
  errorText: {
    color: "#ef4444",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  coverContainer: {
    height: 280,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backButtonHeader: {
    position: "absolute",
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonIcon: {
    color: "#ffffff",
    fontSize: 20,
  },
  coverContent: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
  adventureTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  adventureDates: {
    fontSize: 14,
    color: "#e2e8f0",
    marginBottom: 8,
  },
  locationBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  locationText: {
    color: "#ffffff",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  tabActive: {
    backgroundColor: "#3b82f6",
  },
  tabText: {
    color: "#94a3b8",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  storyContainer: {
    gap: 20,
  },
  storyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#1e293b",
    borderRadius: 8,
  },
  editButtonText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  narrativeInput: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
    minHeight: 200,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 12,
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  narrativeText: {
    color: "#e2e8f0",
    fontSize: 16,
    lineHeight: 26,
  },
  aiSummaryContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  aiSummaryHeader: {
    marginBottom: 8,
  },
  aiSummaryTitle: {
    color: "#8b5cf6",
    fontWeight: "bold",
    fontSize: 14,
  },
  aiSummaryText: {
    color: "#e2e8f0",
    fontSize: 14,
    lineHeight: 22,
  },
  highlightsContainer: {
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
  },
  highlightsTitle: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  highlightItem: {
    flexDirection: "row",
    marginBottom: 8,
  },
  highlightBullet: {
    color: "#3b82f6",
    marginRight: 8,
    fontSize: 16,
  },
  highlightText: {
    color: "#e2e8f0",
    fontSize: 14,
    flex: 1,
  },
  exportContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "#0f172a",
  },
  exportButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  exportButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
});