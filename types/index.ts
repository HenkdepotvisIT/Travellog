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
  photos: string[]; // Live URLs to Immich thumbnails
  narrative: string;
  aiSummary: string;
  highlights: string[];
  isFavorite?: boolean;
  isHidden?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Internal: Store photo IDs for regenerating URLs
  _photoIds?: string[];
  _coverPhotoId?: string;
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
    latitude?: number | null;
    longitude?: number | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
    dateTimeOriginal?: string | null;
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
  syncProgress?: {
    phase: "fetching" | "clustering" | "saving" | "done";
    current: number;
    total: number;
    message: string;
  };
  error: string | null;
}

export interface SyncResult {
  success: boolean;
  adventuresCreated: number;
  adventuresUpdated: number;
  photosProcessed: number;
  photosWithGps: number;
  error?: string;
}