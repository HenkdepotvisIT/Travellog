import { Platform } from "react-native";
import { Adventure, MediaItem, AppSettings } from "../types";

// Determine if we should use API storage (Docker/web) or AsyncStorage (native app)
const useApiStorage = (): boolean => {
  // Use API storage for web platform or when API_URL is set
  if (Platform.OS === "web") {
    return true;
  }
  // For native apps, check if we have an API URL configured
  return !!process.env.EXPO_PUBLIC_API_URL;
};

// Lazy load the appropriate storage service
let storageImplementation: any = null;

async function getStorage() {
  if (storageImplementation) {
    return storageImplementation;
  }

  if (useApiStorage()) {
    const { apiStorageService } = await import("./apiStorageService");
    storageImplementation = apiStorageService;
  } else {
    const { localStorageService } = await import("./localStorageService");
    storageImplementation = localStorageService;
  }

  return storageImplementation;
}

// Proxy class that delegates to the appropriate implementation
class StorageService {
  async saveAdventures(adventures: Adventure[]): Promise<void> {
    const storage = await getStorage();
    return storage.saveAdventures(adventures);
  }

  async getAdventures(): Promise<Adventure[]> {
    const storage = await getStorage();
    return storage.getAdventures();
  }

  async saveAdventure(adventure: Adventure): Promise<void> {
    const storage = await getStorage();
    return storage.saveAdventure(adventure);
  }

  async deleteAdventure(adventureId: string): Promise<void> {
    const storage = await getStorage();
    return storage.deleteAdventure(adventureId);
  }

  async saveNarrative(adventureId: string, narrative: string): Promise<void> {
    const storage = await getStorage();
    return storage.saveNarrative(adventureId, narrative);
  }

  async getNarrative(adventureId: string): Promise<string | null> {
    const storage = await getStorage();
    return storage.getNarrative(adventureId);
  }

  async getAllNarratives(): Promise<Record<string, string>> {
    const storage = await getStorage();
    return storage.getAllNarratives();
  }

  async saveCustomData(adventureId: string, data: Partial<Adventure>): Promise<void> {
    const storage = await getStorage();
    return storage.saveCustomData(adventureId, data);
  }

  async getCustomData(adventureId: string): Promise<Partial<Adventure> | null> {
    const storage = await getStorage();
    return storage.getCustomData(adventureId);
  }

  async getAllCustomData(): Promise<Record<string, Partial<Adventure>>> {
    const storage = await getStorage();
    return storage.getAllCustomData();
  }

  async cacheMedia(media: MediaItem[]): Promise<void> {
    const storage = await getStorage();
    return storage.cacheMedia(media);
  }

  async getCachedMedia(): Promise<MediaItem[]> {
    const storage = await getStorage();
    return storage.getCachedMedia();
  }

  async clearMediaCache(): Promise<void> {
    const storage = await getStorage();
    return storage.clearMediaCache();
  }

  async setLastSyncTime(date: Date): Promise<void> {
    const storage = await getStorage();
    return storage.setLastSyncTime(date);
  }

  async getLastSyncTime(): Promise<Date | null> {
    const storage = await getStorage();
    return storage.getLastSyncTime();
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const storage = await getStorage();
    return storage.saveSettings(settings);
  }

  async getSettings(): Promise<AppSettings | null> {
    const storage = await getStorage();
    return storage.getSettings();
  }

  async addFavorite(adventureId: string): Promise<void> {
    const storage = await getStorage();
    return storage.addFavorite(adventureId);
  }

  async removeFavorite(adventureId: string): Promise<void> {
    const storage = await getStorage();
    return storage.removeFavorite(adventureId);
  }

  async getFavorites(): Promise<string[]> {
    const storage = await getStorage();
    return storage.getFavorites();
  }

  async isFavorite(adventureId: string): Promise<boolean> {
    const storage = await getStorage();
    return storage.isFavorite(adventureId);
  }

  async hideAdventure(adventureId: string): Promise<void> {
    const storage = await getStorage();
    return storage.hideAdventure(adventureId);
  }

  async unhideAdventure(adventureId: string): Promise<void> {
    const storage = await getStorage();
    return storage.unhideAdventure(adventureId);
  }

  async getHiddenAdventures(): Promise<string[]> {
    const storage = await getStorage();
    return storage.getHiddenAdventures();
  }

  async saveConnection(serverUrl: string, apiKey: string): Promise<void> {
    const storage = await getStorage();
    return storage.saveConnection(serverUrl, apiKey);
  }

  async getConnection(): Promise<{ serverUrl: string | null; apiKey: string | null; isConnected: boolean }> {
    const storage = await getStorage();
    return storage.getConnection();
  }

  async clearConnection(): Promise<void> {
    const storage = await getStorage();
    return storage.clearConnection();
  }

  async clearAllData(): Promise<void> {
    const storage = await getStorage();
    return storage.clearAllData();
  }

  async exportAllData(): Promise<string> {
    const storage = await getStorage();
    return storage.exportAllData();
  }

  async importData(jsonString: string): Promise<void> {
    const storage = await getStorage();
    return storage.importData(jsonString);
  }
}

export const storageService = new StorageService();