import { Coordinates, StopPoint } from "../types";
import { useEffect, useRef } from "react";
import styles from "./AdventureMap.module.css";

interface AdventureMapProps {
  route: Coordinates[];
  stops: StopPoint[];
}

function LeafletMap({ route, stops }: AdventureMapProps) {
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

        const allPoints = [...route, ...stops];

        if (allPoints.length === 0) {
          const map = L.map(mapRef.current!, { center: [20, 0], zoom: 2 });
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap",
          }).addTo(map);
          mapInstanceRef.current = map;
          return;
        }

        const lats = allPoints.map((p) => p.lat);
        const lngs = allPoints.map((p) => p.lng);
        const bounds = L.latLngBounds(
          [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
          [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5]
        );

        const map = L.map(mapRef.current!, { zoomControl: true });
        map.fitBounds(bounds, { padding: [30, 30] });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map);

        if (route.length > 1) {
          L.polyline(route.map((p) => [p.lat, p.lng] as [number, number]), {
            color: "#3b82f6", weight: 4, opacity: 0.8,
          }).addTo(map);
        }

        stops.forEach((stop, index) => {
          const marker = L.marker([stop.lat, stop.lng], {
            icon: L.divIcon({
              className: "custom-stop-marker",
              html: `<div style="width:32px;height:32px;background:linear-gradient(135deg,#3b82f6,#2563eb);border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(59,130,246,0.5);color:white;font-weight:bold;font-size:14px;">${index + 1}</div>`,
              iconSize: [32, 32], iconAnchor: [16, 16],
            }),
          }).addTo(map);

          marker.bindPopup(`<div style="font-family:-apple-system,sans-serif;min-width:120px;"><strong style="font-size:14px;">${stop.name}</strong><p style="margin:4px 0 0;color:#64748b;font-size:12px;">${stop.photos} photos</p></div>`);
        });

        mapInstanceRef.current = map;
      } catch (error) {
        console.error("Failed to initialize adventure map:", error);
      }
    };

    initMap();
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; }
    };
  }, [route, stops]);

  return <div ref={mapRef} className={styles.leafletMap} />;
}

function StopsList({ stops }: { stops: StopPoint[] }) {
  if (stops.length === 0) return null;

  return (
    <div className={styles.stopsList}>
      <h3 className={styles.stopsTitle}>📍 Stops</h3>
      {stops.map((stop, index) => (
        <div key={index} className={styles.stopItem}>
          <div className={styles.stopNumber}>
            <span className={styles.stopNumberText}>{index + 1}</span>
          </div>
          <div className={styles.stopInfo}>
            <span className={styles.stopName}>{stop.name}</span>
            <span className={styles.stopPhotos}>{stop.photos} photos</span>
          </div>
          {index < stops.length - 1 && <div className={styles.stopConnector} />}
        </div>
      ))}
    </div>
  );
}

export default function AdventureMap(props: AdventureMapProps) {
  return (
    <div className={styles.container}>
      <LeafletMap {...props} />
      <StopsList stops={props.stops} />
    </div>
  );
}
