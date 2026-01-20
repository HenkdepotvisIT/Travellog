import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { AdventureFilters } from "../types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface FilterControlsModernProps {
  filters: AdventureFilters;
  onFiltersChange: (filters: AdventureFilters) => void;
}

const COUNTRIES = [
  "All",
  "Japan",
  "Italy",
  "Norway",
  "France",
  "Spain",
  "USA",
  "Thailand",
  "Australia",
];

function FilterChip({
  label,
  isActive,
  onPress,
  delay = 0,
}: {
  label: string;
  isActive: boolean;
  onPress: () => void;
  delay?: number;
}) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View entering={FadeIn.delay(delay).duration(200)}>
      <AnimatedPressable
        onPress={onPress}
        onPressIn={() => {
          scale.value = withSpring(0.95);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={animatedStyle}
      >
        {isActive ? (
          <LinearGradient
            colors={["#3b82f6", "#2563eb"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.chip}
          >
            <Text style={styles.chipTextActive}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={[styles.chip, styles.chipInactive]}>
            <Text style={styles.chipText}>{label}</Text>
          </View>
        )}
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function FilterControlsModern({
  filters,
  onFiltersChange,
}: FilterControlsModernProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [
    filters.dateRange,
    filters.country,
    filters.minDistance > 0,
  ].filter(Boolean).length;

  const handleCountrySelect = (country: string) => {
    onFiltersChange({
      ...filters,
      country: country === "All" ? null : country,
    });
  };

  // Use simpler modal animation on web
  const modalEntering = Platform.OS === "web" 
    ? FadeIn.duration(200)
    : SlideInDown.springify().damping(15);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Button */}
        <Animated.View entering={FadeIn.duration(200)}>
          <Pressable
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <BlurView intensity={60} tint="dark" style={styles.filterButtonBlur}>
              <LinearGradient
                colors={
                  activeFiltersCount > 0
                    ? ["rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0.1)"]
                    : ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]
                }
                style={styles.filterButtonGradient}
              >
                <Text style={styles.filterButtonText}>
                  🔍 Filters{" "}
                  {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                </Text>
              </LinearGradient>
            </BlurView>
          </Pressable>
        </Animated.View>

        {/* Country Chips */}
        {COUNTRIES.slice(0, 5).map((country, index) => (
          <FilterChip
            key={country}
            label={country}
            isActive={
              (country === "All" && !filters.country) ||
              filters.country === country
            }
            onPress={() => handleCountrySelect(country)}
            delay={50 * (index + 1)}
          />
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType={Platform.OS === "web" ? "fade" : "none"}
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowFilters(false)}
          />
          <Animated.View
            entering={modalEntering}
            style={styles.modalContent}
          >
            <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
              <LinearGradient
                colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.02)"]}
                style={styles.modalGradient}
              >
                {/* Handle */}
                <View style={styles.modalHandle} />

                {/* Header */}
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Filters</Text>
                  <Pressable
                    onPress={() => setShowFilters(false)}
                    style={styles.closeButton}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </Pressable>
                </View>

                {/* Country Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Country</Text>
                  <View style={styles.chipGrid}>
                    {COUNTRIES.map((country) => (
                      <FilterChip
                        key={country}
                        label={country}
                        isActive={
                          (country === "All" && !filters.country) ||
                          filters.country === country
                        }
                        onPress={() => handleCountrySelect(country)}
                      />
                    ))}
                  </View>
                </View>

                {/* Distance Filter */}
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Minimum Distance (km)</Text>
                  <View style={styles.inputContainer}>
                    <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                      <TextInput
                        style={styles.input}
                        value={String(filters.minDistance || "")}
                        onChangeText={(v) =>
                          onFiltersChange({
                            ...filters,
                            minDistance: parseInt(v) || 0,
                          })
                        }
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#64748b"
                      />
                    </BlurView>
                  </View>
                </View>

                {/* Actions */}
                <View style={styles.modalActions}>
                  <Pressable
                    style={styles.clearButton}
                    onPress={() =>
                      onFiltersChange({
                        dateRange: null,
                        country: null,
                        minDistance: 0,
                      })
                    }
                  >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                  </Pressable>
                  <Pressable
                    style={styles.applyButton}
                    onPress={() => setShowFilters(false)}
                  >
                    <LinearGradient
                      colors={["#3b82f6", "#2563eb"]}
                      style={styles.applyButtonGradient}
                    >
                      <Text style={styles.applyButtonText}>Apply</Text>
                    </LinearGradient>
                  </Pressable>
                </View>
              </LinearGradient>
            </BlurView>
            <View style={styles.modalBorder} />
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterButton: {
    borderRadius: 20,
    overflow: "hidden",
  },
  filterButtonBlur: {
    borderRadius: 20,
  },
  filterButtonGradient: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  filterButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
  },
  chipInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  chipText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "500",
  },
  chipTextActive: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  modalBlur: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalGradient: {
    padding: 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  inputContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  inputBlur: {
    borderRadius: 16,
  },
  input: {
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  clearButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  applyButton: {
    flex: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  applyButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  modalBorder: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});