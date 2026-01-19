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

export interface AdventureFilters {
  dateRange: { start: Date; end: Date } | null;
  country: string | null;
  minDistance: number;
}

export interface ImmichConnection {
  serverUrl: string;
  apiKey: string;
  isConnected: boolean;
}