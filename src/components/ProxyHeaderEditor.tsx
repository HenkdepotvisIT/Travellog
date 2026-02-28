import { ProxyHeader } from "../types";
import styles from "./ProxyHeaderEditor.module.css";

interface ProxyHeaderEditorProps {
  headers: ProxyHeader[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<ProxyHeader>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function ProxyHeaderEditor({ headers, onAdd, onUpdate, onDelete, onToggle }: ProxyHeaderEditorProps) {
  const handleDelete = (header: ProxyHeader) => {
    if (window.confirm(`Delete "${header.key || "this header"}"?`)) {
      onDelete(header.id);
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.description}>
        Add custom headers for requests to your Immich server. Useful for Cloudflare
        Tunnel authentication or other proxy configurations.
      </p>

      <div className={styles.quickAddContainer}>
        <span className={styles.quickAddLabel}>Quick Add:</span>
        <div className={styles.quickAddButtons}>
          <button className={styles.quickAddButton} onClick={onAdd}>Id</button>
          <button className={styles.quickAddButton} onClick={onAdd}>Secret</button>
        </div>
      </div>

      {headers.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyStateText}>No proxy headers configured</span>
          <span className={styles.emptyStateSubtext}>Click "Add Header" to add authentication headers</span>
        </div>
      ) : (
        <div className={styles.headerList}>
          {headers.map((header, index) => (
            <div key={header.id}>
              <div className={styles.headerRow}>
                <div className={styles.headerInputs}>
                  <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Header Name</label>
                    <input
                      className={`${styles.input} ${!header.enabled ? styles.inputDisabled : ""}`}
                      value={header.key}
                      onChange={(e) => onUpdate(header.id, { key: e.target.value })}
                      placeholder="CF-Access-Client-Id"
                      disabled={!header.enabled}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <label className={styles.inputLabel}>Value</label>
                    <input
                      className={`${styles.input} ${!header.enabled ? styles.inputDisabled : ""}`}
                      value={header.value}
                      onChange={(e) => onUpdate(header.id, { value: e.target.value })}
                      placeholder="your-client-id"
                      type={header.key.toLowerCase().includes("secret") || header.key.toLowerCase().includes("token") ? "password" : "text"}
                      disabled={!header.enabled}
                    />
                  </div>
                </div>
                <div className={styles.headerActions}>
                  <label className={styles.toggle}>
                    <input type="checkbox" checked={header.enabled} onChange={() => onToggle(header.id)} />
                    <span className={styles.toggleSlider} />
                  </label>
                  <button className={styles.deleteButton} onClick={() => handleDelete(header)}>🗑️</button>
                </div>
              </div>
              {index < headers.length - 1 && <div className={styles.divider} />}
            </div>
          ))}
        </div>
      )}

      <button className={styles.addButton} onClick={onAdd}>
        <span className={styles.addButtonIcon}>+</span>
        <span className={styles.addButtonText}>Add Header</span>
      </button>

      <div className={styles.infoBox}>
        <h4 className={styles.infoTitle}>💡 Cloudflare Tunnel Setup</h4>
        <p className={styles.infoText}>
          If using Cloudflare Access, add these headers:<br />
          • CF-Access-Client-Id<br />
          • CF-Access-Client-Secret<br /><br />
          Get these from your Cloudflare Zero Trust dashboard under Access → Service Auth.
        </p>
      </div>
    </div>
  );
}
