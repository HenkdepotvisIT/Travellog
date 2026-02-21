import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";
import { useEffect, useRef, useState } from "react";
import { Adventure } from "../types";

const { width, height } = Dimensions.get("window");

interface MapViewModernProps {
  adventures: Adventure[];
  onAdventurePress: (id: string) => void;
}

// Leaflet map component that only renders on client
function LeafletMap({ adventures, onAdventurePress }: MapViewModernProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined" || !mapRef.current) return;

    // Dynamically import Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default;
      
      // Import Leaflet CSS
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      // Wait for CSS to load
      await new Promise(resolve => setTimeout(resolve, 100));

      // Don't reinitialize if map already exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Calculate bounds
      if (adventures.length === 0) {
        const map = L.map(mapRef.current!, {
          center: [20, 0],
          zoom: 2,
          zoomControl: true,
          attributionControl: true,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;
        setIsLoaded(true);
        return;
      }

      const lats = adventures.map((a) => a.coordinates.lat);
      const lngs = adventures.map((a) => a.coordinates.lng);
      const bounds = L.latLngBounds(
        [Math.min(...lats) - 5, Math.min(...lngs) - 10],
        [Math.max(...lats) + 5, Math.max(...lngs) + 10]
      );

      const map = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: true,
      });

      // Fit bounds with padding
      map.fitBounds(bounds, { padding: [50, 50] });

      // Add tile layer (OpenStreetMap - free, no API key needed)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Custom marker icon
      const createCustomIcon = (isHovered: boolean = false) => {
        return L.divIcon({
          className: "custom-marker",
          html: `
            <div style="
              width: 36px;
              height: 36px;
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              border-radius: 50%;
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
              cursor: pointer;
              transform: scale(${isHovered ? 1.2 : 1});
              transition: transform 0.2s ease;
            ">
              <span style="font-size: 16px;">📍</span>
            </div>
          `,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          popupAnchor: [0, -20],
        });
      };

      // Add markers for each adventure
      adventures.forEach((adventure) => {
        const marker = L.marker([adventure.coordinates.lat, adventure.coordinates.lng], {
          icon: createCustomIcon(),
        }).addTo(map);

        // Create popup content
        const popupContent = `
          <div style="
            min-width: 200px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          ">
            <h3 style="
              margin: 0 0 8px 0;
              font-size: 16px;
              font-weight: 600;
              color: #1e293b;
            ">${adventure.title}</h3>
            <p style="
              margin: 0 0 4px 0;
              font-size: 13px;
              color: #64748b;
            ">📍 ${adventure.location}</p>
            <p style="
              margin: 0 0 8px 0;
              font-size: 12px;
              color: #94a3b8;
            ">${adventure.startDate} - ${adventure.endDate}</p>
            <div style="
              display: flex;
              gap: 12px;
              font-size: 12px;
              color: #475569;
            ">
              <span>📸 ${adventure.mediaCount}</span>
              <span>📅 ${adventure.duration}d</span>
              <span>🗺️ ${adventure.distance}km</span>
            </div>
            <button 
              onclick="window.dispatchEvent(new CustomEvent('adventure-click', { detail: '${adventure.id}' }))"
              style="
                margin-top: 12px;
                width: 100%;
                padding: 8px 16px;
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
              "
            >View Adventure →</button>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: true,
          className: "custom-popup",
        });

        // Hover effects
        marker.on("mouseover", () => {
          marker.setIcon(createCustomIcon(true));
        });
        marker.on("mouseout", () => {
          marker.setIcon(createCustomIcon(false));
        });
      });

      // Draw route lines for each adventure
      adventures.forEach((adventure) => {
        if (adventure.route && adventure.route.length > 1) {
          const routeCoords = adventure.route.map((point) => [point.lat, point.lng] as [number, number]);
          L.polyline(routeCoords, {
            color: "#3b82f6",
            weight: 3,
            opacity: 0.7,
            dashArray: "10, 10",
          }).addTo(map);
        }
      });

      mapInstanceRef.current = map;
      setIsLoaded(true);
    };

    initMap();

    // Listen for adventure click events from popup buttons
    const handleAdventureClick = (e: CustomEvent) => {
      onAdventurePress(e.detail);
    };
    window.addEventListener("adventure-click", handleAdventureClick as EventListener);

    return () => {
      window.removeEventListener("adventure-click", handleAdventureClick as EventListener);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [adventures, onAdventurePress]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 28,
        overflow: "hidden",
      }}
    />
  );
}

export default function MapViewModern({
  adventures,
  onAdventurePress,
}: MapViewModernProps) {
  const legendAnimation = FadeIn.delay(300).duration(300);
  const listAnimation = FadeIn.delay(400).duration(300);

  return (
    <View style={styles.container}>
      {/* Interactive Leaflet Map */}
      <View style={styles.mapContainer}>
        <LeafletMap adventures={adventures} onAdventurePress={onAdventurePress} />
      </View>

      {/* Legend Card */}
      <Animated.View
        entering={legendAnimation}
        style={styles.legendContainer}
      >
        <BlurView intensity={80} tint="light" style={styles.legendBlur}>
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
            style={styles.legendGradient}
          >
            <Text style={styles.legendTitle}>🗺️ Your Adventures</Text>
            <Text style={styles.legendSubtitle}>
              {adventures.length} trips • Click pins for details
            </Text>
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Adventure List Overlay */}
      <Animated.View
        entering={listAnimation}
        style={styles.listContainer}
      >
        <BlurView intensity={80} tint="light" style={styles.listBlur}>
          <LinearGradient
            colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.85)"]}
            style={styles.listGradient}
          >
            {adventures.slice(0, 3).map((adventure, index) => (
              <Pressable
                key={adventure.id}
                style={[
                  styles.listItem,
                  index < 2 && styles.listItemBorder,
                ]}
                onPress={() => onAdventurePress(adventure.id)}
              >
                <View style={styles.listItemDot}>
                  <LinearGradient
                    colors={["#3b82f6", "#8b5cf6"]}
                    style={styles.listItemDotGradient}
                  />
                </View>
                <View style={styles.listItemContent}>
                  <Text style={styles.listItemTitle}>{adventure.location}</Text>
                  <Text style={styles.listItemDate}>{adventure.startDate}</Text>
                </View>
                <Text style={styles.listItemArrow}>→</Text>
              </Pressable>
            ))}
          </LinearGradient>
        </BlurView>
      </Animated.View>

      {/* Border */}
      <View style={styles.mapBorder} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: 20,
    borderRadius: 28,
    overflow: "hidden",
    position: "relative",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 28,
    overflow: "hidden",
  },
  legendContainer: {
    position: "absolute",
    top: 16,
    left: 16,
    borderRadius: 16,
    overflow: "hidden",
    zIndex: 1000,
  },
  legendBlur: {
    borderRadius: 16,
  },
  legendGradient: {
    padding: 16,
    borderRadius: 16,
  },
  legendTitle: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "bold",
  },
  legendSubtitle: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  listContainer: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: "hidden",
    zIndex: 1000,
  },
  listBlur: {
    borderRadius: 20,
  },
  listGradient: {
    padding: 8,
    borderRadius: 20,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  listItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  listItemDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    overflow: "hidden",
    marginRight: 12,
  },
  listItemDotGradient: {
    flex: 1,
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    color: "#1e293b",
    fontSize: 15,
    fontWeight: "600",
  },
  listItemDate: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  listItemArrow: {
    color: "#94a3b8",
    fontSize: 18,
  },
  mapBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
    pointerEvents: "none",
    zIndex: 999,
  },
});