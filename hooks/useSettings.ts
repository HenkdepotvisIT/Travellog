import { useState, useEffect, useCallback } from "react";
import { storageService } from "../services/storageService";
import { AppSettings } from "../types";

const DEFAULT_SETTINGS: AppSettings = {
  clusterTimeWindow: 24,
  clusterDistanceKm: 50,
  minPhotosPerAdventure: 5,
  showRouteLines: true,
  autoGenerateSummaries: true,
  theme: "dark",
  mapStyle: "default",
  defaultView: "map",
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
        setSettings({ ...DEFAULT_SETTINGS, ...stored });
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
    } catch (error) {
      console.error("Failed to reset settings:", error);
    }
  }, []);

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
  };
}