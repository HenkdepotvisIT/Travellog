import { useState, useEffect, useCallback } from "react";
import { storageService } from "../services/storageService";
import { immichApi } from "../services/immichApi";

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
      const connection = await storageService.getConnection();

      if (connection.serverUrl && connection.apiKey && connection.isConnected) {
        setServerUrl(connection.serverUrl);
        setApiKey(connection.apiKey);
        setIsConnected(true);
        immichApi.configure(connection.serverUrl, connection.apiKey);
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
        await storageService.saveConnection(url, key);

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
      await storageService.clearConnection();

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
      immichApi.configure(url, key);
      const isValid = await immichApi.validateConnection();
      
      // Restore previous connection if we were connected
      if (!isValid && isConnected && serverUrl && apiKey) {
        immichApi.configure(serverUrl, apiKey);
      }

      return {
        success: isValid,
        message: isValid ? "Connection successful!" : "Could not connect to server",
      };
    } catch (error) {
      // Restore previous connection
      if (isConnected && serverUrl && apiKey) {
        immichApi.configure(serverUrl, apiKey);
      }
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