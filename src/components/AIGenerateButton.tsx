import { useState, type CSSProperties } from "react";
import { useAI } from "../hooks/useAI";
import styles from "./AIGenerateButton.module.css";

interface AIGenerateButtonProps {
  adventureId: string;
  type: "summary" | "highlights" | "story" | "all";
  onGenerated?: (result: any) => void;
  style?: CSSProperties;
  compact?: boolean;
}

export default function AIGenerateButton({
  adventureId,
  type,
  onGenerated,
  style,
  compact = false,
}: AIGenerateButtonProps) {
  const { config, isGenerating, generateSummary, generateHighlights, generateStory, regenerateAll } = useAI();
  const [showStylePicker, setShowStylePicker] = useState(false);

  const handleGenerate = async (storyStyle?: string) => {
    if (!config.isConfigured) {
      window.alert(
        "AI Not Configured. Please set your AI API key in the server environment variables."
      );
      return;
    }

    try {
      let result;
      switch (type) {
        case "summary":
          result = await generateSummary(adventureId);
          break;
        case "highlights":
          result = await generateHighlights(adventureId);
          break;
        case "story":
          result = await generateStory(adventureId, storyStyle);
          setShowStylePicker(false);
          break;
        case "all":
          result = await regenerateAll(adventureId);
          break;
      }

      if (onGenerated) {
        onGenerated(result);
      }

      window.alert("AI content has been generated successfully.");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Failed to generate content");
    }
  };

  const getButtonText = () => {
    if (isGenerating) return "Generating...";
    switch (type) {
      case "summary": return compact ? "✨" : "✨ Generate Summary";
      case "highlights": return compact ? "✨" : "✨ Generate Highlights";
      case "story": return compact ? "✨" : "✨ Generate Story";
      case "all": return compact ? "✨" : "✨ Regenerate All";
    }
  };

  const storyStyles = [
    { id: "narrative", label: "Personal Narrative", icon: "📝" },
    { id: "blog", label: "Travel Blog", icon: "📰" },
    { id: "poetic", label: "Poetic & Literary", icon: "🎭" },
    { id: "factual", label: "Factual Report", icon: "📋" },
  ];

  if (type === "story") {
    return (
      <>
        <button
          className={`${styles.button} ${compact ? styles.buttonCompact : ""}`}
          onClick={() => setShowStylePicker(true)}
          disabled={isGenerating}
          style={style}
        >
          {isGenerating ? (
            <div className={styles.spinner} />
          ) : (
            <span className={compact ? styles.buttonTextCompact : ""}>
              {getButtonText()}
            </span>
          )}
        </button>

        {showStylePicker && (
          <div className={styles.modalOverlay} onClick={() => setShowStylePicker(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>Choose Story Style</h3>
                <button className={styles.closeButton} onClick={() => setShowStylePicker(false)}>
                  ✕
                </button>
              </div>

              <div className={styles.styleList}>
                {storyStyles.map((storyStyle) => (
                  <button
                    key={storyStyle.id}
                    className={styles.styleOption}
                    onClick={() => handleGenerate(storyStyle.id)}
                    disabled={isGenerating}
                  >
                    <span className={styles.styleIcon}>{storyStyle.icon}</span>
                    <span className={styles.styleLabel}>{storyStyle.label}</span>
                    {isGenerating && <div className={styles.spinnerSmall} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      className={`${styles.button} ${compact ? styles.buttonCompact : ""}`}
      onClick={() => handleGenerate()}
      disabled={isGenerating}
      style={style}
    >
      {isGenerating ? (
        <div className={styles.spinner} />
      ) : (
        <span className={compact ? styles.buttonTextCompact : ""}>
          {getButtonText()}
        </span>
      )}
    </button>
  );
}
