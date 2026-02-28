import { Adventure, MediaItem, AppSettings } from "../types";

// Demo data for when API is unavailable
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
    ],
    narrative: "",
    aiSummary: "An unforgettable journey through Japan during cherry blossom season. From the bustling streets of Tokyo to the serene temples of Kyoto, this adventure captured the perfect blend of modern innovation and ancient tradition.",
    highlights: [
      "Witnessed cherry blossoms at Ueno Park",
      "Explored ancient temples in Kyoto",
      "Experienced authentic ramen in Osaka",
      "Visited the iconic Fushimi Inari shrine",
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
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=400",
      "https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?w=400",
    ],
    narrative: "The trip of a lifetime through Italy!",
    aiSummary: "A romantic journey through Italy's most iconic cities. From the ancient ruins of Rome to the artistic treasures of Florence and the magical canals of Venice.",
    highlights: [
      "Explored the Colosseum at sunset",
      "Admired Michelangelo's David",
      "Gondola ride through Venice",
      "Authentic pasta making class",
    ],
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
    ],
    narrative: "",
    aiSummary: "A magical winter expedition to chase the Northern Lights in Norway. Stunning fjords, cozy Nordic villages, and the breathtaking aurora borealis.",
    highlights: [
      "Witnessed the Northern Lights",
      "Dog sledding through forests",
      "Visited the Arctic Cathedral",
      "Fjord cruise through icy waters",
    ],
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
    ],
    narrative: "Two weeks of paradise!",
    aiSummary: "An idyllic escape through Thailand's most beautiful islands. Turquoise waters, white sand beaches, and unforgettable sunsets.",
    highlights: [
      "Explored Bangkok's Grand Palace",
      "Snorkeling in crystal clear waters",
      "Watched sunset at Maya Bay",
      "Thai cooking class in Phuket",
    ],
    isFavorite: true,
  },
  {
    id: "demo-5",
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
      { lat: -45.0312, lng: 168.6626 },
    ],
    stopPoints: [
      { lat: -36.8485, lng: 174.7633, name: "Auckland", photos: 67 },
      { lat: -38.1368, lng: 176.2497, name: "Rotorua", photos: 89 },
      { lat: -41.2865, lng: 174.7762, name: "Wellington", photos: 54 },
      { lat: -45.0312, lng: 168.6626, name: "Queenstown", photos: 169 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1469521669194-babb45599def?w=400",
      "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400",
      "https://images.unsplash.com/photo-1531804055935-76f44d7c3621?w=400",
      "https://images.unsplash.com/photo-1508193638397-1c4234db14d8?w=400",
      "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400",
    ],
    narrative: "The most epic road trip of my life!",
    aiSummary: "An epic road trip across both islands of New Zealand. From Auckland's harbors to Rotorua's geothermal wonders and adventure capital Queenstown.",
    highlights: [
      "Bungee jumping in Queenstown",
      "Hiked to Mount Cook base camp",
      "Explored Hobbiton movie set",
      "Milford Sound cruise",
    ],
    isFavorite: true,
  },
  {
    id: "demo-6",
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
    ],
    stopPoints: [
      { lat: 37.9838, lng: 23.7275, name: "Athens", photos: 89 },
      { lat: 37.4467, lng: 25.3289, name: "Mykonos", photos: 98 },
      { lat: 36.3932, lng: 25.4615, name: "Santorini", photos: 134 },
    ],
    photos: [
      "https://images.unsplash.com/photo-1533105079780-92b9be482077?w=400",
      "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=400",
      "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=400",
      "https://images.unsplash.com/photo-1580502304784-8985b7eb7260?w=400",
    ],
    narrative: "",
    aiSummary: "A dreamy island-hopping adventure through the Greek Cyclades. Ancient ruins in Athens, party vibes in Mykonos, and iconic sunsets in Santorini.",
    highlights: [
      "Explored the Acropolis at sunrise",
      "Watched sunset in Oia, Santorini",
      "Beach hopping in Mykonos",
      "Swam in volcanic hot springs",
    ],
  },
];

const getApiBaseUrl = (): string => {
  if (typeof window !== "undefined" && window.location) {
    return window.location.origin;
  }
  return "http://localhost:3000";
};

const API_BASE = getApiBaseUrl();

// Track if API is available
let apiAvailable: boolean | null = null;

async function checkApiAvailability(): Promise<boolean> {
  if (apiAvailable !== null) {
    return apiAvailable;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${API_BASE}/api/health`, {
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    apiAvailable = response.ok;
    return apiAvailable;
  } catch (error) {
    console.log("API not available, using demo data");
    apiAvailable = false;
    return false;
  }
}

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}/api${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
}

class ApiStorageService {
  // ============ Adventures ============

  async saveAdventures(adventures: Adventure[]): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) {
      console.log("API not available, skipping save");
      return;
    }
    
    try {
      await fetchApi("/adventures", {
        method: "POST",
        body: JSON.stringify(adventures),
      });
      await this.setLastSyncTime(new Date());
    } catch (error) {
      console.error("Failed to save adventures:", error);
    }
  }

  async getAdventures(): Promise<Adventure[]> {
    const isAvailable = await checkApiAvailability();
    
    if (!isAvailable) {
      console.log("API not available, returning demo data");
      return DEMO_ADVENTURES;
    }
    
    try {
      const adventures = await fetchApi<Adventure[]>("/adventures");
      // If API returns empty array, return demo data
      if (!adventures || adventures.length === 0) {
        return DEMO_ADVENTURES;
      }
      return adventures;
    } catch (error) {
      console.error("Failed to get adventures, returning demo data:", error);
      return DEMO_ADVENTURES;
    }
  }

  async saveAdventure(adventure: Adventure): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      await fetchApi(`/adventures/${adventure.id}`, {
        method: "PUT",
        body: JSON.stringify(adventure),
      });
    } catch (error) {
      console.error("Failed to save adventure:", error);
    }
  }

  async deleteAdventure(adventureId: string): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      await fetchApi(`/adventures/${adventureId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to delete adventure:", error);
    }
  }

  // ============ Narratives ============

  async saveNarrative(adventureId: string, narrative: string): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      await fetchApi(`/narratives/${adventureId}`, {
        method: "POST",
        body: JSON.stringify({ narrative }),
      });
    } catch (error) {
      console.error("Failed to save narrative:", error);
    }
  }

  async getNarrative(adventureId: string): Promise<string | null> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return null;
    
    try {
      const narratives = await this.getAllNarratives();
      return narratives[adventureId] || null;
    } catch (error) {
      console.error("Failed to get narrative:", error);
      return null;
    }
  }

  async getAllNarratives(): Promise<Record<string, string>> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return {};
    
    try {
      return await fetchApi<Record<string, string>>("/narratives");
    } catch (error) {
      console.error("Failed to get narratives:", error);
      return {};
    }
  }

  // ============ Custom Adventure Data ============

  async saveCustomData(adventureId: string, data: Partial<Adventure>): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      const adventures = await this.getAdventures();
      const adventure = adventures.find((a) => a.id === adventureId);
      if (adventure) {
        await this.saveAdventure({ ...adventure, ...data });
      }
    } catch (error) {
      console.error("Failed to save custom data:", error);
    }
  }

  async getCustomData(adventureId: string): Promise<Partial<Adventure> | null> {
    try {
      const adventures = await this.getAdventures();
      return adventures.find((a) => a.id === adventureId) || null;
    } catch (error) {
      console.error("Failed to get custom data:", error);
      return null;
    }
  }

  async getAllCustomData(): Promise<Record<string, Partial<Adventure>>> {
    try {
      const adventures = await this.getAdventures();
      const customData: Record<string, Partial<Adventure>> = {};
      adventures.forEach((a) => {
        customData[a.id] = a;
      });
      return customData;
    } catch (error) {
      console.error("Failed to get all custom data:", error);
      return {};
    }
  }

  // ============ Media Cache ============

  async cacheMedia(media: MediaItem[]): Promise<void> {
    console.log(`Media cache: ${media.length} items (stored in memory)`);
  }

  async getCachedMedia(): Promise<MediaItem[]> {
    return [];
  }

  async clearMediaCache(): Promise<void> {
    console.log("Media cache cleared");
  }

  // ============ Sync Time ============

  async setLastSyncTime(date: Date): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      await fetchApi("/sync-status", {
        method: "POST",
        body: JSON.stringify({ lastSyncTime: date.toISOString() }),
      });
    } catch (error) {
      console.error("Failed to set last sync time:", error);
    }
  }

  async getLastSyncTime(): Promise<Date | null> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return null;
    
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
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      await fetchApi("/settings", {
        method: "POST",
        body: JSON.stringify(settings),
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  async getSettings(): Promise<AppSettings | null> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) {
      // Return default settings when API is not available
      return {
        clusterTimeWindow: 24,
        clusterDistanceKm: 50,
        minPhotosPerAdventure: 5,
        showRouteLines: true,
        autoGenerateSummaries: false,
        defaultView: "map",
        proxyHeaders: [],
      };
    }
    
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
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      const favorites = await this.getFavorites();
      if (!favorites.includes(adventureId)) {
        favorites.push(adventureId);
        await fetchApi("/favorites", {
          method: "POST",
          body: JSON.stringify(favorites),
        });
      }
    } catch (error) {
      console.error("Failed to add favorite:", error);
    }
  }

  async removeFavorite(adventureId: string): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((id) => id !== adventureId);
      await fetchApi("/favorites", {
        method: "POST",
        body: JSON.stringify(filtered),
      });
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  }

  async getFavorites(): Promise<string[]> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) {
      // Return demo favorites
      return ["demo-4", "demo-5"];
    }
    
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
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      const hidden = await this.getHiddenAdventures();
      if (!hidden.includes(adventureId)) {
        hidden.push(adventureId);
        await fetchApi("/hidden", {
          method: "POST",
          body: JSON.stringify(hidden),
        });
      }
    } catch (error) {
      console.error("Failed to hide adventure:", error);
    }
  }

  async unhideAdventure(adventureId: string): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      const hidden = await this.getHiddenAdventures();
      const filtered = hidden.filter((id) => id !== adventureId);
      await fetchApi("/hidden", {
        method: "POST",
        body: JSON.stringify(filtered),
      });
    } catch (error) {
      console.error("Failed to unhide adventure:", error);
    }
  }

  async getHiddenAdventures(): Promise<string[]> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return [];
    
    try {
      return await fetchApi<string[]>("/hidden");
    } catch (error) {
      console.error("Failed to get hidden adventures:", error);
      return [];
    }
  }

  // ============ Connection ============

  async saveConnection(serverUrl: string, apiKey: string): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      await fetchApi("/connection", {
        method: "POST",
        body: JSON.stringify({ serverUrl, apiKey, isConnected: true }),
      });
    } catch (error) {
      console.error("Failed to save connection:", error);
    }
  }

  async getConnection(): Promise<{ serverUrl: string | null; apiKey: string | null; isConnected: boolean }> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) {
      return { serverUrl: null, apiKey: null, isConnected: false };
    }
    
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
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      await fetchApi("/connection", {
        method: "POST",
        body: JSON.stringify({ serverUrl: null, apiKey: null, isConnected: false }),
      });
    } catch (error) {
      console.error("Failed to clear connection:", error);
    }
  }

  // ============ Clear All Data ============

  async clearAllData(): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      await fetchApi("/data", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to clear all data:", error);
    }
  }

  // ============ Export/Import ============

  async exportAllData(): Promise<string> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) {
      // Export demo data
      return JSON.stringify({ adventures: DEMO_ADVENTURES, exportedAt: new Date().toISOString() }, null, 2);
    }
    
    try {
      const data = await fetchApi<Record<string, any>>("/export");
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("Failed to export data:", error);
      return JSON.stringify({ adventures: DEMO_ADVENTURES, exportedAt: new Date().toISOString() }, null, 2);
    }
  }

  async importData(jsonString: string): Promise<void> {
    const isAvailable = await checkApiAvailability();
    if (!isAvailable) return;
    
    try {
      const data = JSON.parse(jsonString);
      await fetchApi("/import", {
        method: "POST",
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error("Failed to import data:", error);
    }
  }
}

export const apiStorageService = new ApiStorageService();