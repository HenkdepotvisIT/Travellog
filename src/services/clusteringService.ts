import { MediaItem, Adventure, Coordinates, StopPoint } from "../types";
import { format, differenceInHours, differenceInDays, parseISO } from "date-fns";
import { immichApi } from "./immichApi";

export interface ClusterConfig {
  timeWindowHours: number;
  distanceThresholdKm: number;
  minPhotos: number;
}

export const DEFAULT_CLUSTER_CONFIG: ClusterConfig = {
  timeWindowHours: 24,
  distanceThresholdKm: 50,
  minPhotos: 5,
};

// Haversine formula to calculate distance between two GPS coordinates
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Get the most common country from media items
function getCountryFromMedia(media: MediaItem[]): string {
  const countries = media
    .map((m) => m.exifInfo?.country)
    .filter(Boolean) as string[];

  if (countries.length === 0) return "Unknown Location";

  const countryCount: Record<string, number> = {};
  countries.forEach((c) => {
    countryCount[c] = (countryCount[c] || 0) + 1;
  });

  return Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0][0];
}

// Get unique cities from media items
function getCitiesFromMedia(media: MediaItem[]): string[] {
  const cities = media
    .map((m) => m.exifInfo?.city)
    .filter(Boolean) as string[];

  return [...new Set(cities)];
}

// Generate a descriptive title for the adventure
function generateAdventureTitle(media: MediaItem[], country: string): string {
  const cities = getCitiesFromMedia(media);
  const uniqueCities = cities.slice(0, 3);

  if (uniqueCities.length > 2) {
    return `${uniqueCities[0]} to ${uniqueCities[uniqueCities.length - 1]} Journey`;
  } else if (uniqueCities.length > 0) {
    return `${uniqueCities.join(" & ")} Adventure`;
  }

  return `${country} Adventure`;
}

// Calculate total route distance
function calculateTotalDistance(route: Coordinates[]): number {
  let total = 0;
  for (let i = 1; i < route.length; i++) {
    total += haversineDistance(
      route[i - 1].lat,
      route[i - 1].lng,
      route[i].lat,
      route[i].lng
    );
  }
  return Math.round(total);
}

// Generate a unique ID for an adventure based on its content
function generateAdventureId(media: MediaItem[], index: number): string {
  const firstPhoto = media[0];
  const dateStr = firstPhoto.createdAt.split("T")[0].replace(/-/g, "");
  return `adventure_${dateStr}_${index}`;
}

// Main clustering function - groups photos into adventures
export function clusterMediaIntoAdventures(
  media: MediaItem[],
  config: ClusterConfig = DEFAULT_CLUSTER_CONFIG
): Adventure[] {
  if (media.length === 0) return [];

  console.log(`Clustering ${media.length} photos with config:`, config);

  // Sort by date (oldest first for chronological clustering)
  const sorted = [...media].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const clusters: MediaItem[][] = [];
  let currentCluster: MediaItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];

    const currentDate = new Date(current.createdAt);
    const previousDate = new Date(previous.createdAt);
    const timeDiff = differenceInHours(currentDate, previousDate);

    // Calculate distance if both have GPS
    let distance = 0;
    if (
      current.exifInfo?.latitude &&
      current.exifInfo?.longitude &&
      previous.exifInfo?.latitude &&
      previous.exifInfo?.longitude
    ) {
      distance = haversineDistance(
        previous.exifInfo.latitude,
        previous.exifInfo.longitude,
        current.exifInfo.latitude,
        current.exifInfo.longitude
      );
    }

    // Check if this photo belongs to the current cluster
    const sameTimeWindow = timeDiff <= config.timeWindowHours;
    const sameArea = distance <= config.distanceThresholdKm;

    if (sameTimeWindow && sameArea) {
      currentCluster.push(current);
    } else {
      // Save current cluster if it meets minimum size
      if (currentCluster.length >= config.minPhotos) {
        clusters.push(currentCluster);
      }
      // Start new cluster
      currentCluster = [current];
    }
  }

  // Don't forget the last cluster
  if (currentCluster.length >= config.minPhotos) {
    clusters.push(currentCluster);
  }

  console.log(`Created ${clusters.length} clusters from ${media.length} photos`);

  // Convert clusters to adventures
  return clusters.map((cluster, index) => {
    return createAdventureFromCluster(cluster, index);
  });
}

// Create an Adventure object from a cluster of photos
function createAdventureFromCluster(cluster: MediaItem[], index: number): Adventure {
  // Sort cluster by date
  const sortedCluster = [...cluster].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const startDate = new Date(sortedCluster[0].createdAt);
  const endDate = new Date(sortedCluster[sortedCluster.length - 1].createdAt);
  const country = getCountryFromMedia(sortedCluster);

  // Build route from GPS coordinates (deduplicated and ordered)
  const route: Coordinates[] = [];
  const seenCoords = new Set<string>();
  
  sortedCluster.forEach((m) => {
    if (m.exifInfo?.latitude && m.exifInfo?.longitude) {
      // Round to reduce duplicates from nearby photos
      const lat = Math.round(m.exifInfo.latitude * 1000) / 1000;
      const lng = Math.round(m.exifInfo.longitude * 1000) / 1000;
      const key = `${lat},${lng}`;
      
      if (!seenCoords.has(key)) {
        seenCoords.add(key);
        route.push({ lat: m.exifInfo.latitude, lng: m.exifInfo.longitude });
      }
    }
  });

  // Group stops by city with photo counts
  const stopMap: Record<string, { coords: Coordinates; photos: number; firstDate: Date }> = {};
  
  sortedCluster.forEach((m) => {
    if (m.exifInfo?.latitude && m.exifInfo?.longitude) {
      const city = m.exifInfo.city || m.exifInfo.state || "Unknown";
      
      if (!stopMap[city]) {
        stopMap[city] = {
          coords: { lat: m.exifInfo.latitude, lng: m.exifInfo.longitude },
          photos: 0,
          firstDate: new Date(m.createdAt),
        };
      }
      stopMap[city].photos++;
    }
  });

  // Convert to stop points array, sorted by first visit date
  const stopPoints: StopPoint[] = Object.entries(stopMap)
    .sort((a, b) => a[1].firstDate.getTime() - b[1].firstDate.getTime())
    .map(([name, data]) => ({
      ...data.coords,
      name,
      photos: data.photos,
    }));

  // Get photo IDs for live Immich URLs (NOT copying photos!)
  const photoIds = sortedCluster.map((m) => m.id);
  
  // Generate live thumbnail URLs from Immich
  const photos = photoIds.slice(0, 20).map((id) => immichApi.getThumbnailUrl(id));
  
  // Use first photo as cover
  const coverPhotoId = sortedCluster[0].id;
  const coverPhoto = immichApi.getThumbnailUrl(coverPhotoId);

  // Calculate duration in days
  const duration = Math.max(1, differenceInDays(endDate, startDate) + 1);

  const adventure: Adventure = {
    id: generateAdventureId(sortedCluster, index),
    title: generateAdventureTitle(sortedCluster, country),
    location: country,
    startDate: format(startDate, "MMM d, yyyy"),
    endDate: format(endDate, "MMM d, yyyy"),
    coverPhoto,
    mediaCount: sortedCluster.length,
    distance: calculateTotalDistance(route),
    duration,
    stops: stopPoints.length,
    coordinates: route[0] || { lat: 0, lng: 0 },
    route,
    stopPoints,
    photos, // These are LIVE URLs to Immich, not copied files!
    narrative: "",
    aiSummary: "",
    highlights: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    // Store photo IDs for future reference (to regenerate URLs if needed)
    _photoIds: photoIds,
    _coverPhotoId: coverPhotoId,
  };

  return adventure;
}

// Merge new adventures with existing ones (avoid duplicates)
export function mergeAdventures(
  existing: Adventure[],
  newAdventures: Adventure[]
): Adventure[] {
  const merged = [...existing];
  
  for (const newAdv of newAdventures) {
    // Check if we already have an adventure with similar dates and location
    const existingIndex = merged.findIndex((e) => {
      const sameLocation = e.location === newAdv.location;
      const sameStartDate = e.startDate === newAdv.startDate;
      const similarPhotoCount = Math.abs(e.mediaCount - newAdv.mediaCount) < 10;
      return sameLocation && sameStartDate && similarPhotoCount;
    });

    if (existingIndex >= 0) {
      // Update existing adventure but preserve user customizations
      const existing = merged[existingIndex];
      merged[existingIndex] = {
        ...newAdv,
        id: existing.id, // Keep original ID
        narrative: existing.narrative || newAdv.narrative,
        aiSummary: existing.aiSummary || newAdv.aiSummary,
        highlights: existing.highlights?.length ? existing.highlights : newAdv.highlights,
        isFavorite: existing.isFavorite,
        isHidden: existing.isHidden,
        updatedAt: new Date().toISOString(),
      };
    } else {
      // Add as new adventure
      merged.push(newAdv);
    }
  }

  // Sort by start date (newest first)
  return merged.sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateB.getTime() - dateA.getTime();
  });
}

// Regenerate photo URLs for an adventure (useful if Immich URL changes)
export function regeneratePhotoUrls(adventure: Adventure): Adventure {
  const photoIds = (adventure as any)._photoIds || [];
  const coverPhotoId = (adventure as any)._coverPhotoId;

  return {
    ...adventure,
    photos: photoIds.slice(0, 20).map((id: string) => immichApi.getThumbnailUrl(id)),
    coverPhoto: coverPhotoId ? immichApi.getThumbnailUrl(coverPhotoId) : adventure.coverPhoto,
  };
}