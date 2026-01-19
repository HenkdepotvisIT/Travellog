import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AppSettings {
  clusterTimeWindow: number;
  clusterDistanceKm: number;
  minPhotosPerAdventure: number;
  showRouteLines: boolean;
  autoGenerateSummaries: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  clusterTimeWindow: 24,
  clusterDistanceKm: 50,
  minPhotosPerAdventure: 5,
  showRouteLines: true,
  autoGenerateSummaries: true,
};

const STORAGE_KEY = "app_settings";

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
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
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error("Failed to save settings:", error);
      }
    },
    [settings]
  );

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
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