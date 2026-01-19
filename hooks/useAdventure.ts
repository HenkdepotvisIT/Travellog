import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Adventure } from "../types";

// This would normally fetch from API, using mock data for demo
const MOCK_ADVENTURES: Record<string, Adventure> = {
  "1": {
    id: "1",
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
      "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=400",
      "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=400",
      "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=400",
    ],
    narrative: "",
    aiSummary: "An unforgettable journey through Japan during cherry blossom season. From the bustling streets of Tokyo to the serene temples of Kyoto, this adventure captured the perfect blend of modern innovation and ancient tradition. The trip included visits to iconic landmarks, hidden local gems, and countless moments of cultural discovery.",
    highlights: [
      "Witnessed cherry blossoms at Ueno Park",
      "Explored ancient temples in Kyoto",
      "Experienced authentic ramen in Osaka",
      "Visited the iconic Fushimi Inari shrine",
      "Stayed in a traditional ryokan",
      "Rode the bullet train between cities",
    ],
  },
  "2": {
    id: "2",
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
  },
  "3": {
    id: "3",
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
  },
};

export function useAdventure(id: string | undefined) {
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdventure = useCallback(async () => {
    if (!id) {
      setError("No adventure ID provided");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const data = MOCK_ADVENTURES[id];
      if (data) {
        // Check for saved narrative
        const savedNarrative = await AsyncStorage.getItem(`narrative_${id}`);
        if (savedNarrative) {
          data.narrative = savedNarrative;
        }
        setAdventure(data);
      } else {
        setError("Adventure not found");
      }
    } catch (err) {
      setError("Failed to load adventure");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAdventure();
  }, [fetchAdventure]);

  const updateNarrative = useCallback(
    async (narrative: string) => {
      if (!id || !adventure) return;

      try {
        await AsyncStorage.setItem(`narrative_${id}`, narrative);
        setAdventure({ ...adventure, narrative });
      } catch (err) {
        console.error("Failed to save narrative:", err);
      }
    },
    [id, adventure]
  );

  return {
    adventure,
    loading,
    error,
    refresh: fetchAdventure,
    updateNarrative,
  };
}