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
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useImmichConnection } from "../hooks/useImmichConnection";
import { useSettings } from "../hooks/useSettings";
import { useDataExport } from "../hooks/useDataExport";
import { useAdventures } from "../hooks/useAdventures";
import { useAI } from "../hooks/useAI";
import { storageService } from "../services/storageService";
import GradientBackground from "../components/ui/GradientBackground";
import GlassCard from "../components/ui/GlassCard";
import AnimatedButton from "../components/ui/AnimatedButton";
import ProxyHeaderEditor from "../components/ProxyHeaderEditor";

export default function SettingsScreen() {
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

  const handleProxyHeadersChanged = async () => {
    if (isConnected) {
      await reconnectWithHeaders();
    }
  };

  const SettingsSection = ({ 
    title, 
    icon, 
    children, 
    id,
    badge,
  }: { 
    title: string; 
    icon: string; 
    children: React.ReactNode;
    id: string;
    badge?: string | number;
  }) => (
    <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
      <Pressable 
        style={styles.sectionHeader}
        onPress={() => setActiveSection(activeSection === id ? null : id)}
      >
        <BlurView intensity={60} tint="dark" style={styles.sectionHeaderBlur}>
          <LinearGradient
            colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"]}
            style={styles.sectionHeaderGradient}
          >
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionIcon}>{icon}</Text>
              <Text style={styles.sectionTitle}>{title}</Text>
              {badge !== undefined && badge !== 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              )}
            </View>
            <Text style={styles.sectionChevron}>
              {activeSection === id ? "▼" : "▶"}
            </Text>
          </LinearGradient>
        </BlurView>
      </Pressable>
      {activeSection === id && (
        <Animated.View entering={FadeIn} style={styles.sectionContent}>
          <GlassCard>
            {children}
          </GlassCard>
        </Animated.View>
      )}
    </Animated.View>
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

  const enabledHeadersCount = (settings.proxyHeaders || []).filter(h => h.enabled && h.key && h.value).length;

  return (
    <GradientBackground>
      <View style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeInDown} style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <BlurView intensity={60} tint="dark" style={styles.backButtonBlur}>
              <Text style={styles.backButtonText}>←</Text>
            </BlurView>
          </Pressable>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={{ width: 44 }} />
        </Animated.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Connection Status Card */}
          <Animated.View entering={FadeInDown.delay(50)}>
            <GlassCard style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <View style={styles.statusIndicator}>
                  <View style={[styles.statusDot, isConnected ? styles.statusConnected : styles.statusDisconnected]} />
                  <Text style={styles.statusText}>
                    {isConnected ? "Connected to Immich" : "Not Connected"}
                  </Text>
                </View>
                {isConnected && (
                  <Pressable style={styles.syncButton} onPress={handleSync} disabled={syncStatus.isSyncing}>
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
            </GlassCard>
          </Animated.View>

          {/* Immich Connection */}
          <SettingsSection title="Immich Connection" icon="🔗" id="connection">
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Server URL</Text>
              <View style={styles.inputContainer}>
                <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                  <TextInput
                    style={styles.input}
                    value={newServerUrl}
                    onChangeText={setNewServerUrl}
                    placeholder="https://your-immich-server.com"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                </BlurView>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>API Key</Text>
              <View style={styles.inputContainer}>
                <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      style={styles.passwordInput}
                      value={newApiKey}
                      onChangeText={setNewApiKey}
                      placeholder={isConnected ? "••••••••••••" : "Enter your API key"}
                      placeholderTextColor="rgba(255,255,255,0.3)"
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
                </BlurView>
              </View>
              <Text style={styles.inputHint}>
                Find your API key in Immich → Account Settings → API Keys
              </Text>
            </View>

            <View style={styles.buttonRow}>
              <AnimatedButton
                title={isTesting ? "Testing..." : "Test"}
                variant="secondary"
                onPress={handleTestConnection}
                disabled={isTesting}
                style={{ flex: 1 }}
              />

              {isConnected ? (
                <AnimatedButton
                  title="Disconnect"
                  variant="danger"
                  onPress={handleDisconnect}
                  style={{ flex: 1 }}
                />
              ) : (
                <AnimatedButton
                  title={isConnecting ? "Connecting..." : "Connect"}
                  variant="primary"
                  onPress={handleConnect}
                  disabled={isConnecting}
                  style={{ flex: 1 }}
                />
              )}
            </View>
          </SettingsSection>

          {/* Proxy Headers */}
          <SettingsSection 
            title="Proxy Headers" 
            icon="🔐" 
            id="proxy"
            badge={enabledHeadersCount}
          >
            <ProxyHeaderEditor
              headers={settings.proxyHeaders || []}
              onAdd={async () => {
                await addProxyHeader();
                handleProxyHeadersChanged();
              }}
              onUpdate={async (id, updates) => {
                await updateProxyHeader(id, updates);
                handleProxyHeadersChanged();
              }}
              onDelete={async (id) => {
                await deleteProxyHeader(id);
                handleProxyHeadersChanged();
              }}
              onToggle={async (id) => {
                await toggleProxyHeader(id);
                handleProxyHeadersChanged();
              }}
            />
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
                trackColor={{ false: "rgba(255,255,255,0.1)", true: "#3b82f6" }}
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
                trackColor={{ false: "rgba(255,255,255,0.1)", true: "#3b82f6" }}
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
                  <Text style={styles.aboutLinkLabel}>AI Provider:</Text>
                  <Text style={styles.aboutLinkValue}>
                    {aiConfig.isConfigured ? "Google Gemini ✅" : "Not configured"}
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
                    Set GEMINI_API_KEY in your environment to enable AI-powered summaries and highlights.
                    Get a free key at aistudio.google.com
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    borderRadius: 22,
    overflow: "hidden",
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusCard: {
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
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
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
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginTop: 8,
  },
  lastSyncText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 4,
  },
  proxyBadge: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  proxyBadgeText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "500",
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    borderRadius: 16,
    overflow: "hidden",
  },
  sectionHeaderBlur: {
    borderRadius: 16,
  },
  sectionHeaderGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
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
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  sectionContent: {
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputContainer: {
    borderRadius: 12,
    overflow: "hidden",
  },
  inputBlur: {
    borderRadius: 12,
  },
  input: {
    padding: 16,
    color: "#ffffff",
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
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
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginTop: 4,
  },
  numberInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: 4,
  },
  numberButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
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
    backgroundColor: "rgba(255,255,255,0.1)",
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
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "500",
  },
  segmentButtonTextActive: {
    color: "#ffffff",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  dangerActionButton: {
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  actionButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  dangerIcon: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
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
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    marginTop: 2,
  },
  dangerText: {
    color: "#fca5a5",
  },
  aboutContent: {
    alignItems: "center",
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
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    marginTop: 4,
  },
  aboutDescription: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 20,
  },
  aboutLinks: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 16,
  },
  aboutLinkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  aboutLinkLabel: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  aboutLinkValue: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "500",
  },
  aiHint: {
    width: "100%",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  aiHintTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  aiHintText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    lineHeight: 20,
  },
});