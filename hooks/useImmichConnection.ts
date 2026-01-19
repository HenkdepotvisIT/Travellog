import { useState, useEffect, useCallback } from "react";
import { storageService } from "../services/storageService";
import { immichApi } from "../services/immichApi";
import { ProxyHeader } from "../types";

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
      const settings = await storageService.getSettings();
      const proxyHeaders = settings?.proxyHeaders || [];

      if (connection.serverUrl && connection.apiKey && connection.isConnected) {
        setServerUrl(connection.serverUrl);
        setApiKey(connection.apiKey);
        setIsConnected(true);
        immichApi.configure(connection.serverUrl, connection.apiKey, proxyHeaders);
      }
    } catch (error) {
      console.error("Failed to load stored connection:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const connect = useCallback(async (url: string, key: string, proxyHeaders?: ProxyHeader[]) => {
    try {
      // Get proxy headers from settings if not provided
      let headers = proxyHeaders;
      if (!headers) {
        const settings = await storageService.getSettings();
        headers = settings?.proxyHeaders || [];
      }

      immichApi.configure(url, key, headers);
      const isValid = await immichApi.validateConnection();

      if (isValid) {
        await storageService.saveConnection(url, key);

        setServerUrl(url);
        setApiKey(key);
        setIsConnected(true);
        return { success: true, message: "Connected successfully" };
      } else {
        return { success: false, message: "Invalid credentials or server unreachable" };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Connection failed";
      return { success: false, message };
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      await storageService.clearConnection();

      setServerUrl(null);
      setApiKey(null);
      setIsConnected(false);
      immichApi.configure("", "", []);
    } catch (error) {
      console.error("Failed to disconnect:", error);
    }
  }, []);

  const testConnection = useCallback(async (url: string, key: string, proxyHeaders?: ProxyHeader[]) => {
    try {
      // Get proxy headers from settings if not provided
      let headers = proxyHeaders;
      if (!headers) {
        const settings = await storageService.getSettings();
        headers = settings?.proxyHeaders || [];
      }

      immichApi.configure(url, key, headers);
      const isValid = await immichApi.validateConnection();
      
      // Restore previous connection if we were connected
      if (!isValid && isConnected && serverUrl && apiKey) {
        const settings = await storageService.getSettings();
        immichApi.configure(serverUrl, apiKey, settings?.proxyHeaders || []);
      }

      return {
        success: isValid,
        message: isValid ? "Connection successful!" : "Could not connect to server",
      };
    } catch (error) {
      // Restore previous connection
      if (isConnected && serverUrl && apiKey) {
        const settings = await storageService.getSettings();
        immichApi.configure(serverUrl, apiKey, settings?.proxyHeaders || []);
      }
      const message = error instanceof Error ? error.message : "Connection test failed";
      return {
        success: false,
        message,
      };
    }
  }, [isConnected, serverUrl, apiKey]);

  const reconnectWithHeaders = useCallback(async () => {
    if (serverUrl && apiKey) {
      const settings = await storageService.getSettings();
      immichApi.configure(serverUrl, apiKey, settings?.proxyHeaders || []);
    }
  }, [serverUrl, apiKey]);

  return {
    isConnected,
    serverUrl,
    apiKey,
    isLoading,
    connect,
    disconnect,
    testConnection,
    reconnectWithHeaders,
  };
}