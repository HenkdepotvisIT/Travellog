import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  ScrollView,
} from "react-native";
import { AdventureFilters } from "../types";

interface FilterControlsProps {
  filters: AdventureFilters;
  onFiltersChange: (filters: AdventureFilters) => void;
}

const COUNTRIES = [
  "All Countries",
  "Japan",
  "Italy",
  "Norway",
  "France",
  "Spain",
  "USA",
  "Thailand",
  "Australia",
];

export default function FilterControls({
  filters,
  onFiltersChange,
}: FilterControlsProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [
    filters.dateRange,
    filters.country,
    filters.minDistance > 0,
  ].filter(Boolean).length;

  const handleCountrySelect = (country: string) => {
    onFiltersChange({
      ...filters,
      country: country === "All Countries" ? null : country,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      dateRange: null,
      country: null,
      minDistance: 0,
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Filter Button */}
        <Pressable
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>
            🔍 Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Text>
        </Pressable>

        {/* Quick Country Filters */}
        {COUNTRIES.slice(0, 5).map((country) => (
          <Pressable
            key={country}
            style={[
              styles.chip,
              (country === "All Countries" && !filters.country) ||
              filters.country === country
                ? styles.chipActive
                : null,
            ]}
            onPress={() => handleCountrySelect(country)}
          >
            <Text
              style={[
                styles.chipText,
                (country === "All Countries" && !filters.country) ||
                filters.country === country
                  ? styles.chipTextActive
                  : null,
              ]}
            >
              {country}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <Pressable onPress={() => setShowFilters(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </Pressable>
            </View>

            {/* Country Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Country</Text>
              <View style={styles.chipGrid}>
                {COUNTRIES.map((country) => (
                  <Pressable
                    key={country}
                    style={[
                      styles.modalChip,
                      (country === "All Countries" && !filters.country) ||
                      filters.country === country
                        ? styles.modalChipActive
                        : null,
                    ]}
                    onPress={() => handleCountrySelect(country)}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        (country === "All Countries" && !filters.country) ||
                        filters.country === country
                          ? styles.modalChipTextActive
                          : null,
                      ]}
                    >
                      {country}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Distance Filter */}
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Minimum Distance (km)</Text>
              <TextInput
                style={styles.input}
                value={String(filters.minDistance || "")}
                onChangeText={(v) =>
                  onFiltersChange({ ...filters, minDistance: parseInt(v) || 0 })
                }
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor="#64748b"
              />
            </View>

            {/* Actions */}
            <View style={styles.modalActions}>
              <Pressable style={styles.clearButton} onPress={handleClearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </Pressable>
              <Pressable
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
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
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
  },
  filterButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "500",
  },
  chip: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: "#3b82f6",
  },
  chipText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#ffffff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#1e293b",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    color: "#94a3b8",
    fontSize: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 12,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  modalChip: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalChipActive: {
    backgroundColor: "#3b82f6",
  },
  modalChipText: {
    color: "#94a3b8",
    fontSize: 13,
  },
  modalChipTextActive: {
    color: "#ffffff",
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 14,
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
    backgroundColor: "#334155",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  clearButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  applyButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});