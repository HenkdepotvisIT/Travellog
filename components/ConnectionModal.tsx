import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

interface ConnectionModalProps {
  visible: boolean;
  onClose: () => void;
  onConnect: (url: string, apiKey: string) => Promise<{ success: boolean; message: string }>;
  onDisconnect: () => void;
  isConnected: boolean;
  currentUrl: string | null;
}

export default function ConnectionModal({
  visible,
  onClose,
  onConnect,
  onDisconnect,
  isConnected,
  currentUrl,
}: ConnectionModalProps) {
  const [serverUrl, setServerUrl] = useState(currentUrl || "");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!serverUrl || !apiKey) {
      setError("Please enter both server URL and API key");
      return;
    }

    setIsLoading(true);
    setError(null);

    const result = await onConnect(serverUrl, apiKey);

    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  const handleDisconnect = () => {
    onDisconnect();
    setServerUrl("");
    setApiKey("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isConnected ? "Immich Connected" : "Connect to Immich"}
            </Text>
            <Pressable onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </Pressable>
          </View>

          {isConnected ? (
            <View>
              <View style={styles.connectedStatus}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Connected</Text>
              </View>
              <Text style={styles.connectedUrl}>{currentUrl}</Text>

              <Pressable style={styles.disconnectButton} onPress={handleDisconnect}>
                <Text style={styles.disconnectButtonText}>Disconnect</Text>
              </Pressable>
            </View>
          ) : (
            <View>
              <Text style={styles.description}>
                Connect to your Immich server to automatically discover and organize
                your travel photos into adventures.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Server URL</Text>
                <TextInput
                  style={styles.input}
                  value={serverUrl}
                  onChangeText={setServerUrl}
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
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="Your Immich API key"
                  placeholderTextColor="#64748b"
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Text style={styles.inputHint}>
                  Find your API key in Immich → Account Settings → API Keys
                </Text>
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}

              <Pressable
                style={[styles.connectButton, isLoading && styles.connectButtonDisabled]}
                onPress={handleConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.connectButtonText}>Connect</Text>
                )}
              </Pressable>

              <Pressable style={styles.skipButton} onPress={onClose}>
                <Text style={styles.skipButtonText}>Skip for now (use demo data)</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#1e293b",
    borderRadius: 20,
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    color: "#94a3b8",
    fontSize: 20,
  },
  description: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
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
  inputHint: {
    color: "#64748b",
    fontSize: 11,
    marginTop: 6,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 13,
    marginBottom: 16,
  },
  connectButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  connectButtonDisabled: {
    opacity: 0.7,
  },
  connectButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  skipButton: {
    paddingVertical: 16,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#64748b",
    fontSize: 14,
  },
  connectedStatus: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
    marginRight: 8,
  },
  statusText: {
    color: "#22c55e",
    fontWeight: "600",
  },
  connectedUrl: {
    color: "#94a3b8",
    fontSize: 14,
    marginBottom: 24,
  },
  disconnectButton: {
    backgroundColor: "#7f1d1d",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  disconnectButtonText: {
    color: "#fca5a5",
    fontWeight: "600",
  },
});