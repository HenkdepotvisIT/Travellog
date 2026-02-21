import { Tabs } from "expo-router";
import { Platform, View, Text, StyleSheet, useWindowDimensions } from "react-native";

function TabIcon({ icon, focused }: { icon: string; focused: boolean }) {
  const { width } = useWindowDimensions();
  const isVerySmall = width < 350;
  
  return (
    <View style={[
      styles.iconContainer, 
      focused && styles.iconContainerActive,
      isVerySmall && styles.iconContainerSmall
    ]}>
      <Text style={[
        styles.icon, 
        focused && styles.iconActive,
        isVerySmall && styles.iconSmall
      ]}>
        {icon}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  const isVerySmall = width < 350;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopColor: "rgba(0, 0, 0, 0.1)",
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? (isVerySmall ? 16 : isSmallScreen ? 20 : 24) : (isVerySmall ? 4 : isSmallScreen ? 6 : 8),
          paddingTop: isVerySmall ? 4 : isSmallScreen ? 6 : 8,
          height: Platform.OS === "ios" ? (isVerySmall ? 72 : isSmallScreen ? 80 : 88) : (isVerySmall ? 56 : isSmallScreen ? 60 : 64),
          paddingHorizontal: isVerySmall ? 2 : isSmallScreen ? 4 : 16,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarActiveTintColor: "#3b82f6",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: {
          fontSize: isVerySmall ? 9 : isSmallScreen ? 10 : 11,
          fontWeight: "600",
          marginTop: isVerySmall ? 2 : isSmallScreen ? 2 : 2,
          lineHeight: isVerySmall ? 12 : isSmallScreen ? 13 : 14,
          paddingBottom: 2,
        },
        tabBarItemStyle: {
          paddingHorizontal: isVerySmall ? 0 : isSmallScreen ? 2 : 4,
          gap: isVerySmall ? 2 : 4,
        },
        tabBarAllowFontScaling: false,
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
          title: isVerySmall ? "Trips" : isSmallScreen ? "Trips" : "Adventures",
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
          title: isVerySmall ? "Settings" : isSmallScreen ? "Settings" : "Settings",
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
    backgroundColor: "rgba(59, 130, 246, 0.1)",
  },
  iconContainerSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  icon: {
    fontSize: 16,
  },
  iconActive: {
    fontSize: 18,
  },
  iconSmall: {
    fontSize: 14,
  },
});