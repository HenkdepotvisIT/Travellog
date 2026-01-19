import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { immichApi } from "../services/immichApi";

const STORAGE_KEYS = {
  SERVER_URL: "immich_server_url",
  API_KEY: "immich_api_key",
  IS_CONNECTED: "immich_is_connected",
};

export function useImmichConnection() {
  const [isConnected, setIsConnected] = useState(false);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredConnection();
  }, []);

  const loadStoredConnection = async () => {
    try {
      const [storedUrl, storedKey, storedConnected] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SERVER_URL),
        AsyncStorage.getItem(STORAGE_KEYS.API_KEY),
        AsyncStorage.getItem(STORAGE_KEYS.IS_CONNECTED),
      ]);

      if (storedUrl && storedKey && storedConnected === "true") {
        setServerUrl(storedUrl);
        setApiKey(storedKey);
        setIsConnected(true);
        immichApi.configure(storedUrl, storedKey);
      }
    } catch (error) {
      console.error("Failed to load stored connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connect = useCallback(async (url: string, key: string) => {
    try {
      immichApi.configure(url, key);
      const isValid = await immichApi.validateConnection();

      if (isValid) {
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.SERVER_URL, url),
          AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key),
          AsyncStorage.setItem(STORAGE_KEYS.IS_CONNECTED, "true"),
        ]);

        setServerUrl(url);
        setApiKey(key);
        setIsConnected(true);
        return { success: true, message: "Connected successfully" };
      } else {
        return { success: false, message: "Invalid credentials" };
      }
    } catch (error) {
      return { success: false, message: "Connection failed" };
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.SERVER_URL),
        AsyncStorage.removeItem(STORAGE_KEYS.API_KEY),
        AsyncStorage.setItem(STORAGE_KEYS.IS_CONNECTED, "false"),
      ]);

      setServerUrl(null);
      setApiKey(null);
      setIsConnected(false);
      immichApi.configure("", "");
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, []);

  const testConnection = useCallback(async (url: string, key: string) => {
    try {
      const tempApi = { ...immichApi };
      immichApi.configure(url, key);
      const isValid = await immichApi.validateConnection();
      
      if (!isConnected && serverUrl && apiKey) {
        immichApi.configure(serverUrl, apiKey);
      }

      return {
        success: isValid,
        message: isValid ? "Connection successful!" : "Could not connect to server",
      };
    } catch (error) {
      return {
        success: false,
        message: "Connection test failed",
      };
    }
  }, [isConnected, serverUrl, apiKey]);

  return {
    isConnected,
    serverUrl,
    apiKey,
    isLoading,
    connect,
    disconnect,
    testConnection,
  };
}