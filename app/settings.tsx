import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useImmichConnection } from "../hooks/useImmichConnection";
import { useSettings } from "../hooks/useSettings";

export default function SettingsScreen() {
  const { isConnected, serverUrl, apiKey, connect, disconnect, testConnection } =
    useImmichConnection();
  const { settings, updateSettings } = useSettings();

  const [newServerUrl, setNewServerUrl] = useState(serverUrl || "");
  const [newApiKey, setNewApiKey] = useState(apiKey || "");
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    setIsTesting(true);
    const result = await testConnection(newServerUrl, newApiKey);
    setIsTesting(false);
    Alert.alert(
      result.success ? "Success" : "Error",
      result.message
    );
  };

  const handleConnect = async () => {
    if (!newServerUrl || !newApiKey) {
      Alert.alert("Error", "Please enter both server URL and API key");
      return;
    }
    await connect(newServerUrl, newApiKey);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Immich Connection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Immich Connection</Text>

          <View style={styles.connectionStatus}>
            <View
              style={[
                styles.statusDot,
                isConnected ? styles.statusConnected : styles.statusDisconnected,
              ]}
            />
            <Text style={styles.statusText}>
              {isConnected ? "Connected" : "Not Connected"}
            </Text>
          </View>

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
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>API Key</Text>
            <TextInput
              style={styles.input}
              value={newApiKey}
              onChangeText={setNewApiKey}
              placeholder="Your Immich API key"
              placeholderTextColor="#64748b"
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.testButton]}
              onPress={handleTestConnection}
              disabled={isTesting}
            >
              <Text style={styles.testButtonText}>
                {isTesting ? "Testing..." : "Test Connection"}
              </Text>
            </Pressable>

            {isConnected ? (
              <Pressable
                style={[styles.button, styles.disconnectButton]}
                onPress={disconnect}
              >
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.button, styles.connectButton]}
                onPress={handleConnect}
              >
                <Text style={styles.connectButtonText}>Connect</Text>
              </Pressable>
            )}
          </View>
        </View>

        {/* Clustering Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗺️ Adventure Clustering</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Time Window (hours)</Text>
              <Text style={styles.settingDescription}>
                Photos within this time are grouped together
              </Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={String(settings.clusterTimeWindow)}
              onChangeText={(v) =>
                updateSettings({ clusterTimeWindow: parseInt(v) || 24 })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Distance Threshold (km)</Text>
              <Text style={styles.settingDescription}>
                Maximum distance between photos in same adventure
              </Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={String(settings.clusterDistanceKm)}
              onChangeText={(v) =>
                updateSettings({ clusterDistanceKm: parseInt(v) || 50 })
              }
              keyboardType="numeric"
            />
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Minimum Photos</Text>
              <Text style={styles.settingDescription}>
                Minimum photos to create an adventure
              </Text>
            </View>
            <TextInput
              style={styles.numberInput}
              value={String(settings.minPhotosPerAdventure)}
              onChangeText={(v) =>
                updateSettings({ minPhotosPerAdventure: parseInt(v) || 5 })
              }
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Display Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎨 Display</Text>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Show Route Lines</Text>
              <Text style={styles.settingDescription}>
                Display travel routes on map
              </Text>
            </View>
            <Switch
              value={settings.showRouteLines}
              onValueChange={(v) => updateSettings({ showRouteLines: v })}
              trackColor={{ false: "#334155", true: "#3b82f6" }}
              thumbColor="#ffffff"
            />
          </View>

          <View style={styles.settingRow}>
            <View>
              <Text style={styles.settingLabel}>Auto-generate Summaries</Text>
              <Text style={styles.settingDescription}>
                Use AI to create adventure narratives
              </Text>
            </View>
            <Switch
              value={settings.autoGenerateSummaries}
              onValueChange={(v) => updateSettings({ autoGenerateSummaries: v })}
              trackColor={{ false: "#334155", true: "#3b82f6" }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* Cache & Data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Cache & Data</Text>

          <Pressable style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Clear Thumbnail Cache</Text>
          </Pressable>

          <Pressable style={[styles.dangerButton, { marginTop: 12 }]}>
            <Text style={styles.dangerButtonText}>Re-scan All Media</Text>
          </Pressable>
        </View>

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
    paddingBottom: 16,
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
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 16,
  },
  connectionStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusConnected: {
    backgroundColor: "#22c55e",
  },
  statusDisconnected: {
    backgroundColor: "#ef4444",
  },
  statusText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#0f172a",
    borderRadius: 10,
    padding: 14,
    color: "#ffffff",
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  testButton: {
    backgroundColor: "#334155",
  },
  testButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  connectButton: {
    backgroundColor: "#3b82f6",
  },
  connectButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  disconnectButton: {
    backgroundColor: "#ef4444",
  },
  disconnectButtonText: {
    color: "#ffffff",
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  settingLabel: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
  settingDescription: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
    maxWidth: 220,
  },
  numberInput: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: "#ffffff",
    fontSize: 16,
    width: 70,
    textAlign: "center",
  },
  dangerButton: {
    backgroundColor: "#7f1d1d",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#fca5a5",
    fontWeight: "600",
  },
});