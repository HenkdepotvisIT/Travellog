import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { useAI } from "../hooks/useAI";

const OPENAI_MODELS = [
  { id: "gpt-4o-mini", name: "GPT-4o Mini", description: "Fast & affordable" },
  { id: "gpt-4o", name: "GPT-4o", description: "Most capable" },
  { id: "gpt-4-turbo", name: "GPT-4 Turbo", description: "High performance" },
];

const VERTEX_MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", description: "Fast & efficient" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", description: "Most capable" },
  { id: "gemini-1.0-pro", name: "Gemini 1.0 Pro", description: "Balanced" },
];

export default function AISettingsCard() {
  const { config, isLoading, updateConfig, refreshConfig } = useAI();
  const [isSaving, setIsSaving] = useState(false);
  const [vertexProject, setVertexProject] = useState(config.vertexProject || "");
  const [vertexLocation, setVertexLocation] = useState(config.vertexLocation || "us-central1");

  const handleProviderChange = async (provider: string) => {
    setIsSaving(true);
    try {
      const defaultModel = provider === "vertex" ? "gemini-1.5-flash" : "gpt-4o-mini";
      await updateConfig({ provider, model: defaultModel });
    } finally {
      setIsSaving(false);
    }
  };

  const handleModelChange = async (model: string) => {
    setIsSaving(true);
    try {
      await updateConfig({ model });
    } finally {
      setIsSaving(false);
    }
  };

  const handleVertexConfigSave = async () => {
    setIsSaving(true);
    try {
      await updateConfig({ vertexProject, vertexLocation });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#3b82f6" />
      </View>
    );
  }

  const models = config.provider === "vertex" ? VERTEX_MODELS : OPENAI_MODELS;

  return (
    <Animated.View entering={FadeIn} style={styles.container}>
      {/* Provider Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI Provider</Text>
        <View style={styles.providerGrid}>
          <Pressable
            style={[
              styles.providerCard,
              config.provider === "openai" && styles.providerCardActive,
            ]}
            onPress={() => handleProviderChange("openai")}
          >
            <View style={styles.providerHeader}>
              <Text style={styles.providerIcon}>🤖</Text>
              <View
                style={[
                  styles.statusBadge,
                  config.availableProviders?.openai
                    ? styles.statusConfigured
                    : styles.statusNotConfigured,
                ]}
              >
                <Text style={styles.statusText}>
                  {config.availableProviders?.openai ? "Ready" : "Not Set"}
                </Text>
              </View>
            </View>
            <Text style={styles.providerName}>OpenAI</Text>
            <Text style={styles.providerDescription}>GPT-4o models</Text>
          </Pressable>

          <Pressable
            style={[
              styles.providerCard,
              config.provider === "vertex" && styles.providerCardActive,
            ]}
            onPress={() => handleProviderChange("vertex")}
          >
            <View style={styles.providerHeader}>
              <Text style={styles.providerIcon}>🔷</Text>
              <View
                style={[
                  styles.statusBadge,
                  config.availableProviders?.vertex
                    ? styles.statusConfigured
                    : styles.statusNotConfigured,
                ]}
              >
                <Text style={styles.statusText}>
                  {config.availableProviders?.vertex ? "Ready" : "Not Set"}
                </Text>
              </View>
            </View>
            <Text style={styles.providerName}>Google Vertex AI</Text>
            <Text style={styles.providerDescription}>Gemini models</Text>
          </Pressable>
        </View>
      </View>

      {/* Vertex AI Configuration */}
      {config.provider === "vertex" && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vertex AI Configuration</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Project ID</Text>
            <View style={styles.inputContainer}>
              <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                <TextInput
                  style={styles.input}
                  value={vertexProject}
                  onChangeText={setVertexProject}
                  placeholder="your-gcp-project-id"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </BlurView>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Location</Text>
            <View style={styles.inputContainer}>
              <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                <TextInput
                  style={styles.input}
                  value={vertexLocation}
                  onChangeText={setVertexLocation}
                  placeholder="us-central1"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </BlurView>
            </View>
          </View>

          <Pressable
            style={styles.saveButton}
            onPress={handleVertexConfigSave}
            disabled={isSaving}
          >
            <LinearGradient
              colors={["#3b82f6", "#2563eb"]}
              style={styles.saveButtonGradient}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.saveButtonText}>Save Configuration</Text>
              )}
            </LinearGradient>
          </Pressable>

          <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>📋 Setup Instructions</Text>
            <Text style={styles.infoText}>
              1. Set GOOGLE_CLOUD_PROJECT environment variable{"\n"}
              2. Set GOOGLE_APPLICATION_CREDENTIALS to your service account key file{"\n"}
              3. Ensure the service account has Vertex AI User role
            </Text>
          </View>
        </View>
      )}

      {/* Model Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Model</Text>
        <View style={styles.modelList}>
          {models.map((model) => (
            <Pressable
              key={model.id}
              style={[
                styles.modelCard,
                config.model === model.id && styles.modelCardActive,
              ]}
              onPress={() => handleModelChange(model.id)}
            >
              <View style={styles.modelInfo}>
                <Text style={styles.modelName}>{model.name}</Text>
                <Text style={styles.modelDescription}>{model.description}</Text>
              </View>
              {config.model === model.id && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
      </View>

      {/* Current Status */}
      <View style={styles.statusCard}>
        <BlurView intensity={40} tint="dark" style={styles.statusCardBlur}>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Current Provider:</Text>
            <Text style={styles.statusValue}>
              {config.provider === "vertex" ? "Google Vertex AI" : "OpenAI"}
            </Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Model:</Text>
            <Text style={styles.statusValue}>{config.model}</Text>
          </View>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status:</Text>
            <Text
              style={[
                styles.statusValue,
                config.isConfigured ? styles.statusGreen : styles.statusRed,
              ]}
            >
              {config.isConfigured ? "✅ Ready" : "❌ Not Configured"}
            </Text>
          </View>
        </BlurView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  providerGrid: {
    flexDirection: "row",
    gap: 12,
  },
  providerCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  providerCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  providerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  providerIcon: {
    fontSize: 28,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusConfigured: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  statusNotConfigured: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  providerName: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  providerDescription: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "500",
  },
  inputContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  inputBlur: {
    borderRadius: 12,
  },
  input: {
    padding: 14,
    color: "#ffffff",
    fontSize: 15,
  },
  saveButton: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 8,
  },
  saveButtonGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  infoBox: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    marginTop: 8,
  },
  infoTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 12,
    lineHeight: 20,
  },
  modelList: {
    gap: 8,
  },
  modelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "transparent",
  },
  modelCardActive: {
    borderColor: "#3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  modelDescription: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 2,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
  statusCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  statusCardBlur: {
    padding: 16,
    borderRadius: 16,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  statusLabel: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  statusValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  statusGreen: {
    color: "#22c55e",
  },
  statusRed: {
    color: "#ef4444",
  },
});