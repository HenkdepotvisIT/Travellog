import { useState, useEffect, useCallback, memo, type ReactNode } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useImmichConnection } from "../../hooks/useImmichConnection";
import { useSettings } from "../../hooks/useSettings";
import { useDataExport } from "../../hooks/useDataExport";
import { useAdventures } from "../../hooks/useAdventures";
import { useAI } from "../../hooks/useAI";
import { storageService } from "../../services/storageService";
import GradientBackground from "../../components/ui/GradientBackground";
import ProxyHeaderEditor from "../../components/ProxyHeaderEditor";
import { ProxyHeader } from "../../types";

// ─── Sub-components defined OUTSIDE the screen ───────────────────────────────
// Defining them inside SettingsTab causes React to treat them as new component
// types on every render, which unmounts/remounts children and causes glitching.

interface SettingsSectionProps {
  title: string;
  icon: string;
  children: ReactNode;
  id: string;
  badge?: string | number;
  activeSection: string | null;
  onToggle: (id: string) => void;
}

const SettingsSection = memo(function SettingsSection({
  title,
  icon,
  children,
  id,
  badge,
  activeSection,
  onToggle,
}: SettingsSectionProps) {
  const isOpen = activeSection === id;
  return (
    <View style={styles.section}>
      <Pressable
        style={({ pressed }) => [styles.sectionHeader, pressed && styles.sectionHeaderPressed]}
        onPress={() => onToggle(id)}
      >
        <View style={styles.sectionHeaderInner}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionIcon}>{icon}</Text>
            <Text style={styles.sectionTitle}>{title}</Text>
            {badge !== undefined && badge !== 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={styles.sectionChevron}>{isOpen ? "▼" : "▶"}</Text>
        </View>
      </Pressable>
      {isOpen && (
        <View style={styles.sectionContent}>
          <View style={styles.card}>{children}</View>
        </View>
      )}
    </View>
  );
});

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

const SettingRow = memo(function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={styles.settingLabel}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
      {children}
    </View>
  );
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function SettingsTab() {
  const { isConnected, serverUrl, apiKey, connect, disconnect, testConnection, reconnectWithHeaders } =
    useImmichConnection();
  const {
    settings,
    updateSettings,
    resetSettings,
    addProxyHeader,
    updateProxyHeader,
    deleteProxyHeader,
    toggleProxyHeader,
  } = useSettings();
  const { exportData, clearAllData, isExporting } = useDataExport();
  const { syncStatus, syncWithImmich } = useAdventures({ dateRange: null, country: null, minDistance: 0 });
  const { config: aiConfig } = useAI();

  const [newServerUrl, setNewServerUrl] = useState(serverUrl || "");
  const [newApiKey, setNewApiKey] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (serverUrl) setNewServerUrl(serverUrl);
  }, [serverUrl]);

  const toggleSection = useCallback((id: string) => {
    setActiveSection((prev) => (prev === id ? null : id));
  }, []);

  const handleTestConnection = async () => {
    if (!newServerUrl) {
      Alert.alert("Error", "Please enter a server URL");
      return;
    }
    setIsTesting(true);
    const result = await testConnection(newServerUrl, newApiKey || apiKey || "", settings.proxyHeaders);
    setIsTesting(false);
    Alert.alert(result.success ? "✅ Success" : "❌ Error", result.message);
  };

  const handleConnect = async () => {
    if (!newServerUrl || !newApiKey) {
      Alert.alert("Error", "Please enter both server URL and API key");
      return;
    }
    setIsConnecting(true);
    const result = await connect(newServerUrl, newApiKey, settings.proxyHeaders);
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
      "This will reset all settings to their default values, including proxy headers. Your adventures will not be affected.",
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
      "This will permanently delete ALL your data including:\n\n• All adventures\n• All narratives and stories\n• All settings\n• Proxy headers\n• Immich connection\n\nThis action cannot be undone!",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Everything",
          style: "destructive",
          onPress: async () => {
            await clearAllData();
            Alert.alert("Data Deleted", "All data has been cleared. The app will reload with demo data.");
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

  const handleProxyHeadersChanged = useCallback(async () => {
    if (isConnected) await reconnectWithHeaders();
  }, [isConnected, reconnectWithHeaders]);

  // Stable callbacks for ProxyHeaderEditor so it doesn't re-render on every keystroke
  const handleAddHeader = useCallback(async () => {
    await addProxyHeader();
    handleProxyHeadersChanged();
  }, [addProxyHeader, handleProxyHeadersChanged]);

  const handleUpdateHeader = useCallback(
    async (id: string, updates: Partial<ProxyHeader>) => {
      await updateProxyHeader(id, updates);
      handleProxyHeadersChanged();
    },
    [updateProxyHeader, handleProxyHeadersChanged]
  );

  const handleDeleteHeader = useCallback(
    async (id: string) => {
      await deleteProxyHeader(id);
      handleProxyHeadersChanged();
    },
    [deleteProxyHeader, handleProxyHeadersChanged]
  );

  const handleToggleHeader = useCallback(
    async (id: string) => {
      await toggleProxyHeader(id);
      handleProxyHeadersChanged();
    },
    [toggleProxyHeader, handleProxyHeadersChanged]
  );

  const enabledHeadersCount = (settings.proxyHeaders || []).filter(
    (h) => h.enabled && h.key && h.value
  ).length;

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Connection Status Card */}
          <View style={[styles.card, styles.statusCardMargin]}>
            <View style={styles.statusHeader}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, isConnected ? styles.statusConnected : styles.statusDisconnected]} />
                <Text style={styles.statusText}>
                  {isConnected ? "Connected to Immich" : "Not Connected"}
                </Text>
              </View>
              {isConnected && (
                <Pressable
                  style={({ pressed }) => [styles.syncButton, pressed && { opacity: 0.7 }]}
                  onPress={handleSync}
                  disabled={syncStatus.isSyncing}
                >
                  <LinearGradient
                    colors={["rgba(59, 130, 246, 0.3)", "rgba(59, 130, 246, 0.1)"]}
                    style={styles.syncButtonGradient}
                  >
                    {syncStatus.isSyncing ? (
                      <ActivityIndicator size="small" color="#3b82f6" />
                    ) : (
                      <Text style={styles.syncButtonText}>🔄 Sync</Text>
                    )}
                  </LinearGradient>
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
            {enabledHeadersCount > 0 && (
              <View style={styles.proxyBadge}>
                <Text style={styles.proxyBadgeText}>
                  🔒 {enabledHeadersCount} proxy header{enabledHeadersCount > 1 ? "s" : ""} active
                </Text>
              </View>
            )}
          </View>

          {/* Settings Sections */}
          <SettingsSection
            title="Immich Connection"
            icon="🔗"
            id="connection"
            activeSection={activeSection}
            onToggle={toggleSection}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Server URL</Text>
              <TextInput
                style={styles.input}
                value={newServerUrl}
                onChangeText={setNewServerUrl}
                placeholder="https://your-immich-server.com"
                placeholderTextColor="rgba(0,0,0,0.3)"
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
                  placeholderTextColor="rgba(0,0,0,0.3)"
                  secureTextEntry={!showApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable style={styles.showPasswordButton} onPress={() => setShowApiKey(!showApiKey)}>
                  <Text style={styles.showPasswordText}>{showApiKey ? "🙈" : "👁️"}</Text>
                </Pressable>
              </View>
              <Text style={styles.inputHint}>
                Find your API key in Immich → Account Settings → API Keys
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.btn,
                  styles.btnSecondary,
                  pressed && { opacity: 0.7 },
                  isTesting && { opacity: 0.5 },
                ]}
                onPress={handleTestConnection}
                disabled={isTesting}
              >
                <Text style={styles.btnSecondaryText}>{isTesting ? "Testing..." : "Test"}</Text>
              </Pressable>

              {isConnected ? (
                <Pressable
                  style={({ pressed }) => [styles.btn, styles.btnDanger, pressed && { opacity: 0.7 }]}
                  onPress={handleDisconnect}
                >
                  <Text style={styles.btnText}>Disconnect</Text>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.btn,
                    styles.btnPrimary,
                    pressed && { opacity: 0.7 },
                    isConnecting && { opacity: 0.5 },
                  ]}
                  onPress={handleConnect}
                  disabled={isConnecting}
                >
                  <Text style={styles.btnText}>{isConnecting ? "Connecting..." : "Connect"}</Text>
                </Pressable>
              )}
            </View>
          </SettingsSection>

          <SettingsSection
            title="Proxy Headers"
            icon="🔐"
            id="proxy"
            badge={enabledHeadersCount}
            activeSection={activeSection}
            onToggle={toggleSection}
          >
            <ProxyHeaderEditor
              headers={settings.proxyHeaders || []}
              onAdd={handleAddHeader}
              onUpdate={handleUpdateHeader}
              onDelete={handleDeleteHeader}
              onToggle={handleToggleHeader}
            />
          </SettingsSection>

          <SettingsSection
            title="Adventure Detection"
            icon="🗺️"
            id="clustering"
            activeSection={activeSection}
            onToggle={toggleSection}
          >
            <SettingRow
              label="Time Window"
              description="Hours between photos to group as same adventure"
            >
              <View style={styles.numberInputContainer}>
                <Pressable
                  style={styles.numberButton}
                  onPress={() =>
                    updateSettings({ clusterTimeWindow: Math.max(1, settings.clusterTimeWindow - 6) })
                  }
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
                  onPress={() =>
                    updateSettings({ clusterDistanceKm: Math.max(10, settings.clusterDistanceKm - 10) })
                  }
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
                  onPress={() =>
                    updateSettings({
                      minPhotosPerAdventure: Math.max(2, settings.minPhotosPerAdventure - 1),
                    })
                  }
                >
                  <Text style={styles.numberButtonText}>−</Text>
                </Pressable>
                <Text style={styles.numberValue}>{settings.minPhotosPerAdventure}</Text>
                <Pressable
                  style={styles.numberButton}
                  onPress={() =>
                    updateSettings({ minPhotosPerAdventure: settings.minPhotosPerAdventure + 1 })
                  }
                >
                  <Text style={styles.numberButtonText}>+</Text>
                </Pressable>
              </View>
            </SettingRow>
          </SettingsSection>

          <SettingsSection
            title="Display"
            icon="🎨"
            id="display"
            activeSection={activeSection}
            onToggle={toggleSection}
          >
            <SettingRow label="Show Route Lines" description="Display travel routes on the map">
              <Switch
                value={settings.showRouteLines}
                onValueChange={(v) => updateSettings({ showRouteLines: v })}
                trackColor={{ false: "rgba(0,0,0,0.1)", true: "#3b82f6" }}
                thumbColor="#ffffff"
              />
            </SettingRow>

            <SettingRow
              label="Auto-generate Summaries"
              description="Create AI summaries for new adventures"
            >
              <Switch
                value={settings.autoGenerateSummaries}
                onValueChange={(v) => updateSettings({ autoGenerateSummaries: v })}
                trackColor={{ false: "rgba(0,0,0,0.1)", true: "#3b82f6" }}
                thumbColor="#ffffff"
              />
            </SettingRow>

            <SettingRow label="Default View" description="Starting view when opening the app">
              <View style={styles.segmentedControl}>
                <Pressable
                  style={[
                    styles.segmentButton,
                    settings.defaultView === "map" && styles.segmentButtonActive,
                  ]}
                  onPress={() => updateSettings({ defaultView: "map" })}
                >
                  <Text
                    style={[
                      styles.segmentButtonText,
                      settings.defaultView === "map" && styles.segmentButtonTextActive,
                    ]}
                  >
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
                  <Text
                    style={[
                      styles.segmentButtonText,
                      settings.defaultView === "timeline" && styles.segmentButtonTextActive,
                    ]}
                  >
                    Timeline
                  </Text>
                </Pressable>
              </View>
            </SettingRow>
          </SettingsSection>

          <SettingsSection
            title="Data Management"
            icon="💾"
            id="data"
            activeSection={activeSection}
            onToggle={toggleSection}
          >
            <Pressable
              style={({ pressed }) => [
                styles.actionButton,
                (pressed || isExporting) && { opacity: 0.7 },
              ]}
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

            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
              onPress={handleClearCache}
            >
              <View style={styles.actionButtonIcon}>
                <Text style={styles.actionIconText}>🗑️</Text>
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Clear Cache</Text>
                <Text style={styles.actionButtonDescription}>Remove temporary files to free up space</Text>
              </View>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionButton, pressed && { opacity: 0.7 }]}
              onPress={handleResetSettings}
            >
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
              style={({ pressed }) => [
                styles.actionButton,
                styles.dangerActionButton,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleClearAllData}
            >
              <View style={[styles.actionButtonIcon, styles.dangerIcon]}>
                <Text style={styles.actionIconText}>⚠️</Text>
              </View>
              <View style={styles.actionButtonContent}>
                <Text style={[styles.actionButtonTitle, styles.dangerText]}>Delete All Data</Text>
                <Text style={styles.actionButtonDescription}>
                  Permanently remove all adventures and settings
                </Text>
              </View>
            </Pressable>
          </SettingsSection>

          <SettingsSection
            title="About"
            icon="ℹ️"
            id="about"
            activeSection={activeSection}
            onToggle={toggleSection}
          >
            <View style={styles.aboutContent}>
              <View style={styles.appInfo}>
                <Text style={styles.appName}>Travel Log</Text>
                <Text style={styles.appVersion}>Version 1.0.0</Text>
              </View>

              <Text style={styles.aboutDescription}>
                Automatically organize your travel photos into beautiful adventures. Connect to your Immich
                server to sync your media and discover your journeys.
              </Text>

              <View style={styles.aboutLinks}>
                <View style={styles.aboutLinkRow}>
                  <Text style={styles.aboutLinkLabel}>AI Provider:</Text>
                  <Text style={styles.aboutLinkValue}>
                    {aiConfig.isConfigured
                      ? `${
                          aiConfig.provider === "anthropic"
                            ? "Anthropic Claude"
                            : aiConfig.provider === "gemini"
                            ? "Google Gemini"
                            : "OpenAI"
                        } ✅`
                      : "Not configured"}
                  </Text>
                </View>
                <View style={styles.aboutLinkRow}>
                  <Text style={styles.aboutLinkLabel}>Storage:</Text>
                  <Text style={styles.aboutLinkValue}>PostgreSQL</Text>
                </View>
              </View>

              {!aiConfig.isConfigured && (
                <View style={styles.aiHint}>
                  <Text style={styles.aiHintTitle}>💡 Enable AI Features</Text>
                  <Text style={styles.aiHintText}>
                    Set ANTHROPIC_API_KEY in your environment to enable AI-powered summaries and
                    highlights. Get your API key at console.anthropic.com
                  </Text>
                </View>
              )}
            </View>
          </SettingsSection>

          <View style={{ height: 100 }} />
        </ScrollView>
      </View>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  statusCardMargin: {
    marginBottom: 16,
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
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "600",
  },
  syncButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  syncButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  syncButtonText: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  serverUrlText: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 8,
  },
  lastSyncText: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
  proxyBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  proxyBadgeText: {
    color: "#3b82f6",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  sectionHeaderPressed: {
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  sectionHeaderInner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
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
    color: "#1e293b",
  },
  badge: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  sectionChevron: {
    color: "#94a3b8",
    fontSize: 12,
  },
  sectionContent: {
    marginTop: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 14,
    color: "#1e293b",
    fontSize: 15,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    color: "#1e293b",
    fontSize: 15,
  },
  showPasswordButton: {
    padding: 14,
  },
  showPasswordText: {
    fontSize: 18,
  },
  inputHint: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimary: {
    backgroundColor: "#3b82f6",
  },
  btnSecondary: {
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  btnDanger: {
    backgroundColor: "#ef4444",
  },
  btnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
  },
  btnSecondaryText: {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "500",
  },
  settingDescription: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 3,
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 4,
  },
  numberButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  numberButtonText: {
    color: "#1e293b",
    fontSize: 18,
    fontWeight: "600",
  },
  numberValue: {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "600",
    minWidth: 50,
    textAlign: "center",
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    padding: 3,
  },
  segmentButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  segmentButtonActive: {
    backgroundColor: "#3b82f6",
  },
  segmentButtonText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
  segmentButtonTextActive: {
    color: "#ffffff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  dangerActionButton: {
    borderColor: "rgba(239, 68, 68, 0.25)",
  },
  actionButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  dangerIcon: {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
  },
  actionIconText: {
    fontSize: 20,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "600",
  },
  actionButtonDescription: {
    color: "#94a3b8",
    fontSize: 13,
    marginTop: 2,
  },
  dangerText: {
    color: "#ef4444",
  },
  aboutContent: {
    alignItems: "center",
  },
  appInfo: {
    alignItems: "center",
    marginBottom: 16,
  },
  appName: {
    color: "#1e293b",
    fontSize: 22,
    fontWeight: "bold",
  },
  appVersion: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 4,
  },
  aboutDescription: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
  aboutLinks: {
    width: "100%",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 14,
  },
  aboutLinkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  aboutLinkLabel: {
    color: "#94a3b8",
    fontSize: 14,
  },
  aboutLinkValue: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "500",
  },
  aiHint: {
    width: "100%",
    backgroundColor: "rgba(59, 130, 246, 0.08)",
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  aiHintTitle: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  aiHintText: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 20,
  },
});
