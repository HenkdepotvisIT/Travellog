import AsyncStorage from "@react-native-async-storage/async-storage";
import { Adventure, MediaItem, AppSettings } from "../types";

const STORAGE_KEYS = {
  IMMICH_SERVER_URL: "immich_server_url",
  IMMICH_API_KEY: "immich_api_key",
  IMMICH_IS_CONNECTED: "immich_is_connected",
  ADVENTURES: "adventures",
  ADVENTURE_NARRATIVES: "adventure_narratives",
  ADVENTURE_CUSTOM_DATA: "adventure_custom_data",
  MEDIA_CACHE: "media_cache",
  LAST_SYNC_TIME: "last_sync_time",
  APP_SETTINGS: "app_settings",
  FAVORITE_ADVENTURES: "favorite_adventures",
  HIDDEN_ADVENTURES: "hidden_adventures",
};

class LocalStorageService {
  async saveAdventures(adventures: Adventure[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ADVENTURES, JSON.stringify(adventures));
    await this.setLastSyncTime(new Date());
  }

  async getAdventures(): Promise<Adventure[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVENTURES);
    return data ? JSON.parse(data) : [];
  }

  async saveAdventure(adventure: Adventure): Promise<void> {
    const adventures = await this.getAdventures();
    const index = adventures.findIndex((a) => a.id === adventure.id);
    if (index >= 0) {
      adventures[index] = adventure;
    } else {
      adventures.push(adventure);
    }
    await this.saveAdventures(adventures);
  }

  async deleteAdventure(adventureId: string): Promise<void> {
    const adventures = await this.getAdventures();
    const filtered = adventures.filter((a) => a.id !== adventureId);
    await this.saveAdventures(filtered);
  }

  async saveNarrative(adventureId: string, narrative: string): Promise<void> {
    const narratives = await this.getAllNarratives();
    narratives[adventureId] = narrative;
    await AsyncStorage.setItem(STORAGE_KEYS.ADVENTURE_NARRATIVES, JSON.stringify(narratives));
  }

  async getNarrative(adventureId: string): Promise<string | null> {
    const narratives = await this.getAllNarratives();
    return narratives[adventureId] || null;
  }

  async getAllNarratives(): Promise<Record<string, string>> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVENTURE_NARRATIVES);
    return data ? JSON.parse(data) : {};
  }

  async saveCustomData(adventureId: string, data: Partial<Adventure>): Promise<void> {
    const allCustomData = await this.getAllCustomData();
    allCustomData[adventureId] = { ...allCustomData[adventureId], ...data };
    await AsyncStorage.setItem(STORAGE_KEYS.ADVENTURE_CUSTOM_DATA, JSON.stringify(allCustomData));
  }

  async getCustomData(adventureId: string): Promise<Partial<Adventure> | null> {
    const allCustomData = await this.getAllCustomData();
    return allCustomData[adventureId] || null;
  }

  async getAllCustomData(): Promise<Record<string, Partial<Adventure>>> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.ADVENTURE_CUSTOM_DATA);
    return data ? JSON.parse(data) : {};
  }

  async cacheMedia(media: MediaItem[]): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.MEDIA_CACHE, JSON.stringify(media));
  }

  async getCachedMedia(): Promise<MediaItem[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.MEDIA_CACHE);
    return data ? JSON.parse(data) : [];
  }

  async clearMediaCache(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.MEDIA_CACHE);
  }

  async setLastSyncTime(date: Date): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC_TIME, date.toISOString());
  }

  async getLastSyncTime(): Promise<Date | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC_TIME);
    return data ? new Date(data) : null;
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, JSON.stringify(settings));
  }

  async getSettings(): Promise<AppSettings | null> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
    return data ? JSON.parse(data) : null;
  }

  async addFavorite(adventureId: string): Promise<void> {
    const favorites = await this.getFavorites();
    if (!favorites.includes(adventureId)) {
      favorites.push(adventureId);
      await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ADVENTURES, JSON.stringify(favorites));
    }
  }

  async removeFavorite(adventureId: string): Promise<void> {
    const favorites = await this.getFavorites();
    const filtered = favorites.filter((id) => id !== adventureId);
    await AsyncStorage.setItem(STORAGE_KEYS.FAVORITE_ADVENTURES, JSON.stringify(filtered));
  }

  async getFavorites(): Promise<string[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITE_ADVENTURES);
    return data ? JSON.parse(data) : [];
  }

  async isFavorite(adventureId: string): Promise<boolean> {
    const favorites = await this.getFavorites();
    return favorites.includes(adventureId);
  }

  async hideAdventure(adventureId: string): Promise<void> {
    const hidden = await this.getHiddenAdventures();
    if (!hidden.includes(adventureId)) {
      hidden.push(adventureId);
      await AsyncStorage.setItem(STORAGE_KEYS.HIDDEN_ADVENTURES, JSON.stringify(hidden));
    }
  }

  async unhideAdventure(adventureId: string): Promise<void> {
    const hidden = await this.getHiddenAdventures();
    const filtered = hidden.filter((id) => id !== adventureId);
    await AsyncStorage.setItem(STORAGE_KEYS.HIDDEN_ADVENTURES, JSON.stringify(filtered));
  }

  async getHiddenAdventures(): Promise<string[]> {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN_ADVENTURES);
    return data ? JSON.parse(data) : [];
  }

  async saveConnection(serverUrl: string, apiKey: string): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.IMMICH_SERVER_URL, serverUrl),
      AsyncStorage.setItem(STORAGE_KEYS.IMMICH_API_KEY, apiKey),
      AsyncStorage.setItem(STORAGE_KEYS.IMMICH_IS_CONNECTED, "true"),
    ]);
  }

  async getConnection(): Promise<{ serverUrl: string | null; apiKey: string | null; isConnected: boolean }> {
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
  }

  async clearConnection(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.IMMICH_SERVER_URL),
      AsyncStorage.removeItem(STORAGE_KEYS.IMMICH_API_KEY),
      AsyncStorage.setItem(STORAGE_KEYS.IMMICH_IS_CONNECTED, "false"),
    ]);
  }

  async clearAllData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  }

  async exportAllData(): Promise<string> {
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
  }

  async importData(jsonString: string): Promise<void> {
    const data = JSON.parse(jsonString);
    const pairs: [string, string][] = Object.entries(data).map(([key, value]) => [
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    ]);
    await AsyncStorage.multiSet(pairs);
  }
}

export const localStorageService = new LocalStorageService();