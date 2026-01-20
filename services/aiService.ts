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
  availableProviders?: {
    openai: boolean;
    gemini: boolean;
  };
}

interface GenerateResult {
  summary?: string;
  highlights?: string[];
  story?: string;
  tokensUsed: number;
}

class AIService {
  private apiAvailable: boolean | null = null;

  private async checkApiAvailability(): Promise<boolean> {
    if (this.apiAvailable !== null) {
      return this.apiAvailable;
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${API_BASE}/api/health`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      this.apiAvailable = response.ok;
      return this.apiAvailable;
    } catch (error) {
      console.log("AI API not available");
      this.apiAvailable = false;
      return false;
    }
  }

  async getConfig(): Promise<AIConfig> {
    const isAvailable = await this.checkApiAvailability();
    
    if (!isAvailable) {
      return {
        provider: "gemini",
        model: "gemini-1.5-flash",
        autoGenerate: false,
        isConfigured: false,
        availableProviders: {
          openai: false,
          gemini: false,
        },
      };
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/ai/config`);
      if (!response.ok) throw new Error("Failed to get AI config");
      return response.json();
    } catch (error) {
      console.error("Failed to get AI config:", error);
      return {
        provider: "gemini",
        model: "gemini-1.5-flash",
        autoGenerate: false,
        isConfigured: false,
        availableProviders: {
          openai: false,
          gemini: false,
        },
      };
    }
  }

  async updateConfig(config: Partial<AIConfig>): Promise<void> {
    const isAvailable = await this.checkApiAvailability();
    if (!isAvailable) return;
    
    const response = await fetch(`${API_BASE}/api/ai/config`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error("Failed to update AI config");
  }

  async generateSummary(adventureId: string): Promise<GenerateResult> {
    const isAvailable = await this.checkApiAvailability();
    if (!isAvailable) {
      throw new Error("AI service not available. Please ensure the server is running with GEMINI_API_KEY configured.");
    }
    
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
    const isAvailable = await this.checkApiAvailability();
    if (!isAvailable) {
      throw new Error("AI service not available. Please ensure the server is running with GEMINI_API_KEY configured.");
    }
    
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
    const isAvailable = await this.checkApiAvailability();
    if (!isAvailable) {
      throw new Error("AI service not available. Please ensure the server is running with GEMINI_API_KEY configured.");
    }
    
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
    const isAvailable = await this.checkApiAvailability();
    if (!isAvailable) {
      throw new Error("AI service not available. Please ensure the server is running with GEMINI_API_KEY configured.");
    }
    
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