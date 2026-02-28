import { useState } from "react";
import { AdventureFilters } from "../types";
import styles from "./FilterControlsModern.module.css";

interface FilterControlsModernProps {
  filters: AdventureFilters;
  onFiltersChange: (filters: AdventureFilters) => void;
}

const COUNTRIES = ["All", "Japan", "Italy", "Norway", "France", "Spain", "USA", "Thailand", "Australia"];

export default function FilterControlsModern({ filters, onFiltersChange }: FilterControlsModernProps) {
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = [filters.dateRange, filters.country, filters.minDistance > 0].filter(Boolean).length;

  const handleCountrySelect = (country: string) => {
    onFiltersChange({ ...filters, country: country === "All" ? null : country });
  };

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        <button className={styles.filterButton} onClick={() => setShowFilters(true)}>
          🔍 Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>

        {COUNTRIES.slice(0, 5).map((country) => (
          <button
            key={country}
            className={`${styles.chip} ${
              (country === "All" && !filters.country) || filters.country === country
                ? styles.chipActive : styles.chipInactive
            }`}
            onClick={() => handleCountrySelect(country)}
          >
            {country}
          </button>
        ))}
      </div>

      {showFilters && (
        <div className={styles.modalOverlay} onClick={() => setShowFilters(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.handle} />

            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Filters</h3>
              <button className={styles.closeButton} onClick={() => setShowFilters(false)}>✕</button>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Country</label>
              <div className={styles.chipGrid}>
                {COUNTRIES.map((country) => (
                  <button
                    key={country}
                    className={`${styles.chip} ${
                      (country === "All" && !filters.country) || filters.country === country
                        ? styles.chipActive : styles.chipInactive
                    }`}
                    onClick={() => handleCountrySelect(country)}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterSection}>
              <label className={styles.filterLabel}>Minimum Distance (km)</label>
              <input
                className={styles.input}
                value={String(filters.minDistance || "")}
                onChange={(e) => onFiltersChange({ ...filters, minDistance: parseInt(e.target.value) || 0 })}
                type="number"
                placeholder="0"
              />
            </div>

            <div className={styles.modalActions}>
              <button className={styles.clearButton} onClick={() => onFiltersChange({ dateRange: null, country: null, minDistance: 0 })}>
                Clear All
              </button>
              <button className={styles.applyButton} onClick={() => setShowFilters(false)}>Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
