import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
  Alert,
} from "react-native";
import { ProxyHeader } from "../types";

interface ProxyHeaderEditorProps {
  headers: ProxyHeader[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<ProxyHeader>) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export default function ProxyHeaderEditor({
  headers,
  onAdd,
  onUpdate,
  onDelete,
  onToggle,
}: ProxyHeaderEditorProps) {
  const handleDelete = (header: ProxyHeader) => {
    Alert.alert(
      "Delete Header",
      `Are you sure you want to delete "${header.key || "this header"}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(header.id) },
      ]
    );
  };

  const commonHeaders = [
    { key: "CF-Access-Client-Id", description: "Cloudflare Access Client ID" },
    { key: "CF-Access-Client-Secret", description: "Cloudflare Access Client Secret" },
    { key: "Authorization", description: "Bearer token or basic auth" },
    { key: "X-Custom-Header", description: "Custom header" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.description}>
        Add custom headers for requests to your Immich server. Useful for Cloudflare 
        Tunnel authentication or other proxy configurations.
      </Text>

      {/* Quick Add Buttons */}
      <View style={styles.quickAddContainer}>
        <Text style={styles.quickAddLabel}>Quick Add:</Text>
        <View style={styles.quickAddButtons}>
          {commonHeaders.slice(0, 2).map((common) => (
            <Pressable
              key={common.key}
              style={styles.quickAddButton}
              onPress={() => {
                onAdd();
                // The new header will be added, user can then fill in the value
              }}
            >
              <Text style={styles.quickAddButtonText}>{common.key.split("-").pop()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Header List */}
      {headers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No proxy headers configured</Text>
          <Text style={styles.emptyStateSubtext}>
            Tap "Add Header" to add authentication headers
          </Text>
        </View>
      ) : (
        <View style={styles.headerList}>
          {headers.map((header, index) => (
            <View key={header.id} style={styles.headerItem}>
              <View style={styles.headerRow}>
                <View style={styles.headerInputs}>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Header Name</Text>
                    <TextInput
                      style={[styles.input, !header.enabled && styles.inputDisabled]}
                      value={header.key}
                      onChangeText={(text) => onUpdate(header.id, { key: text })}
                      placeholder="CF-Access-Client-Id"
                      placeholderTextColor="#64748b"
                      autoCapitalize="none"
                      autoCorrect={false}
                      editable={header.enabled}
                    />
                  </View>
                  <View style={styles.inputWrapper}>
                    <Text style={styles.inputLabel}>Value</Text>
                    <TextInput
                      style={[styles.input, !header.enabled && styles.inputDisabled]}
                      value={header.value}
                      onChangeText={(text) => onUpdate(header.id, { value: text })}
                      placeholder="your-client-id"
                      placeholderTextColor="#64748b"
                      autoCapitalize="none"
                      autoCorrect={false}
                      secureTextEntry={header.key.toLowerCase().includes("secret") || 
                                       header.key.toLowerCase().includes("token") ||
                                       header.key.toLowerCase().includes("password")}
                      editable={header.enabled}
                    />
                  </View>
                </View>
                <View style={styles.headerActions}>
                  <Switch
                    value={header.enabled}
                    onValueChange={() => onToggle(header.id)}
                    trackColor={{ false: "#334155", true: "#3b82f6" }}
                    thumbColor="#ffffff"
                  />
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => handleDelete(header)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </Pressable>
                </View>
              </View>
              {index < headers.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>
      )}

      {/* Add Button */}
      <Pressable style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonIcon}>+</Text>
        <Text style={styles.addButtonText}>Add Header</Text>
      </Pressable>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 Cloudflare Tunnel Setup</Text>
        <Text style={styles.infoText}>
          If using Cloudflare Access, add these headers:{"\n"}
          • CF-Access-Client-Id{"\n"}
          • CF-Access-Client-Secret{"\n\n"}
          Get these from your Cloudflare Zero Trust dashboard under Access → Service Auth.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
  },
  description: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  quickAddContainer: {
    marginBottom: 16,
  },
  quickAddLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 8,
  },
  quickAddButtons: {
    flexDirection: "row",
    gap: 8,
  },
  quickAddButton: {
    backgroundColor: "#334155",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickAddButtonText: {
    color: "#94a3b8",
    fontSize: 12,
  },
  emptyState: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },
  emptyStateText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyStateSubtext: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  headerList: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  headerItem: {
    marginBottom: 8,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  headerInputs: {
    flex: 1,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
  },
  inputLabel: {
    color: "#64748b",
    fontSize: 11,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    padding: 12,
    color: "#ffffff",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
  inputDisabled: {
    opacity: 0.5,
  },
  headerActions: {
    marginLeft: 12,
    alignItems: "center",
    gap: 8,
    paddingTop: 20,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: "#334155",
    marginVertical: 16,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#334155",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    gap: 8,
  },
  addButtonIcon: {
    color: "#3b82f6",
    fontSize: 20,
    fontWeight: "600",
  },
  addButtonText: {
    color: "#3b82f6",
    fontSize: 15,
    fontWeight: "600",
  },
  infoBox: {
    backgroundColor: "#1e3a5f",
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  infoTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  infoText: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 20,
  },
});