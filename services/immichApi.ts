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
        timeout: 30000,
      });
    } else {
      this.client = null;
    }
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

  async getAllMedia(page: number = 1, pageSize: number = 100): Promise<MediaItem[]> {
    if (!this.client) throw new Error("Not configured");

    try {
      const response = await this.client.get("/asset", {
        params: {
          page,
          size: pageSize,
          order: "desc",
        },
      });

      return response.data.map((asset: any) => ({
        id: asset.id,
        type: asset.type,
        originalPath: asset.originalPath,
        thumbnailPath: asset.thumbnailPath,
        createdAt: asset.fileCreatedAt,
        modifiedAt: asset.fileModifiedAt,
        duration: asset.duration,
        exifInfo: asset.exifInfo
          ? {
              latitude: asset.exifInfo.latitude,
              longitude: asset.exifInfo.longitude,
              city: asset.exifInfo.city,
              state: asset.exifInfo.state,
              country: asset.exifInfo.country,
              dateTimeOriginal: asset.exifInfo.dateTimeOriginal,
            }
          : null,
      }));
    } catch (error) {
      console.error("Failed to fetch media:", error);
      throw error;
    }
  }

  async getMediaWithLocation(): Promise<MediaItem[]> {
    if (!this.client) throw new Error("Not configured");

    const allMedia: MediaItem[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const media = await this.getAllMedia(page, 500);
      const withLocation = media.filter(
        (m) => m.exifInfo?.latitude && m.exifInfo?.longitude
      );
      allMedia.push(...withLocation);

      if (media.length < 500) {
        hasMore = false;
      } else {
        page++;
      }

      // Safety limit
      if (page > 100) break;
    }

    return allMedia;
  }

  getThumbnailUrl(assetId: string): string {
    return `${this.baseUrl}/api/asset/thumbnail/${assetId}?format=WEBP&size=preview`;
  }

  getFullImageUrl(assetId: string): string {
    return `${this.baseUrl}/api/asset/file/${assetId}`;
  }

  getProxyHeaders(): ProxyHeader[] {
    return this.proxyHeaders;
  }
}

export const immichApi = new ImmichApi();