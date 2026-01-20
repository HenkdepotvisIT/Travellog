import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet, useWindowDimensions } from "react-native";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.icon, focused && styles.iconActive]}>{icon}</Text>
    </View>
  );
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? (isSmallScreen ? 20 : 24) : (isSmallScreen ? 4 : 8),
          paddingTop: isSmallScreen ? 4 : 8,
          height: Platform.OS === "ios" ? (isSmallScreen ? 80 : 88) : (isSmallScreen ? 56 : 64),
          paddingHorizontal: isSmallScreen ? 8 : 16,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.5)",
        tabBarLabelStyle: {
          fontSize: isSmallScreen ? 10 : 11,
          fontWeight: "600",
          marginTop: isSmallScreen ? 1 : 2,
        },
        tabBarItemStyle: {
          paddingHorizontal: isSmallScreen ? 2 : 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="adventures"
        options={{
          title: isSmallScreen ? "Trips" : "Adventures",
          tabBarIcon: ({ focused }) => <TabIcon icon="🌍" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: isSmallScreen ? "Config" : "Settings",
          tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerActive: {
    backgroundColor: "rgba(59, 130, 246, 0.2)",
  },
  icon: {
    fontSize: 16,
  },
  iconActive: {
    fontSize: 18,
  },
});