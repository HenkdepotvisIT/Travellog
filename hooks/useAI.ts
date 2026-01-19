import { useState, useEffect, useCallback } from "react";
import { aiService } from "../services/aiService";

interface AIConfig {
  provider: string;
  model: string;
  autoGenerate: boolean;
  isConfigured: boolean;
}

export function useAI() {
  const [config, setConfig] = useState<AIConfig>({
    provider: "openai",
    model: "gpt-4o-mini",
    autoGenerate: false,
    isConfigured: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const aiConfig = await aiService.getConfig();
      setConfig(aiConfig);
    } catch (err) {
      console.error("Failed to load AI config:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateConfig = useCallback(async (updates: Partial<AIConfig>) => {
    try {
      await aiService.updateConfig(updates);
      setConfig((prev) => ({ ...prev, ...updates }));
    } catch (err) {
      console.error("Failed to update AI config:", err);
      throw err;
    }
  }, []);

  const generateSummary = useCallback(async (adventureId: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await aiService.generateSummary(adventureId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate summary";
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateHighlights = useCallback(async (adventureId: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await aiService.generateHighlights(adventureId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate highlights";
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateStory = useCallback(async (adventureId: string, style?: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await aiService.generateStory(adventureId, style);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to generate story";
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const regenerateAll = useCallback(async (adventureId: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await aiService.regenerateAll(adventureId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to regenerate";
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    config,
    isLoading,
    isGenerating,
    error,
    updateConfig,
    generateSummary,
    generateHighlights,
    generateStory,
    regenerateAll,
  };
}