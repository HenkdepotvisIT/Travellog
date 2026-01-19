import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { useAI } from "../hooks/useAI";

interface AIGenerateButtonProps {
  adventureId: string;
  type: "summary" | "highlights" | "story" | "all";
  onGenerated?: (result: any) => void;
  style?: any;
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
      Alert.alert(
        "AI Not Configured",
        "Please set your OpenAI API key in the server environment variables (OPENAI_API_KEY).",
        [{ text: "OK" }]
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
      
      Alert.alert("✨ Generated!", `AI content has been generated successfully.`);
    } catch (error) {
      Alert.alert("Generation Failed", error instanceof Error ? error.message : "Failed to generate content");
    }
  };

  const getButtonText = () => {
    if (isGenerating) return "Generating...";
    switch (type) {
      case "summary":
        return compact ? "✨" : "✨ Generate Summary";
      case "highlights":
        return compact ? "✨" : "✨ Generate Highlights";
      case "story":
        return compact ? "✨" : "✨ Generate Story";
      case "all":
        return compact ? "✨" : "✨ Regenerate All";
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
        <Pressable
          style={[styles.button, compact && styles.buttonCompact, style]}
          onPress={() => setShowStylePicker(true)}
          disabled={isGenerating}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
              {getButtonText()}
            </Text>
          )}
        </Pressable>

        <Modal
          visible={showStylePicker}
          animationType="slide"
          transparent
          onRequestClose={() => setShowStylePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Choose Story Style</Text>
                <Pressable onPress={() => setShowStylePicker(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.styleList}>
                {storyStyles.map((storyStyle) => (
                  <Pressable
                    key={storyStyle.id}
                    style={styles.styleOption}
                    onPress={() => handleGenerate(storyStyle.id)}
                    disabled={isGenerating}
                  >
                    <Text style={styles.styleIcon}>{storyStyle.icon}</Text>
                    <Text style={styles.styleLabel}>{storyStyle.label}</Text>
                    {isGenerating && <ActivityIndicator size="small" color="#3b82f6" />}
                  </Pressable>
                ))}
              </View>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  return (
    <Pressable
      style={[styles.button, compact && styles.buttonCompact, style]}
      onPress={() => handleGenerate()}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <ActivityIndicator size="small" color="#ffffff" />
      ) : (
        <Text style={[styles.buttonText, compact && styles.buttonTextCompact]}>
          {getButtonText()}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#8b5cf6",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonCompact: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  buttonTextCompact: {
    fontSize: 16,
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    color: "#94a3b8",
    fontSize: 20,
    padding: 4,
  },
  styleList: {
    gap: 12,
  },
  styleOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  styleIcon: {
    fontSize: 24,
  },
  styleLabel: {
    flex: 1,
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});