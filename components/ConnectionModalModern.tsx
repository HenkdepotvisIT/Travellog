import { useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  FadeIn,
  SlideInDown,
} from "react-native-reanimated";
import AnimatedButton from "./ui/AnimatedButton";

interface ConnectionModalModernProps {
  visible: boolean;
  onClose: () => void;
  onConnect: (url: string, apiKey: string) => Promise<{ success: boolean; message: string }>;
  onDisconnect: () => void;
  isConnected: boolean;
  currentUrl: string | null;
}

export default function ConnectionModalModern({
  visible,
  onClose,
  onConnect,
  onDisconnect,
  isConnected,
  currentUrl,
}: ConnectionModalModernProps) {
  const [serverUrl, setServerUrl] = useState(currentUrl || "");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);

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

  // Use simpler animation on web
  const modalEntering = Platform.OS === "web"
    ? FadeIn.duration(200)
    : SlideInDown.springify().damping(15);

  return (
    <Modal
      visible={visible}
      animationType={Platform.OS === "web" ? "fade" : "none"}
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
          
          <Animated.View
            entering={modalEntering}
            style={styles.modalContainer}
          >
            <BlurView intensity={100} tint="dark" style={styles.modalBlur}>
              <LinearGradient
                colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.02)"]}
                style={styles.modalGradient}
              >
                {/* Handle */}
                <View style={styles.handle} />

                {/* Header */}
                <View style={styles.header}>
                  <View style={styles.headerIcon}>
                    <LinearGradient
                      colors={isConnected ? ["#22c55e", "#16a34a"] : ["#3b82f6", "#2563eb"]}
                      style={styles.headerIconGradient}
                    >
                      <Text style={styles.headerIconText}>
                        {isConnected ? "✓" : "🔗"}
                      </Text>
                    </LinearGradient>
                  </View>
                  <Text style={styles.title}>
                    {isConnected ? "Connected to Immich" : "Connect to Immich"}
                  </Text>
                  <Pressable onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                  </Pressable>
                </View>

                {isConnected ? (
                  <View style={styles.connectedContent}>
                    <View style={styles.statusCard}>
                      <BlurView intensity={40} tint="dark" style={styles.statusCardBlur}>
                        <View style={styles.statusRow}>
                          <View style={styles.statusDot} />
                          <Text style={styles.statusText}>Connected</Text>
                        </View>
                        <Text style={styles.serverUrlText}>{currentUrl}</Text>
                      </BlurView>
                    </View>

                    <AnimatedButton
                      title="Disconnect"
                      icon="🔌"
                      variant="danger"
                      onPress={handleDisconnect}
                      style={{ marginTop: 20 }}
                    />
                  </View>
                ) : (
                  <View style={styles.formContent}>
                    <Text style={styles.description}>
                      Connect to your Immich server to automatically discover and 
                      organize your travel photos into adventures.
                    </Text>

                    {/* Server URL Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Server URL</Text>
                      <View style={styles.inputContainer}>
                        <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                          <TextInput
                            style={styles.input}
                            value={serverUrl}
                            onChangeText={setServerUrl}
                            placeholder="https://your-immich-server.com"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                          />
                        </BlurView>
                      </View>
                    </View>

                    {/* API Key Input */}
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>API Key</Text>
                      <View style={styles.inputContainer}>
                        <BlurView intensity={40} tint="dark" style={styles.inputBlur}>
                          <View style={styles.passwordRow}>
                            <TextInput
                              style={styles.passwordInput}
                              value={apiKey}
                              onChangeText={setApiKey}
                              placeholder="Your Immich API key"
                              placeholderTextColor="rgba(255,255,255,0.3)"
                              secureTextEntry={!showApiKey}
                              autoCapitalize="none"
                              autoCorrect={false}
                            />
                            <Pressable
                              onPress={() => setShowApiKey(!showApiKey)}
                              style={styles.eyeButton}
                            >
                              <Text style={styles.eyeButtonText}>
                                {showApiKey ? "🙈" : "👁️"}
                              </Text>
                            </Pressable>
                          </View>
                        </BlurView>
                      </View>
                      <Text style={styles.inputHint}>
                        Find your API key in Immich → Account Settings → API Keys
                      </Text>
                    </View>

                    {error && (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>⚠️ {error}</Text>
                      </View>
                    )}

                    <View style={styles.actions}>
                      <AnimatedButton
                        title={isLoading ? "Connecting..." : "Connect"}
                        icon={isLoading ? undefined : "🚀"}
                        variant="primary"
                        onPress={handleConnect}
                        disabled={isLoading}
                        size="lg"
                      />

                      <Pressable style={styles.skipButton} onPress={onClose}>
                        <Text style={styles.skipButtonText}>
                          Skip for now (use demo data)
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </BlurView>
            <View style={styles.modalBorder} />
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: "hidden",
  },
  modalBlur: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  modalGradient: {
    padding: 24,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: "hidden",
    marginRight: 16,
  },
  headerIconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerIconText: {
    fontSize: 24,
    color: "#ffffff",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
  connectedContent: {
    paddingBottom: 20,
  },
  statusCard: {
    borderRadius: 16,
    overflow: "hidden",
  },
  statusCardBlur: {
    padding: 20,
    borderRadius: 16,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    marginRight: 10,
    shadowColor: "#22c55e",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
  },
  statusText: {
    color: "#22c55e",
    fontWeight: "600",
    fontSize: 16,
  },
  serverUrlText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  formContent: {
    paddingBottom: 20,
  },
  description: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  inputContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  inputBlur: {
    borderRadius: 16,
  },
  input: {
    padding: 18,
    color: "#ffffff",
    fontSize: 16,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  passwordInput: {
    flex: 1,
    padding: 18,
    color: "#ffffff",
    fontSize: 16,
  },
  eyeButton: {
    padding: 18,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  inputHint: {
    color: "rgba(255, 255, 255, 0.4)",
    fontSize: 12,
    marginTop: 8,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  errorText: {
    color: "#fca5a5",
    fontSize: 14,
  },
  actions: {
    gap: 16,
    marginTop: 8,
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  skipButtonText: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 14,
  },
  modalBorder: {
    ...StyleSheet.absoluteFillObject,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(255, 255, 255, 0.1)",
    pointerEvents: "none",
  },
});