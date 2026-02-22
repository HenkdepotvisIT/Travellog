import { useState, useCallback } from "react";
import { Share, Platform } from "react-native";
import { storageService } from "../services/storageService";

export function useDataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exportData = useCallback(async () => {
    setIsExporting(true);
    setError(null);

    try {
      const jsonData = await storageService.exportAllData();
      
      if (Platform.OS === "web") {
        // Web: Download as file
        const blob = new Blob([jsonData], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `travel-log-backup-${new Date().toISOString().split("T")[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        // Native: Share or save to file
        const { Paths, File } = await import("expo-file-system");
        const fileName = `travel-log-backup-${new Date().toISOString().split("T")[0]}.json`;
        const file = new File(Paths.document, fileName);
        file.write(jsonData);

        await Share.share({
          title: "Travel Log Backup",
          message: "Here's your Travel Log backup",
          url: file.uri,
        });
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Export failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsExporting(false);
    }
  }, []);

  const importData = useCallback(async (jsonString: string) => {
    setIsImporting(true);
    setError(null);

    try {
      await storageService.importData(jsonString);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Import failed";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsImporting(false);
    }
  }, []);

  const clearAllData = useCallback(async () => {
    try {
      await storageService.clearAllData();
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Clear failed";
      setError(message);
      return { success: false, error: message };
    }
  }, []);

  return {
    exportData,
    importData,
    clearAllData,
    isExporting,
    isImporting,
    error,
  };
}