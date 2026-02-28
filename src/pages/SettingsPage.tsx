import { useState, useEffect, useCallback, memo, type ReactNode } from "react";
import { useImmichConnection } from "../hooks/useImmichConnection";
import { useSettings } from "../hooks/useSettings";
import { useDataExport } from "../hooks/useDataExport";
import { useAdventures } from "../hooks/useAdventures";
import { useAI } from "../hooks/useAI";
import { storageService } from "../services/storageService";
import GradientBackground from "../components/ui/GradientBackground";
import ProxyHeaderEditor from "../components/ProxyHeaderEditor";
import { ProxyHeader } from "../types";
import styles from "./SettingsPage.module.css";

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
    <div className={styles.section}>
      <button
        className={styles.sectionHeader}
        onClick={() => onToggle(id)}
        type="button"
      >
        <div className={styles.sectionHeaderInner}>
          <div className={styles.sectionTitleRow}>
            <span className={styles.sectionIcon}>{icon}</span>
            <span className={styles.sectionTitle}>{title}</span>
            {badge !== undefined && badge !== 0 && (
              <span className={styles.badge}>
                <span className={styles.badgeText}>{badge}</span>
              </span>
            )}
          </div>
          <span className={styles.sectionChevron}>{isOpen ? "\u25BC" : "\u25B6"}</span>
        </div>
      </button>
      {isOpen && (
        <div className={styles.sectionContent}>
          <div className={styles.card}>{children}</div>
        </div>
      )}
    </div>
  );
});

interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

const SettingRow = memo(function SettingRow({ label, description, children }: SettingRowProps) {
  return (
    <div className={styles.settingRow}>
      <div className={styles.settingInfo}>
        <div className={styles.settingLabel}>{label}</div>
        {description && <div className={styles.settingDescription}>{description}</div>}
      </div>
      {children}
    </div>
  );
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export function SettingsPage() {
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
      window.alert("Please enter a server URL");
      return;
    }
    setIsTesting(true);
    const result = await testConnection(newServerUrl, newApiKey || apiKey || "", settings.proxyHeaders);
    setIsTesting(false);
    window.alert(result.success ? "Success: " + result.message : "Error: " + result.message);
  };

  const handleConnect = async () => {
    if (!newServerUrl || !newApiKey) {
      window.alert("Please enter both server URL and API key");
      return;
    }
    setIsConnecting(true);
    const result = await connect(newServerUrl, newApiKey, settings.proxyHeaders);
    setIsConnecting(false);
    if (result.success) {
      window.alert("Connected: Successfully connected to Immich server");
      setNewApiKey("");
    } else {
      window.alert("Connection Failed: " + result.message);
    }
  };

  const handleDisconnect = () => {
    const confirmed = window.confirm(
      "Disconnect from Immich?\n\nAre you sure you want to disconnect? Your adventures will be preserved."
    );
    if (confirmed) {
      disconnect();
      setNewServerUrl("");
      setNewApiKey("");
    }
  };

  const handleExportData = async () => {
    const result = await exportData();
    if (result.success) {
      window.alert("Export Complete: Your data has been exported successfully");
    } else {
      window.alert("Export Failed: " + (result.error || "Failed to export data"));
    }
  };

  const handleClearCache = async () => {
    const confirmed = window.confirm(
      "Clear Cache?\n\nThis will clear cached thumbnails and temporary data. Your adventures and settings will be preserved."
    );
    if (confirmed) {
      await storageService.clearMediaCache();
      window.alert("Cache Cleared: Temporary data has been removed");
    }
  };

  const handleResetSettings = async () => {
    const confirmed = window.confirm(
      "Reset Settings?\n\nThis will reset all settings to their default values, including proxy headers. Your adventures will not be affected."
    );
    if (confirmed) {
      await resetSettings();
      window.alert("Settings Reset: All settings have been restored to defaults");
    }
  };

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      "Delete All Data?\n\nThis will permanently delete ALL your data including:\n\n- All adventures\n- All narratives and stories\n- All settings\n- Proxy headers\n- Immich connection\n\nThis action cannot be undone!"
    );
    if (confirmed) {
      await clearAllData();
      window.alert("Data Deleted: All data has been cleared. The app will reload with demo data.");
    }
  };

  const handleSync = async () => {
    if (!isConnected) {
      window.alert("Not Connected: Please connect to your Immich server first");
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
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Settings</h1>
        </div>

        <div className={styles.content}>
          {/* Connection Status Card */}
          <div className={`${styles.card} ${styles.statusCardMargin}`}>
            <div className={styles.statusHeader}>
              <div className={styles.statusIndicator}>
                <div
                  className={`${styles.statusDot} ${
                    isConnected ? styles.statusConnected : styles.statusDisconnected
                  }`}
                />
                <span className={styles.statusText}>
                  {isConnected ? "Connected to Immich" : "Not Connected"}
                </span>
              </div>
              {isConnected && (
                <button
                  className={styles.syncButton}
                  onClick={handleSync}
                  disabled={syncStatus.isSyncing}
                  type="button"
                >
                  <div className={styles.syncButtonGradient}>
                    {syncStatus.isSyncing ? (
                      <div className={`${styles.spinner} ${styles.spinnerSmall}`} />
                    ) : (
                      <span className={styles.syncButtonText}>Sync</span>
                    )}
                  </div>
                </button>
              )}
            </div>
            {isConnected && serverUrl && (
              <div className={styles.serverUrlText}>{serverUrl}</div>
            )}
            {syncStatus.lastSyncTime && (
              <div className={styles.lastSyncText}>
                Last synced: {new Date(syncStatus.lastSyncTime).toLocaleString()}
              </div>
            )}
            {enabledHeadersCount > 0 && (
              <div className={styles.proxyBadge}>
                <span className={styles.proxyBadgeText}>
                  {enabledHeadersCount} proxy header{enabledHeadersCount > 1 ? "s" : ""} active
                </span>
              </div>
            )}
          </div>

          {/* Settings Sections */}
          <SettingsSection
            title="Immich Connection"
            icon="🔗"
            id="connection"
            activeSection={activeSection}
            onToggle={toggleSection}
          >
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Server URL</label>
              <input
                className={styles.input}
                type="url"
                value={newServerUrl}
                onChange={(e) => setNewServerUrl(e.target.value)}
                placeholder="https://your-immich-server.com"
                autoCapitalize="none"
                autoCorrect="off"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>API Key</label>
              <div className={styles.passwordContainer}>
                <input
                  className={styles.passwordInput}
                  type={showApiKey ? "text" : "password"}
                  value={newApiKey}
                  onChange={(e) => setNewApiKey(e.target.value)}
                  placeholder={isConnected ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "Enter your API key"}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <button
                  className={styles.showPasswordButton}
                  onClick={() => setShowApiKey(!showApiKey)}
                  type="button"
                >
                  <span className={styles.showPasswordText}>{showApiKey ? "\uD83D\uDE48" : "\uD83D\uDC41\uFE0F"}</span>
                </button>
              </div>
              <div className={styles.inputHint}>
                Find your API key in Immich &rarr; Account Settings &rarr; API Keys
              </div>
            </div>

            <div className={styles.buttonRow}>
              <button
                className={`${styles.btn} ${styles.btnSecondary} ${isTesting ? styles.btnDisabled : ""}`}
                onClick={handleTestConnection}
                disabled={isTesting}
                type="button"
              >
                <span className={styles.btnSecondaryText}>{isTesting ? "Testing..." : "Test"}</span>
              </button>

              {isConnected ? (
                <button
                  className={`${styles.btn} ${styles.btnDanger}`}
                  onClick={handleDisconnect}
                  type="button"
                >
                  <span className={styles.btnText}>Disconnect</span>
                </button>
              ) : (
                <button
                  className={`${styles.btn} ${styles.btnPrimary} ${isConnecting ? styles.btnDisabled : ""}`}
                  onClick={handleConnect}
                  disabled={isConnecting}
                  type="button"
                >
                  <span className={styles.btnText}>{isConnecting ? "Connecting..." : "Connect"}</span>
                </button>
              )}
            </div>
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
              <div className={styles.numberInputContainer}>
                <button
                  className={styles.numberButton}
                  onClick={() =>
                    updateSettings({ clusterTimeWindow: Math.max(1, settings.clusterTimeWindow - 6) })
                  }
                  type="button"
                >
                  <span className={styles.numberButtonText}>&minus;</span>
                </button>
                <span className={styles.numberValue}>{settings.clusterTimeWindow}h</span>
                <button
                  className={styles.numberButton}
                  onClick={() => updateSettings({ clusterTimeWindow: settings.clusterTimeWindow + 6 })}
                  type="button"
                >
                  <span className={styles.numberButtonText}>+</span>
                </button>
              </div>
            </SettingRow>

            <SettingRow
              label="Distance Threshold"
              description="Max km between photos in same adventure"
            >
              <div className={styles.numberInputContainer}>
                <button
                  className={styles.numberButton}
                  onClick={() =>
                    updateSettings({ clusterDistanceKm: Math.max(10, settings.clusterDistanceKm - 10) })
                  }
                  type="button"
                >
                  <span className={styles.numberButtonText}>&minus;</span>
                </button>
                <span className={styles.numberValue}>{settings.clusterDistanceKm}km</span>
                <button
                  className={styles.numberButton}
                  onClick={() => updateSettings({ clusterDistanceKm: settings.clusterDistanceKm + 10 })}
                  type="button"
                >
                  <span className={styles.numberButtonText}>+</span>
                </button>
              </div>
            </SettingRow>

            <SettingRow
              label="Minimum Photos"
              description="Min photos required to create an adventure"
            >
              <div className={styles.numberInputContainer}>
                <button
                  className={styles.numberButton}
                  onClick={() =>
                    updateSettings({
                      minPhotosPerAdventure: Math.max(2, settings.minPhotosPerAdventure - 1),
                    })
                  }
                  type="button"
                >
                  <span className={styles.numberButtonText}>&minus;</span>
                </button>
                <span className={styles.numberValue}>{settings.minPhotosPerAdventure}</span>
                <button
                  className={styles.numberButton}
                  onClick={() =>
                    updateSettings({ minPhotosPerAdventure: settings.minPhotosPerAdventure + 1 })
                  }
                  type="button"
                >
                  <span className={styles.numberButtonText}>+</span>
                </button>
              </div>
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
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={settings.showRouteLines}
                  onChange={(e) => updateSettings({ showRouteLines: e.target.checked })}
                />
                <span className={styles.toggleTrack} />
              </label>
            </SettingRow>

            <SettingRow
              label="Auto-generate Summaries"
              description="Create AI summaries for new adventures"
            >
              <label className={styles.toggleLabel}>
                <input
                  type="checkbox"
                  checked={settings.autoGenerateSummaries}
                  onChange={(e) => updateSettings({ autoGenerateSummaries: e.target.checked })}
                />
                <span className={styles.toggleTrack} />
              </label>
            </SettingRow>

            <SettingRow label="Default View" description="Starting view when opening the app">
              <div className={styles.segmentedControl}>
                <button
                  className={`${styles.segmentButton} ${
                    settings.defaultView === "map" ? styles.segmentButtonActive : ""
                  }`}
                  onClick={() => updateSettings({ defaultView: "map" })}
                  type="button"
                >
                  <span
                    className={`${styles.segmentButtonText} ${
                      settings.defaultView === "map" ? styles.segmentButtonTextActive : ""
                    }`}
                  >
                    Map
                  </span>
                </button>
                <button
                  className={`${styles.segmentButton} ${
                    settings.defaultView === "timeline" ? styles.segmentButtonActive : ""
                  }`}
                  onClick={() => updateSettings({ defaultView: "timeline" })}
                  type="button"
                >
                  <span
                    className={`${styles.segmentButtonText} ${
                      settings.defaultView === "timeline" ? styles.segmentButtonTextActive : ""
                    }`}
                  >
                    Timeline
                  </span>
                </button>
              </div>
            </SettingRow>
          </SettingsSection>

          <SettingsSection
            title="Data Management"
            icon="💾"
            id="data"
            activeSection={activeSection}
            onToggle={toggleSection}
          >
            <button
              className={`${styles.actionButton} ${isExporting ? styles.actionButtonDisabled : ""}`}
              onClick={handleExportData}
              disabled={isExporting}
              type="button"
            >
              <div className={styles.actionButtonIcon}>
                <span className={styles.actionIconText}>📤</span>
              </div>
              <div className={styles.actionButtonContent}>
                <div className={styles.actionButtonTitle}>
                  {isExporting ? "Exporting..." : "Export All Data"}
                </div>
                <div className={styles.actionButtonDescription}>
                  Download a backup of all your adventures and settings
                </div>
              </div>
              {isExporting && <div className={`${styles.spinner} ${styles.spinnerSmall}`} />}
            </button>

            <button
              className={styles.actionButton}
              onClick={handleClearCache}
              type="button"
            >
              <div className={styles.actionButtonIcon}>
                <span className={styles.actionIconText}>🗑️</span>
              </div>
              <div className={styles.actionButtonContent}>
                <div className={styles.actionButtonTitle}>Clear Cache</div>
                <div className={styles.actionButtonDescription}>Remove temporary files to free up space</div>
              </div>
            </button>

            <button
              className={styles.actionButton}
              onClick={handleResetSettings}
              type="button"
            >
              <div className={styles.actionButtonIcon}>
                <span className={styles.actionIconText}>🔄</span>
              </div>
              <div className={styles.actionButtonContent}>
                <div className={styles.actionButtonTitle}>Reset Settings</div>
                <div className={styles.actionButtonDescription}>
                  Restore all settings to default values
                </div>
              </div>
            </button>

            <button
              className={`${styles.actionButton} ${styles.dangerActionButton}`}
              onClick={handleClearAllData}
              type="button"
            >
              <div className={`${styles.actionButtonIcon} ${styles.dangerIcon}`}>
                <span className={styles.actionIconText}>⚠️</span>
              </div>
              <div className={styles.actionButtonContent}>
                <div className={`${styles.actionButtonTitle} ${styles.dangerText}`}>Delete All Data</div>
                <div className={styles.actionButtonDescription}>
                  Permanently remove all adventures and settings
                </div>
              </div>
            </button>
          </SettingsSection>

          <SettingsSection
            title="About"
            icon="ℹ️"
            id="about"
            activeSection={activeSection}
            onToggle={toggleSection}
          >
            <div className={styles.aboutContent}>
              <div className={styles.appInfo}>
                <div className={styles.appName}>Travel Log</div>
                <div className={styles.appVersion}>Version 1.0.0</div>
              </div>

              <div className={styles.aboutDescription}>
                Automatically organize your travel photos into beautiful adventures. Connect to your Immich
                server to sync your media and discover your journeys.
              </div>

              <div className={styles.aboutLinks}>
                <div className={styles.aboutLinkRow}>
                  <span className={styles.aboutLinkLabel}>AI Provider:</span>
                  <span className={styles.aboutLinkValue}>
                    {aiConfig.isConfigured
                      ? `${
                          aiConfig.provider === "anthropic"
                            ? "Anthropic Claude"
                            : aiConfig.provider === "gemini"
                            ? "Google Gemini"
                            : "OpenAI"
                        } ✅`
                      : "Not configured"}
                  </span>
                </div>
                <div className={styles.aboutLinkRow}>
                  <span className={styles.aboutLinkLabel}>Storage:</span>
                  <span className={styles.aboutLinkValue}>PostgreSQL</span>
                </div>
              </div>

              {!aiConfig.isConfigured && (
                <div className={styles.aiHint}>
                  <div className={styles.aiHintTitle}>Enable AI Features</div>
                  <div className={styles.aiHintText}>
                    Set ANTHROPIC_API_KEY in your environment to enable AI-powered summaries and
                    highlights. Get your API key at console.anthropic.com
                  </div>
                </div>
              )}
            </div>
          </SettingsSection>

          <div className={styles.bottomSpacer} />
        </div>
      </div>
    </GradientBackground>
  );
}
