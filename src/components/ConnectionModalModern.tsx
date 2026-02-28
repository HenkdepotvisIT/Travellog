import { useState } from "react";
import AnimatedButton from "./ui/AnimatedButton";
import styles from "./ConnectionModalModern.module.css";

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

  if (!visible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />

        <div className={styles.header}>
          <div
            className={styles.headerIcon}
            style={{
              background: isConnected
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "linear-gradient(135deg, #3b82f6, #2563eb)",
            }}
          >
            <span className={styles.headerIconText}>
              {isConnected ? "✓" : "🔗"}
            </span>
          </div>
          <h2 className={styles.title}>
            {isConnected ? "Connected to Immich" : "Connect to Immich"}
          </h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        {isConnected ? (
          <div className={styles.connectedContent}>
            <div className={styles.statusCard}>
              <div className={styles.statusRow}>
                <div className={styles.statusDot} />
                <span className={styles.statusText}>Connected</span>
              </div>
              <span className={styles.serverUrlText}>{currentUrl}</span>
            </div>

            <AnimatedButton
              title="Disconnect"
              icon="🔌"
              variant="danger"
              onPress={handleDisconnect}
              style={{ marginTop: 20 }}
            />
          </div>
        ) : (
          <div className={styles.formContent}>
            <p className={styles.description}>
              Connect to your Immich server to automatically discover and
              organize your travel photos into adventures.
            </p>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Server URL</label>
              <input
                className={styles.input}
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="https://your-immich-server.com"
                autoCapitalize="none"
                autoCorrect="off"
                type="url"
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>API Key</label>
              <div className={styles.passwordRow}>
                <input
                  className={styles.passwordInput}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your Immich API key"
                  type={showApiKey ? "text" : "password"}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <button
                  className={styles.eyeButton}
                  onClick={() => setShowApiKey(!showApiKey)}
                  type="button"
                >
                  {showApiKey ? "🙈" : "👁️"}
                </button>
              </div>
              <span className={styles.inputHint}>
                Find your API key in Immich → Account Settings → API Keys
              </span>
            </div>

            {error && (
              <div className={styles.errorContainer}>
                <span className={styles.errorText}>⚠️ {error}</span>
              </div>
            )}

            <div className={styles.actions}>
              <AnimatedButton
                title={isLoading ? "Connecting..." : "Connect"}
                icon={isLoading ? undefined : "🚀"}
                variant="primary"
                onPress={handleConnect}
                disabled={isLoading}
                size="lg"
              />

              <button className={styles.skipButton} onClick={onClose}>
                Skip for now (use demo data)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
