import { Adventure, MediaItem, AppSettings } from "../types";
import { apiStorageService } from "./apiStorageService";

// Always use the API storage service which connects to PostgreSQL
// This ensures all platforms (web, iOS, Android) share the same data

class StorageService {
  async saveAdventures(adventures: Adventure[]): Promise<void> {
    return apiStorageService.saveAdventures(adventures);
  }

  async getAdventures(): Promise<Adventure[]> {
    return apiStorageService.getAdventures();
  }

  async saveAdventure(adventure: Adventure): Promise<void> {
    return apiStorageService.saveAdventure(adventure);
  }

  async deleteAdventure(adventureId: string): Promise<void> {
    return apiStorageService.deleteAdventure(adventureId);
  }

  async saveNarrative(adventureId: string, narrative: string): Promise<void> {
    return apiStorageService.saveNarrative(adventureId, narrative);
  }

  async getNarrative(adventureId: string): Promise<string | null> {
    return apiStorageService.getNarrative(adventureId);
  }

  async getAllNarratives(): Promise<Record<string, string>> {
    return apiStorageService.getAllNarratives();
  }

  async saveCustomData(adventureId: string, data: Partial<Adventure>): Promise<void> {
    return apiStorageService.saveCustomData(adventureId, data);
  }

  async getCustomData(adventureId: string): Promise<Partial<Adventure> | null> {
    return apiStorageService.getCustomData(adventureId);
  }

  async getAllCustomData(): Promise<Record<string, Partial<Adventure>>> {
    return apiStorageService.getAllCustomData();
  }

  async cacheMedia(media: MediaItem[]): Promise<void> {
    return apiStorageService.cacheMedia(media);
  }

  async getCachedMedia(): Promise<MediaItem[]> {
    return apiStorageService.getCachedMedia();
  }

  async clearMediaCache(): Promise<void> {
    return apiStorageService.clearMediaCache();
  }

  async setLastSyncTime(date: Date): Promise<void> {
    return apiStorageService.setLastSyncTime(date);
  }

  async getLastSyncTime(): Promise<Date | null> {
    return apiStorageService.getLastSyncTime();
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    return apiStorageService.saveSettings(settings);
  }

  async getSettings(): Promise<AppSettings | null> {
    return apiStorageService.getSettings();
  }

  async addFavorite(adventureId: string): Promise<void> {
    return apiStorageService.addFavorite(adventureId);
  }

  async removeFavorite(adventureId: string): Promise<void> {
    return apiStorageService.removeFavorite(adventureId);
  }

  async getFavorites(): Promise<string[]> {
    return apiStorageService.getFavorites();
  }

  async isFavorite(adventureId: string): Promise<boolean> {
    return apiStorageService.isFavorite(adventureId);
  }

  async hideAdventure(adventureId: string): Promise<void> {
    return apiStorageService.hideAdventure(adventureId);
  }

  async unhideAdventure(adventureId: string): Promise<void> {
    return apiStorageService.unhideAdventure(adventureId);
  }

  async getHiddenAdventures(): Promise<string[]> {
    return apiStorageService.getHiddenAdventures();
  }

  async saveConnection(serverUrl: string, apiKey: string): Promise<void> {
    return apiStorageService.saveConnection(serverUrl, apiKey);
  }

  async getConnection(): Promise<{ serverUrl: string | null; apiKey: string | null; isConnected: boolean }> {
    return apiStorageService.getConnection();
  }

  async clearConnection(): Promise<void> {
    return apiStorageService.clearConnection();
  }

  async clearAllData(): Promise<void> {
    return apiStorageService.clearAllData();
  }

  async exportAllData(): Promise<string> {
    return apiStorageService.exportAllData();
  }

  async importData(jsonString: string): Promise<void> {
    return apiStorageService.importData(jsonString);
  }
}

export const storageService = new StorageService();