import { useState, useEffect, useCallback } from "react";
import { storageService } from "../services/storageService";
import { immichApi } from "../services/immichApi";
import { clusterMediaIntoAdventures } from "../services/clusteringService";
import { Adventure, AdventureFilters, SyncStatus } from "../types";

// Comprehensive demo data for testing all features
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
      { lat: 34.3853, lng: 132.4553 },
    ],
    stopPoints: [
      { lat: 35.6762, lng: 139.6503, name: "Tokyo", photos: 89 },
      { lat: 35.0116, lng: 135.7681, name: "Kyoto", photos: 91 },
      { lat: 34.6937, lng: 135.5023, name: "Osaka", photos: 45 },
      { lat: 34.3853, lng: 132.4553, name: "Hiroshima", photos: 22 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400",
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400",
      "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400",
      "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=400",
      "https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=400",
      "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400",
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400",
    ],
    narrative: "",
    aiSummary: "An unforgettable journey through Japan during cherry blossom season. From the bustling streets of Tokyo to the serene temples of Kyoto, this adventure captured the perfect blend of modern innovation and ancient tradition.",
    highlights: [
      "Witnessed cherry blossoms at Ueno Park",
      "Explored ancient temples in Kyoto",
      "Experienced authentic ramen in Osaka",
      "Visited the iconic Fushimi Inari shrine",
      "Paid respects at Hiroshima Peace Memorial",
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
      { lat: 45.4642, lng: 9.1900 },
    ],
    stopPoints: [
      { lat: 41.9028, lng: 12.4964, name: "Rome", photos: 124 },
      { lat: 43.7696, lng: 11.2558, name: "Florence", photos: 98 },
      { lat: 45.4408, lng: 12.3155, name: "Venice", photos: 65 },
      { lat: 45.4642, lng: 9.1900, name: "Milan", photos: 25 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400",
      "https://images.unsplash.com/photo-1534445867742-43195f401b6c?w=400",
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=400",
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400",
      "https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?w=400",
      "https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=400",
      "https://images.unsplash.com/photo-1529260830199-42c24126f198?w=400",
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400",
    ],
    narrative: "The trip of a lifetime through Italy! Every corner revealed another masterpiece, every meal was a celebration.",
    aiSummary: "A romantic journey through Italy's most iconic cities. From the ancient ruins of Rome to the artistic treasures of Florence and the magical canals of Venice, every moment was filled with beauty, history, and incredible cuisine.",
    highlights: [
      "Explored the Colosseum at sunset",
      "Admired Michelangelo's David in Florence",
      "Gondola ride through Venice canals",
      "Authentic pasta making class in Rome",
      "Climbed the Duomo in Florence",
      "Visited the Vatican Museums",
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
      { lat: 62.4722, lng: 6.1549 },
      { lat: 69.6492, lng: 18.9553 },
    ],
    stopPoints: [
      { lat: 59.9139, lng: 10.7522, name: "Oslo", photos: 45 },
      { lat: 62.4722, lng: 6.1549, name: "Ålesund", photos: 32 },
      { lat: 69.6492, lng: 18.9553, name: "Tromsø", photos: 79 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400",
      "https://images.unsplash.com/photo-1579033461380-adb47c3eb938?w=400",
      "https://images.unsplash.com/photo-1483921020237-2ff51e8e4b22?w=400",
      "https://images.unsplash.com/photo-1520769669658-f07657f5a307?w=400",
      "https://images.unsplash.com/photo-1507272931001-fc06c17e4f43?w=400",
      "https://images.unsplash.com/photo-1494500764479-0c8f2919a3d8?w=400",
    ],
    narrative: "",
    aiSummary: "A magical winter expedition to chase the Northern Lights in Norway. The journey from Oslo to Tromsø revealed stunning fjords, cozy Nordic villages, and the breathtaking aurora borealis dancing across the Arctic sky.",
    highlights: [
      "Witnessed the Northern Lights",
      "Dog sledding through snowy forests",
      "Visited the Arctic Cathedral",
      "Experienced polar night phenomenon",
      "Fjord cruise through icy waters",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-4",
    title: "Thai Island Hopping",
    location: "Thailand",
    startDate: "Feb 1, 2024",
    endDate: "Feb 14, 2024",
    coverPhoto: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=800",
    mediaCount: 423,
    distance: 450,
    duration: 14,
    stops: 5,
    coordinates: { lat: 7.8804, lng: 98.3923 },
    route: [
      { lat: 13.7563, lng: 100.5018 },
      { lat: 7.8804, lng: 98.3923 },
      { lat: 7.7407, lng: 98.7784 },
      { lat: 9.4609, lng: 100.0419 },
    ],
    stopPoints: [
      { lat: 13.7563, lng: 100.5018, name: "Bangkok", photos: 87 },
      { lat: 7.8804, lng: 98.3923, name: "Phuket", photos: 156 },
      { lat: 7.7407, lng: 98.7784, name: "Phi Phi Islands", photos: 112 },
      { lat: 9.4609, lng: 100.0419, name: "Koh Samui", photos: 68 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400",
      "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=400",
      "https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?w=400",
      "https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=400",
      "https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=400",
      "https://images.unsplash.com/photo-1528181304800-259b08848526?w=400",
      "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?w=400",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400",
    ],
    narrative: "Two weeks of paradise! Crystal clear waters, amazing food, and the friendliest people.",
    aiSummary: "An idyllic escape through Thailand's most beautiful islands. Starting in vibrant Bangkok, then island-hopping through Phuket, the stunning Phi Phi Islands, and ending in peaceful Koh Samui. Turquoise waters, white sand beaches, and unforgettable sunsets.",
    highlights: [
      "Explored Bangkok's Grand Palace",
      "Snorkeling in crystal clear waters",
      "Watched sunset at Maya Bay",
      "Thai cooking class in Phuket",
      "Full moon party on the beach",
      "Elephant sanctuary visit",
    ],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-5",
    title: "Spanish Fiesta",
    location: "Spain",
    startDate: "Sep 8, 2023",
    endDate: "Sep 18, 2023",
    coverPhoto: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800",
    mediaCount: 289,
    distance: 720,
    duration: 11,
    stops: 4,
    coordinates: { lat: 41.3851, lng: 2.1734 },
    route: [
      { lat: 40.4168, lng: -3.7038 },
      { lat: 41.3851, lng: 2.1734 },
      { lat: 39.4699, lng: -0.3763 },
      { lat: 37.3891, lng: -5.9845 },
    ],
    stopPoints: [
      { lat: 40.4168, lng: -3.7038, name: "Madrid", photos: 78 },
      { lat: 41.3851, lng: 2.1734, name: "Barcelona", photos: 112 },
      { lat: 39.4699, lng: -0.3763, name: "Valencia", photos: 54 },
      { lat: 37.3891, lng: -5.9845, name: "Seville", photos: 45 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400",
      "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=400",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
      "https://images.unsplash.com/photo-1509840841025-9088ba78a826?w=400",
      "https://images.unsplash.com/photo-1511527661048-7fe73d85e9a4?w=400",
      "https://images.unsplash.com/photo-1504019347908-b45f9b0b8dd5?w=400",
    ],
    narrative: "",
    aiSummary: "A vibrant journey through Spain's most captivating cities. From the art museums of Madrid to Gaudí's masterpieces in Barcelona, the futuristic architecture of Valencia, and the flamenco rhythms of Seville.",
    highlights: [
      "Visited the Prado Museum",
      "Marveled at La Sagrada Familia",
      "Watched flamenco in Seville",
      "Explored the City of Arts and Sciences",
      "Tapas crawl through Madrid",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-6",
    title: "New Zealand Road Trip",
    location: "New Zealand",
    startDate: "Nov 20, 2023",
    endDate: "Dec 8, 2023",
    coverPhoto: "https://images.unsplash.com/photo-1469521669194-babb45599def?w=800",
    mediaCount: 534,
    distance: 2100,
    duration: 19,
    stops: 8,
    coordinates: { lat: -44.0040, lng: 170.4769 },
    route: [
      { lat: -36.8485, lng: 174.7633 },
      { lat: -38.1368, lng: 176.2497 },
      { lat: -41.2865, lng: 174.7762 },
      { lat: -43.5321, lng: 172.6362 },
      { lat: -44.0040, lng: 170.4769 },
      { lat: -45.0312, lng: 168.6626 },
    ],
    stopPoints: [
      { lat: -36.8485, lng: 174.7633, name: "Auckland", photos: 67 },
      { lat: -38.1368, lng: 176.2497, name: "Rotorua", photos: 89 },
      { lat: -41.2865, lng: 174.7762, name: "Wellington", photos: 54 },
      { lat: -43.5321, lng: 172.6362, name: "Christchurch", photos: 43 },
      { lat: -44.0040, lng: 170.4769, name: "Mount Cook", photos: 112 },
      { lat: -45.0312, lng: 168.6626, name: "Queenstown", photos: 169 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1469521669194-babb45599def?w=400",
      "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400",
      "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?w=400",
      "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400",
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400",
      "https://images.unsplash.com/photo-1502003148287-a82ef80a6abc?w=400",
      "https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=400",
      "https://images.unsplash.com/photo-1455763916899-e8b50eca9967?w=400",
    ],
    narrative: "The most epic road trip of my life! New Zealand exceeded every expectation with its dramatic landscapes.",
    aiSummary: "An epic road trip across both islands of New Zealand. From Auckland's harbors to Rotorua's geothermal wonders, through Wellington's culture, past Christchurch's resilience, to the majestic Mount Cook and adventure capital Queenstown.",
    highlights: [
      "Bungee jumping in Queenstown",
      "Hiked to Mount Cook base camp",
      "Explored Hobbiton movie set",
      "Witnessed geysers in Rotorua",
      "Milford Sound cruise",
      "Stargazing at Lake Tekapo",
      "Skydiving over Queenstown",
    ],
    isFavorite: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-7",
    title: "Greek Island Odyssey",
    location: "Greece",
    startDate: "Jul 10, 2024",
    endDate: "Jul 22, 2024",
    coverPhoto: "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800",
    mediaCount: 378,
    distance: 340,
    duration: 13,
    stops: 5,
    coordinates: { lat: 36.3932, lng: 25.4615 },
    route: [
      { lat: 37.9838, lng: 23.7275 },
      { lat: 37.4467, lng: 25.3289 },
      { lat: 36.3932, lng: 25.4615 },
      { lat: 35.5138, lng: 24.0180 },
    ],
    stopPoints: [
      { lat: 37.9838, lng: 23.7275, name: "Athens", photos: 89 },
      { lat: 37.4467, lng: 25.3289, name: "Mykonos", photos: 98 },
      { lat: 36.3932, lng: 25.4615, name: "Santorini", photos: 134 },
      { lat: 35.5138, lng: 24.0180, name: "Crete", photos: 57 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400",
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400",
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400",
      "https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=400",
      "https://images.unsplash.com/photo-1555993539-1732b0258235?w=400",
      "https://images.unsplash.com/photo-1504512485720-7d83a16ee930?w=400",
    ],
    narrative: "",
    aiSummary: "A dreamy island-hopping adventure through the Greek Cyclades. Ancient ruins in Athens, party vibes in Mykonos, iconic sunsets in Santorini, and authentic culture in Crete. Blue domes, white walls, and endless Mediterranean beauty.",
    highlights: [
      "Explored the Acropolis at sunrise",
      "Watched sunset in Oia, Santorini",
      "Beach hopping in Mykonos",
      "Tasted authentic Greek cuisine",
      "Visited ancient Knossos palace",
      "Swam in volcanic hot springs",
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "demo-8",
    title: "Moroccan Desert Adventure",
    location: "Morocco",
    startDate: "Apr 5, 2024",
    endDate: "Apr 14, 2024",
    coverPhoto: "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=800",
    mediaCount: 267,
    distance: 980,
    duration: 10,
    stops: 5,
    coordinates: { lat: 31.6295, lng: -7.9811 },
    route: [
      { lat: 33.9716, lng: -6.8498 },
      { lat: 34.0209, lng: -6.8416 },
      { lat: 31.6295, lng: -7.9811 },
      { lat: 31.4342, lng: -4.0000 },
      { lat: 30.9335, lng: -6.9370 },
    ],
    stopPoints: [
      { lat: 33.9716, lng: -6.8498, name: "Rabat", photos: 34 },
      { lat: 34.0209, lng: -6.8416, name: "Fes", photos: 67 },
      { lat: 31.6295, lng: -7.9811, name: "Marrakech", photos: 89 },
      { lat: 31.4342, lng: -4.0000, name: "Sahara Desert", photos: 54 },
      { lat: 30.9335, lng: -6.9370, name: "Ouarzazate", photos: 23 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=400",
      "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=400",
      "https://images.unsplash.com/photo-1517821099606-cef63a9bcda6?w=400",
      "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=400",
      "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=400",
      "https://images.unsplash.com/photo-1531219572328-a0171b4448a3?w=400",
    ],
    narrative: "Morocco was a feast for all senses - the colors, the sounds, the smells, the flavors!",
    aiSummary: "An immersive journey through Morocco's imperial cities and Sahara Desert. From the ancient medinas of Fes to the vibrant souks of Marrakech, and a magical night under the stars in the Sahara. A sensory overload of colors, spices, and culture.",
    highlights: [
      "Camel trek into the Sahara",
      "Slept in a desert camp under stars",
      "Got lost in Fes medina",
      "Haggled in Marrakech souks",
      "Traditional hammam experience",
      "Visited Ait Benhaddou kasbah",
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

  // Reset to demo data
  const resetToDemo = useCallback(async () => {
    await storageService.saveAdventures(DEMO_ADVENTURES);
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