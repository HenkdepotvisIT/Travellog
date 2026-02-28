import { useEffect, useRef } from "react";
import { Adventure } from "../types";
import styles from "./MapViewModern.module.css";

interface MapViewModernProps {
  adventures: Adventure[];
  onAdventurePress: (id: string) => void;
}

function LeafletMap({ adventures, onAdventurePress }: MapViewModernProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        if (adventures.length === 0) {
          const map = L.map(mapRef.current!, { center: [20, 0], zoom: 2 });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }).addTo(map);
          mapInstanceRef.current = map;
          return;
        }

        const lats = adventures.map((a) => a.coordinates.lat);
        const lngs = adventures.map((a) => a.coordinates.lng);
        const bounds = L.latLngBounds(
          [Math.min(...lats) - 5, Math.min(...lngs) - 10],
          [Math.max(...lats) + 5, Math.max(...lngs) + 10]
        );

        const map = L.map(mapRef.current!, { zoomControl: true });
        map.fitBounds(bounds, { padding: [50, 50] });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        const createCustomIcon = (isHovered = false) =>
          L.divIcon({
            className: "custom-marker",
            html: `<div style="width:36px;height:36px;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(59,130,246,0.5);cursor:pointer;transform:scale(${isHovered ? 1.2 : 1});transition:transform 0.2s;"><span style="font-size:16px;">📍</span></div>`,
            iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20],
          });

        adventures.forEach((adventure) => {
          const marker = L.marker([adventure.coordinates.lat, adventure.coordinates.lng], {
            icon: createCustomIcon(),
          }).addTo(map);

          marker.bindPopup(`
            <div style="min-width:200px;font-family:-apple-system,sans-serif;">
              <h3 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#1e293b;">${adventure.title}</h3>
              <p style="margin:0 0 4px;font-size:13px;color:#64748b;">📍 ${adventure.location}</p>
              <p style="margin:0 0 8px;font-size:12px;color:#94a3b8;">${adventure.startDate} - ${adventure.endDate}</p>
              <div style="display:flex;gap:12px;font-size:12px;color:#475569;">
                <span>📸 ${adventure.mediaCount}</span>
                <span>📅 ${adventure.duration}d</span>
                <span>🗺️ ${adventure.distance}km</span>
              </div>
              <button onclick="window.dispatchEvent(new CustomEvent('adventure-click',{detail:'${adventure.id}'}))" style="margin-top:12px;width:100%;padding:8px 16px;background:linear-gradient(135deg,#3b82f6,#2563eb);color:white;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">View Adventure →</button>
            </div>
          `, { closeButton: true });

          marker.on("mouseover", () => marker.setIcon(createCustomIcon(true)));
          marker.on("mouseout", () => marker.setIcon(createCustomIcon(false)));
        });

        adventures.forEach((adventure) => {
          if (adventure.route && adventure.route.length > 1) {
            L.polyline(adventure.route.map((p) => [p.lat, p.lng] as [number, number]), {
              color: "#3b82f6", weight: 3, opacity: 0.7, dashArray: "10, 10",
            }).addTo(map);
          }
        });

        mapInstanceRef.current = map;
      } catch (error) {
        console.error("Failed to initialize Leaflet map:", error);
      }
    };

    initMap();

    const handleAdventureClick = (e: CustomEvent) => onAdventurePress(e.detail);
    window.addEventListener("adventure-click", handleAdventureClick as EventListener);

    return () => {
      window.removeEventListener("adventure-click", handleAdventureClick as EventListener);
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [adventures, onAdventurePress]);

  return <div ref={mapRef} className={styles.leafletMap} />;
}

export default function MapViewModern({ adventures, onAdventurePress }: MapViewModernProps) {
  return (
    <div className={styles.container}>
      <div className={styles.mapContainer}>
        <LeafletMap adventures={adventures} onAdventurePress={onAdventurePress} />
      </div>

      <div className={styles.legendContainer}>
        <h3 className={styles.legendTitle}>🗺️ Your Adventures</h3>
        <p className={styles.legendSubtitle}>{adventures.length} trips • Click pins for details</p>
      </div>

      <div className={styles.listContainer}>
        {adventures.slice(0, 3).map((adventure, index) => (
          <button
            key={adventure.id}
            className={`${styles.listItem} ${index < 2 ? styles.listItemBorder : ""}`}
            onClick={() => onAdventurePress(adventure.id)}
          >
            <div className={styles.listItemDot} />
            <div className={styles.listItemContent}>
              <span className={styles.listItemTitle}>{adventure.location}</span>
              <span className={styles.listItemDate}>{adventure.startDate}</span>
            </div>
            <span className={styles.listItemArrow}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
}
