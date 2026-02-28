import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdventures } from "../hooks/useAdventures";
import GradientBackground from "../components/ui/GradientBackground";
import AdventureCardModern from "../components/AdventureCardModern";
import FilterControlsModern from "../components/FilterControlsModern";
import { AdventureFilters } from "../types";
import styles from "./AdventuresPage.module.css";

export function AdventuresPage() {
  const navigate = useNavigate();

  const isSmallScreen = window.innerWidth < 380;

  const [filters, setFilters] = useState<AdventureFilters>({
    dateRange: null,
    country: null,
    minDistance: 0,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { adventures, loading, error, refresh } = useAdventures(filters);

  return (
    <GradientBackground>
      <div className={styles.container}>
        {/* Header */}
        <div
          className={`${styles.header}${isSmallScreen ? ` ${styles.headerCompact}` : ""}`}
        >
          <div className={styles.headerLeft}>
            <h1 className={`${styles.title}${isSmallScreen ? ` ${styles.titleCompact}` : ""}`}>
              Adventures
            </h1>
            <p className={`${styles.subtitle}${isSmallScreen ? ` ${styles.subtitleCompact}` : ""}`}>
              {adventures.length} {adventures.length === 1 ? "trip" : "trips"}
            </p>
          </div>
          <div className={styles.headerRight}>
            <button
              className={`${styles.viewModeButton}${viewMode === "grid" ? ` ${styles.viewModeButtonActive}` : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <span className={styles.viewModeIcon}>{"\u229E"}</span>
            </button>
            <button
              className={`${styles.viewModeButton}${viewMode === "list" ? ` ${styles.viewModeButtonActive}` : ""}`}
              onClick={() => setViewMode("list")}
            >
              <span className={styles.viewModeIcon}>{"\u2630"}</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <FilterControlsModern
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Main Content */}
        {loading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Loading adventures...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <span className={styles.errorEmoji}>{"😕"}</span>
            <p className={styles.errorText}>{error}</p>
            <button className={styles.retryButton} onClick={refresh}>
              <span className={styles.retryButtonText}>Try Again</span>
            </button>
          </div>
        ) : adventures.length === 0 ? (
          <div className={styles.emptyContainer}>
            <span className={styles.emptyEmoji}>{"🌍"}</span>
            <p className={styles.emptyTitle}>No adventures found</p>
            <p className={styles.emptyText}>Try adjusting your filters</p>
          </div>
        ) : (
          <div
            className={`${styles.scrollContainer} ${isSmallScreen ? styles.scrollContentCompact : styles.scrollContent}`}
          >
            {viewMode === "grid" ? (
              <div className={styles.gridContainer}>
                {adventures.map((adventure, index) => (
                  <AdventureCardModern
                    key={adventure.id}
                    adventure={adventure}
                    onPress={() => navigate(`/adventure/${adventure.id}`)}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.listContainer}>
                {adventures.map((adventure, index) => (
                  <div
                    key={adventure.id}
                    className={styles.listItemAnimated}
                    style={{ "--item-delay": `${index * 50}ms` } as React.CSSProperties}
                  >
                    <button
                      className={styles.listItem}
                      onClick={() => navigate(`/adventure/${adventure.id}`)}
                    >
                      <div className={styles.listItemBlur}>
                        <div className={styles.listItemGradient}>
                          <div className={styles.listItemContent}>
                            <div className={styles.listItemLeft}>
                              <p
                                className={`${styles.listItemTitle}${isSmallScreen ? ` ${styles.listItemTitleCompact}` : ""}`}
                              >
                                {adventure.title}
                              </p>
                              <p className={styles.listItemLocation}>
                                {"📍"} {adventure.location}
                              </p>
                              <p className={styles.listItemDates}>
                                {adventure.startDate} - {adventure.endDate}
                              </p>
                            </div>
                            <div className={styles.listItemRight}>
                              <div className={styles.listItemStats}>
                                <span className={styles.listItemStat}>
                                  {adventure.mediaCount} {"📸"}
                                </span>
                                <span className={styles.listItemStat}>
                                  {adventure.duration}d
                                </span>
                              </div>
                              {adventure.isFavorite && (
                                <span className={styles.favoriteIcon}>{"❤️"}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.bottomSpacer} />
          </div>
        )}
      </div>
    </GradientBackground>
  );
}

export default AdventuresPage;
