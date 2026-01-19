export interface Coordinates {
  lat: number;
  lng: number;
}

export interface StopPoint extends Coordinates {
  name: string;
  photos: number;
}

export interface Adventure {
  id: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  coverPhoto: string;
  mediaCount: number;
  distance: number;
  duration: number;
  stops: number;
  coordinates: Coordinates;
  route: Coordinates[];
  stopPoints: StopPoint[];
  photos: string[];
  narrative: string;
  aiSummary: string;
  highlights: string[];
  isFavorite?: boolean;
  isHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaItem {
  id: string;
  type: "IMAGE" | "VIDEO";
  originalPath: string;
  thumbnailPath: string;
  createdAt: string;
  modifiedAt: string;
  duration?: string;
  exifInfo: {
    latitude?: number;
    longitude?: number;
    city?: string;
    state?: string;
    country?: string;
    dateTimeOriginal?: string;
  } | null;
}

export interface ProxyHeader {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface AdventureFilters {
  dateRange: { start: Date; end: Date } | null;
  country: string | null;
  minDistance: number;
  showFavoritesOnly?: boolean;
  showHidden?: boolean;
}

export interface ImmichConnection {
  serverUrl: string;
  apiKey: string;
  isConnected: boolean;
}

export interface AppSettings {
  clusterTimeWindow: number;
  clusterDistanceKm: number;
  minPhotosPerAdventure: number;
  showRouteLines: boolean;
  autoGenerateSummaries: boolean;
  theme?: "dark" | "light" | "system";
  mapStyle?: string;
  defaultView?: "map" | "timeline";
  proxyHeaders?: ProxyHeader[];
}

export interface SyncStatus {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  error: string | null;
}