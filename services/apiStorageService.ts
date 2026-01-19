import { Adventure, MediaItem, AppSettings } from "../types";
import { Platform } from "react-native";

// Determine the API base URL
const getApiBaseUrl = (): string => {
  if (Platform.OS === "web") {
    // In production, use relative URLs (same origin)
    // In development, you might need to set this to your server URL
    if (typeof window !== "undefined" && window.location) {
      return window.location.origin;
    }
  }
  // For native apps or fallback, use environment variable or default
  return process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
};

const API_BASE = getApiBaseUrl();

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

class ApiStorageService {
  // ============ Adventures ============

  async saveAdventures(adventures: Adventure[]): Promise<void> {
    await fetchApi("/adventures", {
      method: "POST",
      body: JSON.stringify(adventures),
    });
    await this.setLastSyncTime(new Date());
  }

  async getAdventures(): Promise<Adventure[]> {
    try {
      return await fetchApi<Adventure[]>("/adventures");
    } catch (error) {
      console.error("Failed to get adventures:", error);
      return [];
    }
  }

  async saveAdventure(adventure: Adventure): Promise<void> {
    await fetchApi(`/adventures/${adventure.id}`, {
      method: "PUT",
      body: JSON.stringify(adventure),
    });
  }

  async deleteAdventure(adventureId: string): Promise<void> {
    await fetchApi(`/adventures/${adventureId}`, {
      method: "DELETE",
    });
  }

  // ============ Narratives ============

  async saveNarrative(adventureId: string, narrative: string): Promise<void> {
    await fetchApi(`/narratives/${adventureId}`, {
      method: "POST",
      body: JSON.stringify({ narrative }),
    });
  }

  async getNarrative(adventureId: string): Promise<string | null> {
    try {
      const narratives = await this.getAllNarratives();
      return narratives[adventureId] || null;
    } catch (error) {
      console.error("Failed to get narrative:", error);
      return null;
    }
  }

  async getAllNarratives(): Promise<Record<string, string>> {
    try {
      return await fetchApi<Record<string, string>>("/narratives");
    } catch (error) {
      console.error("Failed to get narratives:", error);
      return {};
    }
  }

  // ============ Custom Adventure Data ============

  async saveCustomData(adventureId: string, data: Partial<Adventure>): Promise<void> {
    // Custom data is saved as part of the adventure
    const adventures = await this.getAdventures();
    const adventure = adventures.find((a) => a.id === adventureId);
    if (adventure) {
      await this.saveAdventure({ ...adventure, ...data });
    }
  }

  async getCustomData(adventureId: string): Promise<Partial<Adventure> | null> {
    const adventures = await this.getAdventures();
    return adventures.find((a) => a.id === adventureId) || null;
  }

  async getAllCustomData(): Promise<Record<string, Partial<Adventure>>> {
    const adventures = await this.getAdventures();
    const customData: Record<string, Partial<Adventure>> = {};
    adventures.forEach((a) => {
      customData[a.id] = a;
    });
    return customData;
  }

  // ============ Media Cache ============

  async cacheMedia(media: MediaItem[]): Promise<void> {
    // For Docker deployment, we might want to skip caching or use a different approach
    console.log("Media caching skipped in API mode");
  }

  async getCachedMedia(): Promise<MediaItem[]> {
    return [];
  }

  async clearMediaCache(): Promise<void> {
    console.log("Media cache cleared");
  }

  // ============ Sync Time ============

  async setLastSyncTime(date: Date): Promise<void> {
    await fetchApi("/sync-status", {
      method: "POST",
      body: JSON.stringify({ lastSyncTime: date.toISOString() }),
    });
  }

  async getLastSyncTime(): Promise<Date | null> {
    try {
      const status = await fetchApi<{ lastSyncTime: string | null }>("/sync-status");
      return status.lastSyncTime ? new Date(status.lastSyncTime) : null;
    } catch (error) {
      console.error("Failed to get last sync time:", error);
      return null;
    }
  }

  // ============ Settings ============

  async saveSettings(settings: AppSettings): Promise<void> {
    await fetchApi("/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  }

  async getSettings(): Promise<AppSettings | null> {
    try {
      const settings = await fetchApi<AppSettings>("/settings");
      return Object.keys(settings).length > 0 ? settings : null;
    } catch (error) {
      console.error("Failed to get settings:", error);
      return null;
    }
  }

  // ============ Favorites ============

  async addFavorite(adventureId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(adventureId)) {
      favorites.push(adventureId);
      await fetchApi("/favorites", {
        method: "POST",
        body: JSON.stringify(favorites),
      });
    }
  }

  async removeFavorite(adventureId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const filtered = favorites.filter((id) => id !== adventureId);
    await fetchApi("/favorites", {
      method: "POST",
      body: JSON.stringify(filtered),
    });
  }

  async getFavorites(): Promise<string[]> {
    try {
      return await fetchApi<string[]>("/favorites");
    } catch (error) {
      console.error("Failed to get favorites:", error);
      return [];
    }
  }

  async isFavorite(adventureId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(adventureId);
  }

  // ============ Hidden Adventures ============

  async hideAdventure(adventureId: string): Promise<void> {
    const hidden = await this.getHiddenAdventures();
    if (!hidden.includes(adventureId)) {
      hidden.push(adventureId);
      await fetchApi("/hidden", {
        method: "POST",
        body: JSON.stringify(hidden),
      });
    }
  }

  async unhideAdventure(adventureId: string): Promise<void> {
    const hidden = await this.getHiddenAdventures();
    const filtered = hidden.filter((id) => id !== adventureId);
    await fetchApi("/hidden", {
      method: "POST",
      body: JSON.stringify(filtered),
    });
  }

  async getHiddenAdventures(): Promise<string[]> {
    try {
      return await fetchApi<string[]>("/hidden");
    } catch (error) {
      console.error("Failed to get hidden adventures:", error);
      return [];
    }
  }

  // ============ Connection ============

  async saveConnection(serverUrl: string, apiKey: string): Promise<void> {
    await fetchApi("/connection", {
      method: "POST",
      body: JSON.stringify({ serverUrl, apiKey, isConnected: true }),
    });
  }

  async getConnection(): Promise<{ serverUrl: string | null; apiKey: string | null; isConnected: boolean }> {
    try {
      const connection = await fetchApi<{ serverUrl: string | null; apiKey: string | null; isConnected: boolean }>("/connection");
      return {
        serverUrl: connection.serverUrl || null,
        apiKey: connection.apiKey || null,
        isConnected: connection.isConnected || false,
      };
    } catch (error) {
      console.error("Failed to get connection:", error);
      return { serverUrl: null, apiKey: null, isConnected: false };
    }
  }

  async clearConnection(): Promise<void> {
    await fetchApi("/connection", {
      method: "POST",
      body: JSON.stringify({ serverUrl: null, apiKey: null, isConnected: false }),
    });
  }

  // ============ Clear All Data ============

  async clearAllData(): Promise<void> {
    await fetchApi("/data", {
      method: "DELETE",
    });
  }

  // ============ Export/Import ============

  async exportAllData(): Promise<string> {
    const data = await fetchApi<Record<string, any>>("/export");
    return JSON.stringify(data, null, 2);
  }

  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    await fetchApi("/import", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }
}

export const apiStorageService = new ApiStorageService();