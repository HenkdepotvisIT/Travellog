import axios, { AxiosInstance } from "axios";
import { MediaItem, ProxyHeader } from "../types";

class ImmichApi {
  private client: AxiosInstance | null = null;
  private baseUrl: string = "";
  private apiKey: string = "";
  private proxyHeaders: ProxyHeader[] = [];

  configure(baseUrl: string, apiKey: string, proxyHeaders: ProxyHeader[] = []) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.apiKey = apiKey;
    this.proxyHeaders = proxyHeaders;

    if (baseUrl && apiKey) {
      // Build custom headers from proxy headers
      const customHeaders: Record<string, string> = {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      };

      // Add enabled proxy headers
      proxyHeaders
        .filter((h) => h.enabled && h.key && h.value)
        .forEach((h) => {
          customHeaders[h.key] = h.value;
        });

      this.client = axios.create({
        baseURL: `${this.baseUrl}/api`,
        headers: customHeaders,
        timeout: 60000, // Increased timeout for large libraries
      });
    } else {
      this.client = null;
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  updateProxyHeaders(proxyHeaders: ProxyHeader[]) {
    this.proxyHeaders = proxyHeaders;
    if (this.baseUrl && this.apiKey) {
      this.configure(this.baseUrl, this.apiKey, proxyHeaders);
    }
  }

  async validateConnection(): Promise<boolean> {
    if (!this.client) return false;

    try {
      const response = await this.client.get("/server-info/ping");
      return response.data?.res === "pong";
    } catch (error) {
      console.error("Connection validation failed:", error);
      return false;
    }
  }

  async getServerInfo(): Promise<any> {
    if (!this.client) throw new Error("Not configured");

    const response = await this.client.get("/server-info/version");
    return response.data;
  }

  async getServerStats(): Promise<{ photos: number; videos: number; usage: number }> {
    if (!this.client) throw new Error("Not configured");

    try {
      const response = await this.client.get("/server-info/statistics");
      return {
        photos: response.data?.photos || 0,
        videos: response.data?.videos || 0,
        usage: response.data?.usage || 0,
      };
    } catch (error) {
      console.error("Failed to get server stats:", error);
      return { photos: 0, videos: 0, usage: 0 };
    }
  }

  async getAllAssets(onProgress?: (current: number, total: number) => void): Promise<MediaItem[]> {
    if (!this.client) throw new Error("Not configured");

    const allMedia: MediaItem[] = [];
    let page = 1;
    const pageSize = 1000;
    let hasMore = true;
    let totalEstimate = 0;

    // Get total count estimate
    try {
      const stats = await this.getServerStats();
      totalEstimate = stats.photos + stats.videos;
    } catch (e) {
      // Ignore, we'll just not show progress
    }

    console.log(`Starting to fetch assets from Immich (estimated: ${totalEstimate})`);

    while (hasMore) {
      try {
        // Use the search endpoint for better pagination
        const response = await this.client.post("/search/metadata", {
          page,
          size: pageSize,
          order: "desc",
          orderBy: "fileCreatedAt",
        });

        const assets = response.data?.assets?.items || response.data || [];
        
        if (Array.isArray(assets)) {
          const mediaItems = assets.map((asset: any) => this.mapAssetToMediaItem(asset));
          allMedia.push(...mediaItems);
          
          if (onProgress) {
            onProgress(allMedia.length, totalEstimate || allMedia.length);
          }

          console.log(`Fetched page ${page}: ${assets.length} assets (total: ${allMedia.length})`);

          if (assets.length < pageSize) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }

        // Safety limit to prevent infinite loops
        if (page > 500) {
          console.warn("Reached page limit, stopping fetch");
          break;
        }
      } catch (error: any) {
        // Try alternative endpoint if search fails
        if (page === 1) {
          console.log("Search endpoint failed, trying asset endpoint...");
          return this.getAllAssetsLegacy(onProgress);
        }
        console.error(`Error fetching page ${page}:`, error.message);
        hasMore = false;
      }
    }

    console.log(`Finished fetching ${allMedia.length} total assets`);
    return allMedia;
  }

  // Fallback method using the older asset endpoint
  private async getAllAssetsLegacy(onProgress?: (current: number, total: number) => void): Promise<MediaItem[]> {
    if (!this.client) throw new Error("Not configured");

    const allMedia: MediaItem[] = [];
    let page = 1;
    const pageSize = 500;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await this.client.get("/asset", {
          params: {
            page,
            size: pageSize,
            order: "desc",
          },
        });

        const assets = Array.isArray(response.data) ? response.data : [];
        const mediaItems = assets.map((asset: any) => this.mapAssetToMediaItem(asset));
        allMedia.push(...mediaItems);

        if (onProgress) {
          onProgress(allMedia.length, allMedia.length);
        }

        console.log(`Fetched page ${page}: ${assets.length} assets (total: ${allMedia.length})`);

        if (assets.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }

        if (page > 200) break;
      } catch (error: any) {
        console.error(`Error fetching page ${page}:`, error.message);
        hasMore = false;
      }
    }

    return allMedia;
  }

  private mapAssetToMediaItem(asset: any): MediaItem {
    return {
      id: asset.id,
      type: asset.type === "VIDEO" ? "VIDEO" : "IMAGE",
      originalPath: asset.originalPath || "",
      thumbnailPath: asset.thumbnailPath || "",
      createdAt: asset.fileCreatedAt || asset.createdAt || new Date().toISOString(),
      modifiedAt: asset.fileModifiedAt || asset.modifiedAt || new Date().toISOString(),
      duration: asset.duration || undefined,
      exifInfo: asset.exifInfo
        ? {
            latitude: asset.exifInfo.latitude || null,
            longitude: asset.exifInfo.longitude || null,
            city: asset.exifInfo.city || null,
            state: asset.exifInfo.state || null,
            country: asset.exifInfo.country || null,
            dateTimeOriginal: asset.exifInfo.dateTimeOriginal || null,
          }
        : null,
    };
  }

  async getMediaWithLocation(onProgress?: (current: number, total: number) => void): Promise<MediaItem[]> {
    const allMedia = await this.getAllAssets(onProgress);
    
    // Filter to only items with GPS coordinates
    const withLocation = allMedia.filter(
      (m) => m.exifInfo?.latitude && m.exifInfo?.longitude &&
             m.exifInfo.latitude !== 0 && m.exifInfo.longitude !== 0
    );

    console.log(`Found ${withLocation.length} assets with GPS data out of ${allMedia.length} total`);
    return withLocation;
  }

  // Get thumbnail URL - this is a LIVE reference, not a copy
  getThumbnailUrl(assetId: string): string {
    if (!this.baseUrl || !this.apiKey) return "";
    return `${this.baseUrl}/api/asset/thumbnail/${assetId}?format=WEBP&size=preview`;
  }

  // Get full image URL - this is a LIVE reference, not a copy
  getFullImageUrl(assetId: string): string {
    if (!this.baseUrl || !this.apiKey) return "";
    return `${this.baseUrl}/api/asset/file/${assetId}`;
  }

  // Get image URL with API key for direct access
  getAuthenticatedImageUrl(assetId: string, thumbnail: boolean = true): string {
    if (!this.baseUrl || !this.apiKey) return "";
    const endpoint = thumbnail 
      ? `/api/asset/thumbnail/${assetId}?format=WEBP&size=preview`
      : `/api/asset/file/${assetId}`;
    return `${this.baseUrl}${endpoint}`;
  }

  // Get headers needed for authenticated image requests
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "x-api-key": this.apiKey,
    };
    
    this.proxyHeaders
      .filter((h) => h.enabled && h.key && h.value)
      .forEach((h) => {
        headers[h.key] = h.value;
      });
    
    return headers;
  }

  getProxyHeaders(): ProxyHeader[] {
    return this.proxyHeaders;
  }

  isConfigured(): boolean {
    return !!this.client && !!this.baseUrl && !!this.apiKey;
  }
}

export const immichApi = new ImmichApi();