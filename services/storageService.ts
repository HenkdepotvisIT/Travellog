import AsyncStorage from "@react-native-async-storage/async-storage";
import { Adventure, MediaItem, AppSettings } from "../types";

const STORAGE_KEYS = {
  // Connection
  IMMICH_SERVER_URL: "immich_server_url",
  IMMICH_API_KEY: "immich_api_key",
  IMMICH_IS_CONNECTED: "immich_is_connected",
  
  // Adventures
  ADVENTURES: "adventures",
  ADVENTURE_NARRATIVES: "adventure_narratives",
  ADVENTURE_CUSTOM_DATA: "adventure_custom_data",
  
  // Media cache
  MEDIA_CACHE: "media_cache",
  LAST_SYNC_TIME: "last_sync_time",
  
  // Settings
  APP_SETTINGS: "app_settings",
  
  // User preferences
  FAVORITE_ADVENTURES: "favorite_adventures",
  HIDDEN_ADVENTURES: "hidden_adventures",
};

class StorageService {
  // ============ Adventures ============
  
  async saveAdventures(adventures: Adventure[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ADVENTURES, JSON.stringify(adventures));
      await this.setLastSyncTime(new Date());
    } catch (error) {
      console.error("Failed to save adventures:", error);
      throw error;
    }
  }

  async getAdventures(): Promise<Adventure[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVENTURES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get adventures:", error);
      return [];
    }
  }

  async saveAdventure(adventure: Adventure): Promise<void> {
    try {
      const adventures = await this.getAdventures();
      const index = adventures.findIndex((a) => a.id === adventure.id);
      
      if (index >= 0) {
        adventures[index] = adventure;
      } else {
        adventures.push(adventure);
      }
      
      await this.saveAdventures(adventures);
    } catch (error) {
      console.error("Failed to save adventure:", error);
      throw error;
    }
  }

  async deleteAdventure(adventureId: string): Promise<void> {
    try {
      const adventures = await this.getAdventures();
      const filtered = adventures.filter((a) => a.id !== adventureId);
      await this.saveAdventures(filtered);
    } catch (error) {
      console.error("Failed to delete adventure:", error);
      throw error;
    }
  }

  // ============ Narratives ============
  
  async saveNarrative(adventureId: string, narrative: string): Promise<void> {
    try {
      const narratives = await this.getAllNarratives();
      narratives[adventureId] = narrative;
      await AsyncStorage.setItem(STORAGE_KEYS.ADVENTURE_NARRATIVES, JSON.stringify(narratives));
    } catch (error) {
      console.error("Failed to save narrative:", error);
      throw error;
    }
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
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVENTURE_NARRATIVES);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Failed to get narratives:", error);
      return {};
    }
  }

  // ============ Custom Adventure Data ============
  
  async saveCustomData(adventureId: string, data: Partial<Adventure>): Promise<void> {
    try {
      const allCustomData = await this.getAllCustomData();
      allCustomData[adventureId] = { ...allCustomData[adventureId], ...data };
      await AsyncStorage.setItem(STORAGE_KEYS.ADVENTURE_CUSTOM_DATA, JSON.stringify(allCustomData));
    } catch (error) {
      console.error("Failed to save custom data:", error);
      throw error;
    }
  }

  async getCustomData(adventureId: string): Promise<Partial<Adventure> | null> {
    try {
      const allCustomData = await this.getAllCustomData();
      return allCustomData[adventureId] || null;
    } catch (error) {
      console.error("Failed to get custom data:", error);
      return null;
    }
  }

  async getAllCustomData(): Promise<Record<string, Partial<Adventure>>> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVENTURE_CUSTOM_DATA);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Failed to get custom data:", error);
      return {};
    }
  }

  // ============ Media Cache ============
  
  async cacheMedia(media: MediaItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.MEDIA_CACHE, JSON.stringify(media));
    } catch (error) {
      console.error("Failed to cache media:", error);
      throw error;
    }
  }

  async getCachedMedia(): Promise<MediaItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.MEDIA_CACHE);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get cached media:", error);
      return [];
    }
  }

  async clearMediaCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.MEDIA_CACHE);
    } catch (error) {
      console.error("Failed to clear media cache:", error);
      throw error;
    }
  }

  // ============ Sync Time ============
  
  async setLastSyncTime(date: Date): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, date.toISOString());
    } catch (error) {
      console.error("Failed to set last sync time:", error);
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
      return data ? new Date(data) : null;
    } catch (error) {
      console.error("Failed to get last sync time:", error);
      return null;
    }
  }

  // ============ Settings ============
  
  async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
      throw error;
    }
  }

  async getSettings(): Promise<AppSettings | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to get settings:", error);
      return null;
    }
  }

  // ============ Favorites ============
  
  async addFavorite(adventureId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(adventureId)) {
        favorites.push(adventureId);
        await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ADVENTURES, JSON.stringify(favorites));
      }
    } catch (error) {
      console.error("Failed to add favorite:", error);
      throw error;
    }
  }

  async removeFavorite(adventureId: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((id) => id !== adventureId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ADVENTURES, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to remove favorite:", error);
      throw error;
    }
  }

  async getFavorites(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_ADVENTURES);
      return data ? JSON.parse(data) : [];
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
    try {
      const hidden = await this.getHiddenAdventures();
      if (!hidden.includes(adventureId)) {
        hidden.push(adventureId);
        await AsyncStorage.setItem(STORAGE_KEYS.HIDDEN_ADVENTURES, JSON.stringify(hidden));
      }
    } catch (error) {
      console.error("Failed to hide adventure:", error);
      throw error;
    }
  }

  async unhideAdventure(adventureId: string): Promise<void> {
    try {
      const hidden = await this.getHiddenAdventures();
      const filtered = hidden.filter((id) => id !== adventureId);
      await AsyncStorage.setItem(STORAGE_KEYS.HIDDEN_ADVENTURES, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to unhide adventure:", error);
      throw error;
    }
  }

  async getHiddenAdventures(): Promise<string[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN_ADVENTURES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get hidden adventures:", error);
      return [];
    }
  }

  // ============ Connection ============
  
  async saveConnection(serverUrl: string, apiKey: string): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.IMMICH_SERVER_URL, serverUrl),
        AsyncStorage.setItem(STORAGE_KEYS.IMMICH_API_KEY, apiKey),
        AsyncStorage.setItem(STORAGE_KEYS.IMMICH_IS_CONNECTED, "true"),
      ]);
    } catch (error) {
      console.error("Failed to save connection:", error);
      throw error;
    }
  }

  async getConnection(): Promise<{ serverUrl: string | null; apiKey: string | null; isConnected: boolean }> {
    try {
      const [serverUrl, apiKey, isConnected] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.IMMICH_SERVER_URL),
        AsyncStorage.getItem(STORAGE_KEYS.IMMICH_API_KEY),
        AsyncStorage.getItem(STORAGE_KEYS.IMMICH_IS_CONNECTED),
      ]);
      return {
        serverUrl,
        apiKey,
        isConnected: isConnected === "true",
      };
    } catch (error) {
      console.error("Failed to get connection:", error);
      return { serverUrl: null, apiKey: null, isConnected: false };
    }
  }

  async clearConnection(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.IMMICH_SERVER_URL),
        AsyncStorage.removeItem(STORAGE_KEYS.IMMICH_API_KEY),
        AsyncStorage.setItem(STORAGE_KEYS.IMMICH_IS_CONNECTED, "false"),
      ]);
    } catch (error) {
      console.error("Failed to clear connection:", error);
      throw error;
    }
  }

  // ============ Clear All Data ============
  
  async clearAllData(): Promise<void> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error("Failed to clear all data:", error);
      throw error;
    }
  }

  // ============ Export/Import ============
  
  async exportAllData(): Promise<string> {
    try {
      const keys = Object.values(STORAGE_KEYS);
      const pairs = await AsyncStorage.multiGet(keys);
      const data: Record<string, any> = {};
      
      pairs.forEach(([key, value]) => {
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });
      
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  }

  async importData(jsonString: string): Promise<void> {
    try {
      const data = JSON.parse(jsonString);
      const pairs: [string, string][] = Object.entries(data).map(([key, value]) => [
        key,
        typeof value === "string" ? value : JSON.stringify(value),
      ]);
      await AsyncStorage.multiSet(pairs);
    } catch (error) {
      console.error("Failed to import data:", error);
      throw error;
    }
  }
}

export const storageService = new StorageService();