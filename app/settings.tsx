import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useImmichConnection } from "../hooks/useImmichConnection";
import { useSettings } from "../hooks/useSettings";
import { useDataExport } from "../hooks/useDataExport";
import { useAdventures } from "../hooks/useAdventures";
import { storageService } from "../services/storageService";

export default function SettingsScreen() {
  const { isConnected, serverUrl, apiKey, connect, disconnect, testConnection } =
    useImmichConnection();
  const { settings, updateSettings, resetSettings } = useSettings();
  const { exportData, importData, clearAllData, isExporting, isImporting } = useDataExport();
  const { syncStatus, syncWithImmich } = useAdventures({ dateRange: null, country: null, minDistance: 0 });

  const [newServerUrl, setNewServerUrl] = useState(serverUrl || "");
  const [newApiKey, setNewApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (serverUrl) {
      setNewServerUrl(serverUrl);
    }
  }, [serverUrl]);

  const handleTestConnection = async () => {
    if (!newServerUrl) {
      Alert.alert("Error", "Please enter a server URL");
      return;
    }
    setIsTesting(true);
    const result = await testConnection(newServerUrl, newApiKey || apiKey || "");
    setIsTesting(false);
    Alert.alert(result.success ? "✅ Success" : "❌ Error", result.message);
  };

  const handleConnect = async () => {
    if (!newServerUrl || !newApiKey) {
      Alert.alert("Error", "Please enter both server URL and API key");
      return;
    }
    setIsConnecting(true);
    const result = await connect(newServerUrl, newApiKey);
    setIsConnecting(false);
    if (result.success) {
      Alert.alert("✅ Connected", "Successfully connected to Immich server");
      setNewApiKey("");
    } else {
      Alert.alert("❌ Connection Failed", result.message);
    }
  };

  const handleDisconnect = () => {
    Alert.alert(
      "Disconnect from Immich",
      "Are you sure you want to disconnect? Your adventures will be preserved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => {
            disconnect();
            setNewServerUrl("");
            setNewApiKey("");
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    const result = await exportData();
    if (result.success) {
      Alert.alert("✅ Export Complete", "Your data has been exported successfully");
    } else {
      Alert.alert("❌ Export Failed", result.error || "Failed to export data");
    }
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will clear cached thumbnails and temporary data. Your adventures and settings will be preserved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear Cache",
          onPress: async () => {
            await storageService.clearMediaCache();
            Alert.alert("✅ Cache Cleared", "Temporary data has been removed");
          },
        },
      ]
    );
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "This will reset all settings to their default values. Your adventures will not be affected.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          onPress: async () => {
            await resetSettings();
            Alert.alert("✅ Settings Reset", "All settings have been restored to defaults");
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "⚠️ Delete All Data",
      "This will permanently delete ALL your data including:\n\n• All adventures\n• All narratives and stories\n• All settings\n• Immich connection\n\nThis action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert(
              "Data Deleted",
              "All data has been cleared. The app will reload with demo data.",
              [{ text: "OK", onPress: () => router.replace("/") }]
            );
          },
        },
      ]
    );
  };

  const handleSync = async () => {
    if (!isConnected) {
      Alert.alert("Not Connected", "Please connect to your Immich server first");
      return;
    }
    await syncWithImmich();
  };

  const SettingsSection = ({ 
    title, 
    icon, 
    children, 
    id 
  }: { 
    title: string; 
    icon: string; 
    children: React.ReactNode;
    id: string;
  }) => (
    <View style={styles.section}>
      <Pressable 
        style={styles.sectionHeader}
        onPress={() => setActiveSection(activeSection === id ? null : id)}
      >
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionIcon}>{icon}</Text>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.sectionChevron}>
          {activeSection === id ? "▼" : "▶"}
        </Text>
      </Pressable>
      {activeSection === id && (
        <View style={styles.sectionContent}>
          {children}
        </View>
      )}
    </View>
  );

  const SettingRow = ({
    label,
    description,
    children,
  }: {
    label: string;
    description?: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {children}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator}>
              <View style={[styles.statusDot, isConnected ? styles.statusConnected : styles.statusDisconnected]} />
              <Text style={styles.statusText}>
                {isConnected ? "Connected to Immich" : "Not Connected"}
              </Text>
            </View>
            {isConnected && (
              <Pressable style={styles.syncButton} onPress={handleSync} disabled={syncStatus.isSyncing}>
                {syncStatus.isSyncing ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Text style={styles.syncButtonText}>🔄 Sync</Text>
                )}
              </Pressable>
            )}
          </View>
          {isConnected && serverUrl && (
            <Text style={styles.serverUrlText}>{serverUrl}</Text>
          )}
          {syncStatus.lastSyncTime && (
            <Text style={styles.lastSyncText}>
              Last synced: {new Date(syncStatus.lastSyncTime).toLocaleString()}
            </Text>
          )}
        </View>

        {/* Immich Connection */}
        <SettingsSection title="Immich Connection" icon="🔗" id="connection">
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Server URL</Text>
            <TextInput
              style={styles.input}
              value={newServerUrl}
              onChangeText={setNewServerUrl}
              placeholder="https://your-immich-server.com"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>API Key</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newApiKey}
                onChangeText={setNewApiKey}
                placeholder={isConnected ? "••••••••••••" : "Enter your API key"}
                placeholderTextColor="#64748b"
                secureTextEntry={!showApiKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable 
                style={styles.showPasswordButton}
                onPress={() => setShowApiKey(!showApiKey)}
              >
                <Text style={styles.showPasswordText}>{showApiKey ? "🙈" : "👁️"}</Text>
              </Pressable>
            </View>
            <Text style={styles.inputHint}>
              Find your API key in Immich → Account Settings → API Keys
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.secondaryButton]}
              onPress={handleTestConnection}
              disabled={isTesting}
            >
              {isTesting ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.secondaryButtonText}>Test</Text>
              )}
            </Pressable>

            {isConnected ? (
              <Pressable
                style={[styles.button, styles.dangerButton]}
                onPress={handleDisconnect}
              >
                <Text style={styles.dangerButtonText}>Disconnect</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.button, styles.primaryButton]}
                onPress={handleConnect}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.primaryButtonText}>Connect</Text>
                )}
              </Pressable>
            )}
          </View>
        </SettingsSection>

        {/* Adventure Clustering */}
        <SettingsSection title="Adventure Detection" icon="🗺️" id="clustering">
          <SettingRow
            label="Time Window"
            description="Hours between photos to group as same adventure"
          >
            <View style={styles.numberInputContainer}>
              <Pressable
                style={styles.numberButton}
                onPress={() => updateSettings({ clusterTimeWindow: Math.max(1, settings.clusterTimeWindow - 6) })}
              >
                <Text style={styles.numberButtonText}>−</Text>
              </Pressable>
              <Text style={styles.numberValue}>{settings.clusterTimeWindow}h</Text>
              <Pressable
                style={styles.numberButton}
                onPress={() => updateSettings({ clusterTimeWindow: settings.clusterTimeWindow + 6 })}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </Pressable>
            </View>
          </SettingRow>

          <SettingRow
            label="Distance Threshold"
            description="Max km between photos in same adventure"
          >
            <View style={styles.numberInputContainer}>
              <Pressable
                style={styles.numberButton}
                onPress={() => updateSettings({ clusterDistanceKm: Math.max(10, settings.clusterDistanceKm - 10) })}
              >
                <Text style={styles.numberButtonText}>−</Text>
              </Pressable>
              <Text style={styles.numberValue}>{settings.clusterDistanceKm}km</Text>
              <Pressable
                style={styles.numberButton}
                onPress={() => updateSettings({ clusterDistanceKm: settings.clusterDistanceKm + 10 })}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </Pressable>
            </View>
          </SettingRow>

          <SettingRow
            label="Minimum Photos"
            description="Min photos required to create an adventure"
          >
            <View style={styles.numberInputContainer}>
              <Pressable
                style={styles.numberButton}
                onPress={() => updateSettings({ minPhotosPerAdventure: Math.max(2, settings.minPhotosPerAdventure - 1) })}
              >
                <Text style={styles.numberButtonText}>−</Text>
              </Pressable>
              <Text style={styles.numberValue}>{settings.minPhotosPerAdventure}</Text>
              <Pressable
                style={styles.numberButton}
                onPress={() => updateSettings({ minPhotosPerAdventure: settings.minPhotosPerAdventure + 1 })}
              >
                <Text style={styles.numberButtonText}>+</Text>
              </Pressable>
            </View>
          </SettingRow>
        </SettingsSection>

        {/* Display Settings */}
        <SettingsSection title="Display" icon="🎨" id="display">
          <SettingRow
            label="Show Route Lines"
            description="Display travel routes on the map"
          >
            <Switch
              value={settings.showRouteLines}
              onValueChange={(v) => updateSettings({ showRouteLines: v })}
              trackColor={{ false: "#334155", true: "#3b82f6" }}
              thumbColor="#ffffff"
            />
          </SettingRow>

          <SettingRow
            label="Auto-generate Summaries"
            description="Create AI summaries for adventures"
          >
            <Switch
              value={settings.autoGenerateSummaries}
              onValueChange={(v) => updateSettings({ autoGenerateSummaries: v })}
              trackColor={{ false: "#334155", true: "#3b82f6" }}
              thumbColor="#ffffff"
            />
          </SettingRow>

          <SettingRow
            label="Default View"
            description="Starting view when opening the app"
          >
            <View style={styles.segmentedControl}>
              <Pressable
                style={[
                  styles.segmentButton,
                  settings.defaultView === "map" && styles.segmentButtonActive,
                ]}
                onPress={() => updateSettings({ defaultView: "map" })}
              >
                <Text style={[
                  styles.segmentButtonText,
                  settings.defaultView === "map" && styles.segmentButtonTextActive,
                ]}>
                  Map
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.segmentButton,
                  settings.defaultView === "timeline" && styles.segmentButtonActive,
                ]}
                onPress={() => updateSettings({ defaultView: "timeline" })}
              >
                <Text style={[
                  styles.segmentButtonText,
                  settings.defaultView === "timeline" && styles.segmentButtonTextActive,
                ]}>
                  Timeline
                </Text>
              </Pressable>
            </View>
          </SettingRow>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection title="Data Management" icon="💾" id="data">
          <Pressable
            style={styles.actionButton}
            onPress={handleExportData}
            disabled={isExporting}
          >
            <View style={styles.actionButtonIcon}>
              <Text style={styles.actionIconText}>📤</Text>
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>
                {isExporting ? "Exporting..." : "Export All Data"}
              </Text>
              <Text style={styles.actionButtonDescription}>
                Download a backup of all your adventures and settings
              </Text>
            </View>
            {isExporting && <ActivityIndicator size="small" color="#3b82f6" />}
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleClearCache}>
            <View style={styles.actionButtonIcon}>
              <Text style={styles.actionIconText}>🗑️</Text>
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Clear Cache</Text>
              <Text style={styles.actionButtonDescription}>
                Remove temporary files to free up space
              </Text>
            </View>
          </Pressable>

          <Pressable style={styles.actionButton} onPress={handleResetSettings}>
            <View style={styles.actionButtonIcon}>
              <Text style={styles.actionIconText}>🔄</Text>
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Reset Settings</Text>
              <Text style={styles.actionButtonDescription}>
                Restore all settings to default values
              </Text>
            </View>
          </Pressable>

          <Pressable
            style={[styles.actionButton, styles.dangerActionButton]}
            onPress={handleClearAllData}
          >
            <View style={[styles.actionButtonIcon, styles.dangerIcon]}>
              <Text style={styles.actionIconText}>⚠️</Text>
            </View>
            <View style={styles.actionButtonContent}>
              <Text style={[styles.actionButtonTitle, styles.dangerText]}>
                Delete All Data
              </Text>
              <Text style={styles.actionButtonDescription}>
                Permanently remove all adventures and settings
              </Text>
            </View>
          </Pressable>
        </SettingsSection>

        {/* About */}
        <SettingsSection title="About" icon="ℹ️" id="about">
          <View style={styles.aboutContent}>
            <View style={styles.appInfo}>
              <Text style={styles.appName}>Travel Log</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
            </View>
            
            <Text style={styles.aboutDescription}>
              Automatically organize your travel photos into beautiful adventures. 
              Connect to your Immich server to sync your media and discover your journeys.
            </Text>

            <View style={styles.aboutLinks}>
              <View style={styles.aboutLinkRow}>
                <Text style={styles.aboutLinkLabel}>Storage:</Text>
                <Text style={styles.aboutLinkValue}>
                  {typeof window !== "undefined" ? "Server API" : "Local Storage"}
                </Text>
              </View>
              <View style={styles.aboutLinkRow}>
                <Text style={styles.aboutLinkLabel}>Platform:</Text>
                <Text style={styles.aboutLinkValue}>
                  {typeof window !== "undefined" ? "Web" : "Native"}
                </Text>
              </View>
            </View>
          </View>
        </SettingsSection>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statusCard: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusConnected: {
    backgroundColor: "#22c55e",
  },
  statusDisconnected: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  syncButton: {
    backgroundColor: "#0f172a",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  syncButtonText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  serverUrlText: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 8,
  },
  lastSyncText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ffffff",
  },
  sectionChevron: {
    color: "#64748b",
    fontSize: 12,
  },
  sectionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: "#334155",
  },
  inputGroup: {
    marginTop: 16,
  },
  inputLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
  },
  showPasswordButton: {
    padding: 16,
  },
  showPasswordText: {
    fontSize: 18,
  },
  inputHint: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: "#3b82f6",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: "#334155",
  },
  secondaryButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  dangerButton: {
    backgroundColor: "#7f1d1d",
  },
  dangerButtonText: {
    color: "#fca5a5",
    fontWeight: "600",
    fontSize: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 4,
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#334155",
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
  },
  numberValue: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    minWidth: 50,
    textAlign: "center",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 4,
  },
  segmentButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: "#3b82f6",
  },
  segmentButtonText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  segmentButtonTextActive: {
    color: "#ffffff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  dangerActionButton: {
    borderWidth: 1,
    borderColor: "#7f1d1d",
  },
  actionButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: "#7f1d1d",
  },
  actionIconText: {
    fontSize: 20,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  actionButtonDescription: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 2,
  },
  dangerText: {
    color: "#fca5a5",
  },
  aboutContent: {
    paddingTop: 16,
  },
  appInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  appName: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "bold",
  },
  appVersion: {
    color: "#64748b",
    fontSize: 14,
    marginTop: 4,
  },
  aboutDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  aboutLinks: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
  },
  aboutLinkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  aboutLinkLabel: {
    color: "#64748b",
    fontSize: 14,
  },
  aboutLinkValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
});