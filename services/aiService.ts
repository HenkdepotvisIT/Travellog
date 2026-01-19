import { Platform } from "react-native";

const getApiBaseUrl = (): string => {
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.location) {
      return window.location.origin;
    }
  }
  return process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
};

const API_BASE = getApiBaseUrl();

interface AIConfig {
  provider: string;
  model: string;
  autoGenerate: boolean;
  isConfigured: boolean;
}

interface GenerateResult {
  summary?: string;
  highlights?: string[];
  story?: string;
  tokensUsed: number;
}

class AIService {
  async getConfig(): Promise<AIConfig> {
    try {
      const response = await fetch(`${API_BASE}/api/ai/config`);
      if (!response.ok) throw new Error("Failed to get AI config");
      return response.json();
    } catch (error) {
      console.error("Failed to get AI config:", error);
      return {
        provider: "openai",
        model: "gpt-4o-mini",
        autoGenerate: false,
        isConfigured: false,
      };
    }
  }

  async updateConfig(config: Partial<AIConfig>): Promise<void> {
    const response = await fetch(`${API_BASE}/api/ai/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error("Failed to update AI config");
  }

  async generateSummary(adventureId: string): Promise<GenerateResult> {
    const response = await fetch(`${API_BASE}/api/ai/generate-summary/${adventureId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate summary");
    }
    
    return response.json();
  }

  async generateHighlights(adventureId: string): Promise<GenerateResult> {
    const response = await fetch(`${API_BASE}/api/ai/generate-highlights/${adventureId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate highlights");
    }
    
    return response.json();
  }

  async generateStory(adventureId: string, style: string = "narrative"): Promise<GenerateResult> {
    const response = await fetch(`${API_BASE}/api/ai/generate-story/${adventureId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to generate story");
    }
    
    return response.json();
  }

  async regenerateAll(adventureId: string): Promise<GenerateResult> {
    const response = await fetch(`${API_BASE}/api/ai/regenerate-all/${adventureId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to regenerate");
    }
    
    return response.json();
  }
}

export const aiService = new AIService();