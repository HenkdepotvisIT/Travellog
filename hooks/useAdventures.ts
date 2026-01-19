import { useState, useEffect, useCallback } from "react";
import { storageService } from "../services/storageService";
import { immichApi } from "../services/immichApi";
import { clusterMediaIntoAdventures } from "../services/clusteringService";
import { Adventure, AdventureFilters, SyncStatus } from "../types";

// Demo data for first-time users
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
      { lat: 34.6937, lng: 135.5023 },
      { lat: 35.0116, lng: 135.7681 },
    ],
    stopPoints: [
      { lat: 35.6762, lng: 139.6503, name: "Tokyo", photos: 89 },
      { lat: 34.6937, lng: 135.5023, name: "Osaka", photos: 67 },
      { lat: 35.0116, lng: 135.7681, name: "Kyoto", photos: 91 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400",
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400",
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400",
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400",
    ],
    narrative: "",
    aiSummary: "An unforgettable journey through Japan during cherry blossom season. From the bustling streets of Tokyo to the serene temples of Kyoto, this adventure captured the perfect blend of modern innovation and ancient tradition.",
    highlights: [
      "Witnessed cherry blossoms at Ueno Park",
      "Explored ancient temples in Kyoto",
      "Experienced authentic ramen in Osaka",
      "Visited the iconic Fushimi Inari shrine",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
      { lat: 45.4408, lng: 12.3155, name: "Venice", photos: 90 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400",
      "https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=400",
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400",
      "https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?w=400",
      "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=400",
    ],
    narrative: "",
    aiSummary: "A romantic journey through Italy's most iconic cities. From the ancient ruins of Rome to the artistic treasures of Florence and the magical canals of Venice, every moment was filled with beauty, history, and incredible cuisine.",
    highlights: [
      "Explored the Colosseum at sunset",
      "Admired Michelangelo's David in Florence",
      "Gondola ride through Venice canals",
      "Authentic pasta making class in Rome",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-3",
    title: "Nordic Winter Wonderland",
    location: "Norway",
    startDate: "Dec 10, 2023",
    endDate: "Dec 20, 2023",
    coverPhoto: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800",
    mediaCount: 156,
    distance: 620,
    duration: 11,
    stops: 4,
    coordinates: { lat: 69.6492, lng: 18.9553 },
    route: [
      { lat: 59.9139, lng: 10.7522 },
      { lat: 69.6492, lng: 18.9553 },
    ],
    stopPoints: [
      { lat: 59.9139, lng: 10.7522, name: "Oslo", photos: 45 },
      { lat: 69.6492, lng: 18.9553, name: "Tromsø", photos: 111 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400",
      "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=400",
      "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=400",
      "https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=400",
    ],
    narrative: "",
    aiSummary: "A magical winter expedition to chase the Northern Lights in Norway. The journey from Oslo to Tromsø revealed stunning fjords, cozy Nordic villages, and the breathtaking aurora borealis dancing across the Arctic sky.",
    highlights: [
      "Witnessed the Northern Lights",
      "Dog sledding through snowy forests",
      "Visited the Arctic Cathedral",
      "Experienced polar night phenomenon",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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
      // Get stored adventures
      let storedAdventures = await storageService.getAdventures();
      
      // If no stored adventures, use demo data and save it
      if (storedAdventures.length === 0) {
        storedAdventures = DEMO_ADVENTURES;
        await storageService.saveAdventures(storedAdventures);
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

  // Sync with Immich server
  const syncWithImmich = useCallback(async () => {
    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Fetch media from Immich
      const media = await immichApi.getMediaWithLocation();
      
      // Cache the media
      await storageService.cacheMedia(media);

      // Get settings for clustering
      const settings = await storageService.getSettings();
      
      // Cluster into adventures
      const clusteredAdventures = clusterMediaIntoAdventures(media, {
        timeWindowHours: settings?.clusterTimeWindow || 24,
        distanceThresholdKm: settings?.clusterDistanceKm || 50,
        minPhotos: settings?.minPhotosPerAdventure || 5,
      });

      // Merge with existing custom data (narratives, etc.)
      const existingAdventures = await storageService.getAdventures();
      const customData = await storageService.getAllCustomData();
      const narratives = await storageService.getAllNarratives();

      const mergedAdventures = clusteredAdventures.map((adventure) => {
        const existing = existingAdventures.find((a) => a.id === adventure.id);
        const custom = customData[adventure.id];
        const narrative = narratives[adventure.id];

        return {
          ...adventure,
          ...custom,
          narrative: narrative || adventure.narrative,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      // Save merged adventures
      await storageService.saveAdventures(mergedAdventures);

      setSyncStatus({
        lastSyncTime: new Date(),
        isSyncing: false,
        error: null,
      });

      // Reload adventures
      await loadAdventures();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Sync failed";
      setSyncStatus((prev) => ({
        ...prev,
        isSyncing: false,
        error: errorMessage,
      }));
      console.error("Sync failed:", err);
    }
  }, [loadAdventures]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (adventureId: string) => {
    const isFavorite = await storageService.isFavorite(adventureId);
    
    if (isFavorite) {
      await storageService.removeFavorite(adventureId);
    } else {
      await storageService.addFavorite(adventureId);
    }

    // Update local state
    setAdventures((prev) =>
      prev.map((a) =>
        a.id === adventureId ? { ...a, isFavorite: !isFavorite } : a
      )
    );
  }, []);

  // Hide adventure
  const hideAdventure = useCallback(async (adventureId: string) => {
    await storageService.hideAdventure(adventureId);
    
    // Remove from local state if not showing hidden
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
  };
}