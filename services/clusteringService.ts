import { MediaItem, Adventure, Coordinates } from "../types";
import { format, differenceInHours, differenceInDays } from "date-fns";

interface ClusterConfig {
  timeWindowHours: number;
  distanceThresholdKm: number;
  minPhotos: number;
}

const DEFAULT_CONFIG: ClusterConfig = {
  timeWindowHours: 24,
  distanceThresholdKm: 50,
  minPhotos: 5,
};

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

function getCountryFromMedia(media: MediaItem[]): string {
  const countries = media
    .map((m) => m.exifInfo?.country)
    .filter(Boolean) as string[];

  if (countries.length === 0) return "Unknown";

  const countryCount: Record<string, number> = {};
  countries.forEach((c) => {
    countryCount[c] = (countryCount[c] || 0) + 1;
  });

  return Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0][0];
}

function generateAdventureTitle(media: MediaItem[], country: string): string {
  const cities = media
    .map((m) => m.exifInfo?.city)
    .filter(Boolean) as string[];

  const uniqueCities = [...new Set(cities)].slice(0, 3);

  if (uniqueCities.length > 0) {
    return `${uniqueCities.join(", ")} Adventure`;
  }

  return `${country} Adventure`;
}

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

export function clusterMediaIntoAdventures(
  media: MediaItem[],
  config: ClusterConfig = DEFAULT_CONFIG
): Adventure[] {
  if (media.length === 0) return [];

  // Sort by date
  const sorted = [...media].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const clusters: MediaItem[][] = [];
  let currentCluster: MediaItem[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const previous = sorted[i - 1];

    const timeDiff = differenceInHours(
      new Date(current.createdAt),
      new Date(previous.createdAt)
    );

    const distance =
      current.exifInfo && previous.exifInfo
        ? haversineDistance(
            previous.exifInfo.latitude!,
            previous.exifInfo.longitude!,
            current.exifInfo.latitude!,
            current.exifInfo.longitude!
          )
        : 0;

    if (
      timeDiff <= config.timeWindowHours &&
      distance <= config.distanceThresholdKm
    ) {
      currentCluster.push(current);
    } else {
      if (currentCluster.length >= config.minPhotos) {
        clusters.push(currentCluster);
      }
      currentCluster = [current];
    }
  }

  if (currentCluster.length >= config.minPhotos) {
    clusters.push(currentCluster);
  }

  // Convert clusters to adventures
  return clusters.map((cluster, index) => {
    const startDate = new Date(cluster[0].createdAt);
    const endDate = new Date(cluster[cluster.length - 1].createdAt);
    const country = getCountryFromMedia(cluster);

    const route: Coordinates[] = cluster
      .filter((m) => m.exifInfo?.latitude && m.exifInfo?.longitude)
      .map((m) => ({
        lat: m.exifInfo!.latitude!,
        lng: m.exifInfo!.longitude!,
      }));

    // Group stops by city
    const stopMap: Record<string, { coords: Coordinates; photos: number }> = {};
    cluster.forEach((m) => {
      if (m.exifInfo?.city && m.exifInfo.latitude && m.exifInfo.longitude) {
        const city = m.exifInfo.city;
        if (!stopMap[city]) {
          stopMap[city] = {
            coords: { lat: m.exifInfo.latitude, lng: m.exifInfo.longitude },
            photos: 0,
          };
        }
        stopMap[city].photos++;
      }
    });

    const stopPoints = Object.entries(stopMap).map(([name, data]) => ({
      ...data.coords,
      name,
      photos: data.photos,
    }));

    return {
      id: `adventure_${index + 1}`,
      title: generateAdventureTitle(cluster, country),
      location: country,
      startDate: format(startDate, "MMM d, yyyy"),
      endDate: format(endDate, "MMM d, yyyy"),
      coverPhoto: "", // Would be set from actual media
      mediaCount: cluster.length,
      distance: calculateTotalDistance(route),
      duration: differenceInDays(endDate, startDate) + 1,
      stops: stopPoints.length,
      coordinates: route[0] || { lat: 0, lng: 0 },
      route,
      stopPoints,
      photos: [], // Would be populated with actual URLs
      narrative: "",
      aiSummary: "",
      highlights: [],
    };
  });
}