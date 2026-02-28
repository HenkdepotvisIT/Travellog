import { useState, useEffect, useCallback } from "react";
import { storageService } from "../services/storageService";
import { immichApi } from "../services/immichApi";
import { AppSettings, ProxyHeader } from "../types";

const DEFAULT_SETTINGS: AppSettings = {
  clusterTimeWindow: 24,
  clusterDistanceKm: 50,
  minPhotosPerAdventure: 5,
  showRouteLines: true,
  autoGenerateSummaries: true,
  theme: "dark",
  mapStyle: "default",
  defaultView: "map",
  proxyHeaders: [],
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await storageService.getSettings();
      if (stored) {
        const mergedSettings = { ...DEFAULT_SETTINGS, ...stored };
        setSettings(mergedSettings);
        
        // Update Immich API with proxy headers
        if (mergedSettings.proxyHeaders) {
          immichApi.updateProxyHeaders(mergedSettings.proxyHeaders);
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = useCallback(
    async (updates: Partial<AppSettings>) => {
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);

      try {
        await storageService.saveSettings(newSettings);
        
        // Update Immich API if proxy headers changed
        if (updates.proxyHeaders) {
          immichApi.updateProxyHeaders(updates.proxyHeaders);
        }
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    },
    [settings]
  );

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      await storageService.saveSettings(DEFAULT_SETTINGS);
      immichApi.updateProxyHeaders([]);
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  }, []);

  // Proxy header management helpers
  const addProxyHeader = useCallback(async () => {
    const newHeader: ProxyHeader = {
      id: `header_${Date.now()}`,
      key: "",
      value: "",
      enabled: true,
    };
    const newHeaders = [...(settings.proxyHeaders || []), newHeader];
    await updateSettings({ proxyHeaders: newHeaders });
    return newHeader;
  }, [settings.proxyHeaders, updateSettings]);

  const updateProxyHeader = useCallback(
    async (id: string, updates: Partial<ProxyHeader>) => {
      const newHeaders = (settings.proxyHeaders || []).map((h) =>
        h.id === id ? { ...h, ...updates } : h
      );
      await updateSettings({ proxyHeaders: newHeaders });
    },
    [settings.proxyHeaders, updateSettings]
  );

  const deleteProxyHeader = useCallback(
    async (id: string) => {
      const newHeaders = (settings.proxyHeaders || []).filter((h) => h.id !== id);
      await updateSettings({ proxyHeaders: newHeaders });
    },
    [settings.proxyHeaders, updateSettings]
  );

  const toggleProxyHeader = useCallback(
    async (id: string) => {
      const header = (settings.proxyHeaders || []).find((h) => h.id === id);
      if (header) {
        await updateProxyHeader(id, { enabled: !header.enabled });
      }
    },
    [settings.proxyHeaders, updateProxyHeader]
  );

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
    addProxyHeader,
    updateProxyHeader,
    deleteProxyHeader,
    toggleProxyHeader,
    DEFAULT_SETTINGS,
  };
}