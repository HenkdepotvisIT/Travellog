import { View, Text, StyleSheet } from "react-native";

interface StatsCardProps {
  icon: string;
  value: string | number;
  label: string;
}

export default function StatsCard({ icon, value, label }: StatsCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  icon: {
    fontSize: 20,
    marginBottom: 4,
  },
  value: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  label: {
    color: "#64748b",
    fontSize: 10,
    marginTop: 2,
  },
});