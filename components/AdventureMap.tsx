import { View, Text, StyleSheet, Dimensions, Platform } from "react-native";
import { Coordinates, StopPoint } from "../types";
import { useEffect, useRef, useState } from "react";

const { width } = Dimensions.get("window");

interface AdventureMapProps {
  route: Coordinates[];
  stops: StopPoint[];
}

// Web Leaflet map component
function WebLeafletMap({ route, stops }: AdventureMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        // Import Leaflet CSS
        if (!document.getElementById("leaflet-css")) {
          const link = document.createElement("link");
          link.id = "leaflet-css";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        await new Promise(resolve => setTimeout(resolve, 200));

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Calculate bounds from route and stops
        const allPoints = [...route, ...stops];
        
        if (allPoints.length === 0) {
          const map = L.map(mapRef.current!, {
            center: [20, 0],
            zoom: 2,
          });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; OpenStreetMap',
          }).addTo(map);
          mapInstanceRef.current = map;
          return;
        }

        const lats = allPoints.map(p => p.lat);
        const lngs = allPoints.map(p => p.lng);
        const bounds = L.latLngBounds(
          [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
          [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5]
        );

        const map = L.map(mapRef.current!, {
          zoomControl: true,
        });

        map.fitBounds(bounds, { padding: [30, 30] });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        // Draw route line
        if (route.length > 1) {
          const routeCoords = route.map(p => [p.lat, p.lng] as [number, number]);
          L.polyline(routeCoords, {
            color: "#3b82f6",
            weight: 4,
            opacity: 0.8,
          }).addTo(map);
        }

        // Add stop markers
        stops.forEach((stop, index) => {
          const marker = L.marker([stop.lat, stop.lng], {
            icon: L.divIcon({
              className: "custom-stop-marker",
              html: `
                <div style="
                  width: 32px;
                  height: 32px;
                  background: linear-gradient(135deg, #3b82f6, #2563eb);
                  border-radius: 50%;
                  border: 3px solid white;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.5);
                  color: white;
                  font-weight: bold;
                  font-size: 14px;
                ">
                  ${index + 1}
                </div>
              `,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            }),
          }).addTo(map);

          marker.bindPopup(`
            <div style="font-family: -apple-system, sans-serif; min-width: 120px;">
              <strong style="font-size: 14px;">${stop.name}</strong>
              <p style="margin: 4px 0 0; color: #64748b; font-size: 12px;">${stop.photos} photos</p>
            </div>
          `);
        });

        mapInstanceRef.current = map;
      } catch (error) {
        console.error("Failed to initialize adventure map:", error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [route, stops]);

  return (
    <div
      ref={mapRef}
      style={{
        width: "100%",
        height: 300,
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#1e3a5f",
      }}
    />
  );
}

// Native fallback component (simple visualization)
function NativeMapFallback({ route, stops }: AdventureMapProps) {
  if (route.length === 0 && stops.length === 0) {
    return (
      <View style={styles.emptyMap}>
        <Text style={styles.emptyMapText}>🗺️</Text>
        <Text style={styles.emptyMapSubtext}>No route data available</Text>
      </View>
    );
  }

  const allPoints = [...route, ...stops];
  const lats = allPoints.map((p) => p.lat);
  const lngs = allPoints.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const mapWidth = width - 40;
  const mapHeight = 300;

  const getPosition = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * (mapWidth - 60) + 30;
    const y = ((maxLat - lat) / (maxLat - minLat || 1)) * (mapHeight - 60) + 30;
    return { x, y };
  };

  return (
    <View style={[styles.mapContainer, { width: mapWidth, height: mapHeight }]}>
      <View style={styles.mapBackground} />

      {/* Route line */}
      {route.length > 1 && (
        <View style={styles.routeContainer}>
          {route.slice(0, -1).map((point, index) => {
            const start = getPosition(point.lat, point.lng);
            const end = getPosition(route[index + 1].lat, route[index + 1].lng);
            const length = Math.sqrt(
              Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
            );
            const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI);

            return (
              <View
                key={index}
                style={[
                  styles.routeLine,
                  {
                    left: start.x,
                    top: start.y,
                    width: length,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}
        </View>
      )}

      {/* Stop markers */}
      {stops.map((stop, index) => {
        const pos = getPosition(stop.lat, stop.lng);
        return (
          <View
            key={index}
            style={[
              styles.stopMarker,
              {
                left: pos.x - 20,
                top: pos.y - 20,
              },
            ]}
          >
            <View style={styles.markerDot}>
              <Text style={styles.markerNumber}>{index + 1}</Text>
            </View>
            <View style={styles.markerLabel}>
              <Text style={styles.markerName}>{stop.name}</Text>
              <Text style={styles.markerPhotos}>{stop.photos} photos</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// Shared stops list component
function StopsList({ stops }: { stops: StopPoint[] }) {
  if (stops.length === 0) return null;

  return (
    <View style={styles.stopsList}>
      <Text style={styles.stopsTitle}>📍 Stops</Text>
      {stops.map((stop, index) => (
        <View key={index} style={styles.stopItem}>
          <View style={styles.stopNumber}>
            <Text style={styles.stopNumberText}>{index + 1}</Text>
          </View>
          <View style={styles.stopInfo}>
            <Text style={styles.stopName}>{stop.name}</Text>
            <Text style={styles.stopPhotos}>{stop.photos} photos</Text>
          </View>
          {index < stops.length - 1 && <View style={styles.stopConnector} />}
        </View>
      ))}
    </View>
  );
}

export default function AdventureMap(props: AdventureMapProps) {
  return (
    <View style={styles.container}>
      {Platform.OS === "web" ? (
        <WebLeafletMap {...props} />
      ) : (
        <NativeMapFallback {...props} />
      )}
      <StopsList stops={props.stops} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  mapContainer: {
    backgroundColor: "#1e3a5f",
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  mapBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1e3a5f",
  },
  emptyMap: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1e3a5f",
    borderRadius: 16,
  },
  emptyMapText: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyMapSubtext: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 14,
  },
  routeContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  routeLine: {
    position: "absolute",
    height: 3,
    backgroundColor: "#3b82f6",
    transformOrigin: "left center",
  },
  stopMarker: {
    position: "absolute",
    alignItems: "center",
  },
  markerDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  markerNumber: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  markerLabel: {
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 4,
  },
  markerName: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
  },
  markerPhotos: {
    color: "#94a3b8",
    fontSize: 8,
  },
  stopsList: {
    backgroundColor: "#1e293b",
    borderRadius: 16,
    padding: 16,
  },
  stopsTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  stopItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
    position: "relative",
  },
  stopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stopNumberText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 12,
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  stopPhotos: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  stopConnector: {
    position: "absolute",
    left: 13,
    top: 28,
    width: 2,
    height: 24,
    backgroundColor: "#334155",
  },
});