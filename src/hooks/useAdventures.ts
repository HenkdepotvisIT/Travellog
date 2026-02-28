import { useState, useEffect, useCallback } from "react";
import { storageService } from "../services/storageService";
import { immichApi } from "../services/immichApi";
import { 
  clusterMediaIntoAdventures, 
  mergeAdventures,
  regeneratePhotoUrls,
  DEFAULT_CLUSTER_CONFIG,
} from "../services/clusteringService";
import { Adventure, AdventureFilters, SyncStatus, SyncResult } from "../types";

// Demo data for when not connected to Immich
const DEMO_ADVENTURES: Adventure[] = [
  {
    id: "demo-1",
    title: "Japanese Spring Adventure",
    location: "Japan",
    startDate: "Mar 15, 2024",
    endDate: "Mar 28, 2024",
    coverPhoto: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800",
    mediaCount: 247,
    distance: 1250,
    duration: 14,
    stops: 8,
    coordinates: { lat: 35.6762, lng: 139.6503 },
    route: [
      { lat: 35.6762, lng: 139.6503 },
      { lat: 35.0116, lng: 135.7681 },
      { lat: 34.6937, lng: 135.5023 },
    ],
    stopPoints: [
      { lat: 35.6762, lng: 139.6503, name: "Tokyo", photos: 89 },
      { lat: 35.0116, lng: 135.7681, name: "Kyoto", photos: 91 },
      { lat: 34.6937, lng: 135.5023, name: "Osaka", photos: 45 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400",
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400",
    ],
    narrative: "",
    aiSummary: "An unforgettable journey through Japan during cherry blossom season.",
    highlights: [
      "Witnessed cherry blossoms at Ueno Park",
      "Explored ancient temples in Kyoto",
      "Experienced authentic ramen in Osaka",
    ],
  },
  {
    id: "demo-2",
    title: "Italian Summer Escape",
    location: "Italy",
    startDate: "Jun 5, 2024",
    endDate: "Jun 18, 2024",
    coverPhoto: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800",
    mediaCount: 312,
    distance: 890,
    duration: 14,
    stops: 6,
    coordinates: { lat: 41.9028, lng: 12.4964 },
    route: [
      { lat: 41.9028, lng: 12.4964 },
      { lat: 43.7696, lng: 11.2558 },
      { lat: 45.4408, lng: 12.3155 },
    ],
    stopPoints: [
      { lat: 41.9028, lng: 12.4964, name: "Rome", photos: 124 },
      { lat: 43.7696, lng: 11.2558, name: "Florence", photos: 98 },
      { lat: 45.4408, lng: 12.3155, name: "Venice", photos: 65 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400",
      "https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=400",
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400",
    ],
    narrative: "The trip of a lifetime through Italy!",
    aiSummary: "A romantic journey through Italy's most iconic cities.",
    highlights: [
      "Explored the Colosseum at sunset",
      "Admired Michelangelo's David",
      "Gondola ride through Venice",
    ],
    isFavorite: true,
  },
];

export function useAdventures(filters: AdventureFilters) {
  const [adventures, setAdventures] = useState<Adventure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSyncTime: null,
    isSyncing: false,
    error: null,
  });

  // Load adventures from storage on mount
  const loadAdventures = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let storedAdventures = await storageService.getAdventures();
      
      // If connected to Immich, regenerate photo URLs to ensure they're current
      if (immichApi.isConfigured() && storedAdventures.length > 0) {
        storedAdventures = storedAdventures.map(regeneratePhotoUrls);
      }
      
      // If no stored adventures and not connected, use demo data
      if (storedAdventures.length === 0 && !immichApi.isConfigured()) {
        storedAdventures = DEMO_ADVENTURES;
      }

      // Get favorites and hidden status
      const [favorites, hidden] = await Promise.all([
        storageService.getFavorites(),
        storageService.getHiddenAdventures(),
      ]);

      // Merge with favorites/hidden status
      const adventuresWithStatus = storedAdventures.map((adventure) => ({
        ...adventure,
        isFavorite: favorites.includes(adventure.id),
        isHidden: hidden.includes(adventure.id),
      }));

      // Apply filters
      let filtered = adventuresWithStatus;

      // Filter hidden unless explicitly showing
      if (!filters.showHidden) {
        filtered = filtered.filter((a) => !a.isHidden);
      }

      // Filter favorites only
      if (filters.showFavoritesOnly) {
        filtered = filtered.filter((a) => a.isFavorite);
      }

      // Filter by country
      if (filters.country) {
        filtered = filtered.filter((a) =>
          a.location.toLowerCase().includes(filters.country!.toLowerCase())
        );
      }

      // Filter by minimum distance
      if (filters.minDistance > 0) {
        filtered = filtered.filter((a) => a.distance >= filters.minDistance);
      }

      // Get last sync time
      const lastSyncTime = await storageService.getLastSyncTime();
      setSyncStatus((prev) => ({ ...prev, lastSyncTime }));

      setAdventures(filtered);
    } catch (err) {
      setError("Failed to load adventures");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Full sync with Immich - fetches all photos and generates adventures
  const syncWithImmich = useCallback(async (): Promise<SyncResult> => {
    if (!immichApi.isConfigured()) {
      return {
        success: false,
        adventuresCreated: 0,
        adventuresUpdated: 0,
        photosProcessed: 0,
        photosWithGps: 0,
        error: "Not connected to Immich",
      };
    }

    setSyncStatus({
      lastSyncTime: syncStatus.lastSyncTime,
      isSyncing: true,
      syncProgress: {
        phase: "fetching",
        current: 0,
        total: 0,
        message: "Connecting to Immich...",
      },
      error: null,
    });

    try {
      // Phase 1: Fetch all photos with GPS data
      console.log("Starting Immich sync...");
      
      const mediaWithLocation = await immichApi.getMediaWithLocation((current, total) => {
        setSyncStatus((prev) => ({
          ...prev,
          syncProgress: {
            phase: "fetching",
            current,
            total,
            message: `Fetching photos: ${current}${total ? ` / ${total}` : ""}`,
          },
        }));
      });

      console.log(`Found ${mediaWithLocation.length} photos with GPS data`);

      if (mediaWithLocation.length === 0) {
        setSyncStatus({
          lastSyncTime: new Date(),
          isSyncing: false,
          error: null,
        });
        
        await storageService.setLastSyncTime(new Date());
        
        return {
          success: true,
          adventuresCreated: 0,
          adventuresUpdated: 0,
          photosProcessed: 0,
          photosWithGps: 0,
          error: "No photos with GPS data found",
        };
      }

      // Phase 2: Cluster photos into adventures
      setSyncStatus((prev) => ({
        ...prev,
        syncProgress: {
          phase: "clustering",
          current: 0,
          total: mediaWithLocation.length,
          message: "Analyzing photos and creating adventures...",
        },
      }));

      // Get clustering settings
      const settings = await storageService.getSettings();
      const clusterConfig = {
        timeWindowHours: settings?.clusterTimeWindow || DEFAULT_CLUSTER_CONFIG.timeWindowHours,
        distanceThresholdKm: settings?.clusterDistanceKm || DEFAULT_CLUSTER_CONFIG.distanceThresholdKm,
        minPhotos: settings?.minPhotosPerAdventure || DEFAULT_CLUSTER_CONFIG.minPhotos,
      };

      const newAdventures = clusterMediaIntoAdventures(mediaWithLocation, clusterConfig);
      
      console.log(`Created ${newAdventures.length} adventures from ${mediaWithLocation.length} photos`);

      // Phase 3: Merge with existing adventures (preserve user data)
      setSyncStatus((prev) => ({
        ...prev,
        syncProgress: {
          phase: "saving",
          current: newAdventures.length,
          total: newAdventures.length,
          message: "Saving adventures...",
        },
      }));

      const existingAdventures = await storageService.getAdventures();
      const existingCount = existingAdventures.length;
      
      const mergedAdventures = mergeAdventures(existingAdventures, newAdventures);
      
      // Save merged adventures
      await storageService.saveAdventures(mergedAdventures);
      await storageService.setLastSyncTime(new Date());

      // Calculate stats
      const adventuresCreated = mergedAdventures.length - existingCount;
      const adventuresUpdated = Math.min(existingCount, newAdventures.length);

      setSyncStatus({
        lastSyncTime: new Date(),
        isSyncing: false,
        syncProgress: {
          phase: "done",
          current: newAdventures.length,
          total: newAdventures.length,
          message: `Created ${adventuresCreated} new adventures!`,
        },
        error: null,
      });

      // Reload adventures
      await loadAdventures();

      return {
        success: true,
        adventuresCreated: Math.max(0, adventuresCreated),
        adventuresUpdated,
        photosProcessed: mediaWithLocation.length,
        photosWithGps: mediaWithLocation.length,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sync failed";
      console.error("Sync failed:", err);
      
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: errorMessage,
      }));

      return {
        success: false,
        adventuresCreated: 0,
        adventuresUpdated: 0,
        photosProcessed: 0,
        photosWithGps: 0,
        error: errorMessage,
      };
    }
  }, [loadAdventures, syncStatus.lastSyncTime]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (adventureId: string) => {
    const isFavorite = await storageService.isFavorite(adventureId);
    
    if (isFavorite) {
      await storageService.removeFavorite(adventureId);
    } else {
      await storageService.addFavorite(adventureId);
    }

    setAdventures((prev) =>
      prev.map((a) =>
        a.id === adventureId ? { ...a, isFavorite: !isFavorite } : a
      )
    );
  }, []);

  // Hide adventure
  const hideAdventure = useCallback(async (adventureId: string) => {
    await storageService.hideAdventure(adventureId);
    
    if (!filters.showHidden) {
      setAdventures((prev) => prev.filter((a) => a.id !== adventureId));
    } else {
      setAdventures((prev) =>
        prev.map((a) =>
          a.id === adventureId ? { ...a, isHidden: true } : a
        )
      );
    }
  }, [filters.showHidden]);

  // Unhide adventure
  const unhideAdventure = useCallback(async (adventureId: string) => {
    await storageService.unhideAdventure(adventureId);
    await loadAdventures();
  }, [loadAdventures]);

  // Delete adventure
  const deleteAdventure = useCallback(async (adventureId: string) => {
    await storageService.deleteAdventure(adventureId);
    setAdventures((prev) => prev.filter((a) => a.id !== adventureId));
  }, []);

  // Clear all synced data and reset to demo
  const resetToDemo = useCallback(async () => {
    await storageService.saveAdventures([]);
    await loadAdventures();
  }, [loadAdventures]);

  useEffect(() => {
    loadAdventures();
  }, [loadAdventures]);

  return {
    adventures,
    loading,
    error,
    syncStatus,
    refresh: loadAdventures,
    syncWithImmich,
    toggleFavorite,
    hideAdventure,
    unhideAdventure,
    deleteAdventure,
    resetToDemo,
  };
}