import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAdventure } from "../hooks/useAdventure";
import { useAI } from "../hooks/useAI";
import PhotoGrid from "../components/PhotoGrid";
import AdventureMap from "../components/AdventureMap";
import StatsCard from "../components/StatsCard";
import AIGenerateButton from "../components/AIGenerateButton";
import styles from "./AdventureDetailPage.module.css";

export function AdventureDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { adventure, loading, error, updateNarrative, refresh } = useAdventure(id);
  const { config: aiConfig, isGenerating } = useAI();
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
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading adventure...</p>
      </div>
    );
  }

  if (error || !adventure) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{"❌"} {error || "Adventure not found"}</p>
        <button className={styles.backButton} onClick={() => navigate(-1)}>
          <span className={styles.backButtonText}>Go Back</span>
        </button>
      </div>
    );
  }

  const handleSaveNarrative = () => {
    updateNarrative(narrativeText);
    setIsEditingNarrative(false);
  };

  const handleAIGenerated = () => {
    refresh();
  };

  return (
    <div className={styles.container}>
      {/* Header with Cover Image */}
      <div className={styles.coverContainer}>
        <img
          src={adventure.coverPhoto}
          className={styles.coverImage}
          alt={adventure.title}
        />
        <div className={styles.coverOverlay} />
        <button className={styles.backButtonHeader} onClick={() => navigate(-1)}>
          <span className={styles.backButtonIcon}>{"←"}</span>
        </button>
        <div className={styles.coverContent}>
          <h1 className={styles.adventureTitle}>{adventure.title}</h1>
          <p className={styles.adventureDates}>
            {adventure.startDate} - {adventure.endDate}
          </p>
          <div className={styles.locationBadge}>
            <span className={styles.locationText}>{"📍"} {adventure.location}</span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsRow}>
        <StatsCard icon="📸" value={adventure.mediaCount} label="Photos" />
        <StatsCard icon="📏" value={`${adventure.distance}km`} label="Distance" />
        <StatsCard icon="⏱️" value={`${adventure.duration}d`} label="Duration" />
        <StatsCard icon="📍" value={adventure.stops} label="Stops" />
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === "photos" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("photos")}
        >
          <span className={`${styles.tabText} ${activeTab === "photos" ? styles.tabTextActive : ""}`}>
            Photos
          </span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === "map" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("map")}
        >
          <span className={`${styles.tabText} ${activeTab === "map" ? styles.tabTextActive : ""}`}>
            Map
          </span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === "story" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("story")}
        >
          <span className={`${styles.tabText} ${activeTab === "story" ? styles.tabTextActive : ""}`}>
            Story
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
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
          <div className={styles.storyContainer}>
            {/* AI Summary Section */}
            <div className={styles.aiSection}>
              <div className={styles.aiSectionHeader}>
                <div className={styles.aiSectionTitleRow}>
                  <span className={styles.aiSectionIcon}>{"✨"}</span>
                  <span className={styles.aiSectionTitle}>AI Summary</span>
                </div>
                <AIGenerateButton
                  adventureId={adventure.id}
                  type="summary"
                  onGenerated={handleAIGenerated}
                  compact
                />
              </div>
              <div className={styles.aiSummaryContainer}>
                {adventure.aiSummary ? (
                  <p className={styles.aiSummaryText}>{adventure.aiSummary}</p>
                ) : (
                  <div className={styles.emptyAIState}>
                    <p className={styles.emptyAIText}>No AI summary yet</p>
                    <p className={styles.emptyAISubtext}>
                      Tap the {"✨"} button to generate one
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* AI Highlights Section */}
            <div className={styles.aiSection}>
              <div className={styles.aiSectionHeader}>
                <div className={styles.aiSectionTitleRow}>
                  <span className={styles.aiSectionIcon}>{"🌟"}</span>
                  <span className={styles.aiSectionTitle}>Highlights</span>
                </div>
                <AIGenerateButton
                  adventureId={adventure.id}
                  type="highlights"
                  onGenerated={handleAIGenerated}
                  compact
                />
              </div>
              <div className={styles.highlightsContainer}>
                {adventure.highlights && adventure.highlights.length > 0 ? (
                  adventure.highlights.map((highlight: string, index: number) => (
                    <div key={index} className={styles.highlightItem}>
                      <span className={styles.highlightBullet}>{"•"}</span>
                      <span className={styles.highlightText}>{highlight}</span>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyAIState}>
                    <p className={styles.emptyAIText}>No highlights yet</p>
                    <p className={styles.emptyAISubtext}>
                      Tap the {"✨"} button to generate highlights
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* User Narrative Section */}
            <div className={styles.narrativeSection}>
              <div className={styles.storyHeader}>
                <div className={styles.aiSectionTitleRow}>
                  <span className={styles.aiSectionIcon}>{"📝"}</span>
                  <span className={styles.storyTitle}>Your Story</span>
                </div>
                <div className={styles.storyActions}>
                  <AIGenerateButton
                    adventureId={adventure.id}
                    type="story"
                    onGenerated={(result: { story?: string }) => {
                      if (result.story) {
                        setNarrativeText(result.story);
                        setIsEditingNarrative(true);
                      }
                    }}
                    compact
                  />
                  <button
                    className={styles.editButton}
                    onClick={() => setIsEditingNarrative(!isEditingNarrative)}
                  >
                    <span className={styles.editButtonText}>
                      {isEditingNarrative ? "Cancel" : "✏️"}
                    </span>
                  </button>
                </div>
              </div>

              {isEditingNarrative ? (
                <div>
                  <textarea
                    className={styles.narrativeInput}
                    value={narrativeText}
                    onChange={(e) => setNarrativeText(e.target.value)}
                    placeholder="Write your adventure story..."
                  />
                  <button className={styles.saveButton} onClick={handleSaveNarrative}>
                    <span className={styles.saveButtonText}>Save Story</span>
                  </button>
                </div>
              ) : (
                <p className={styles.narrativeText}>
                  {adventure.narrative || "No story written yet. Tap edit to add your adventure narrative, or use AI to generate one."}
                </p>
              )}
            </div>

            {/* Regenerate All Button */}
            <div className={styles.regenerateAllContainer}>
              <AIGenerateButton
                adventureId={adventure.id}
                type="all"
                onGenerated={handleAIGenerated}
                className={styles.regenerateAllButton}
              />
              <p className={styles.regenerateAllHint}>
                Regenerate both summary and highlights at once
              </p>
            </div>

            {/* AI Status */}
            {!aiConfig.isConfigured && (
              <div className={styles.aiWarning}>
                <span className={styles.aiWarningIcon}>{"⚠️"}</span>
                <div className={styles.aiWarningContent}>
                  <p className={styles.aiWarningTitle}>AI Not Configured</p>
                  <p className={styles.aiWarningText}>
                    Set OPENAI_API_KEY in your server environment to enable AI features.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className={styles.bottomSpacer} />
      </div>

      {/* Export Button */}
      <div className={styles.exportContainer}>
        <button className={styles.exportButton}>
          <span className={styles.exportButtonText}>{"📤"} Export Adventure</span>
        </button>
      </div>
    </div>
  );
}
