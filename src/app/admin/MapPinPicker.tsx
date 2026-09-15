"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { mapCenterForZonePath } from "@/lib/azerbaijan-locations";
import styles from "./admin.module.css";
import "leaflet/dist/leaflet.css";

type LatLng = { lat: number; lng: number };

type Props = {
  zonePath: string;
  defaultLat?: number | null;
  defaultLng?: number | null;
  latName?: string;
  lngName?: string;
};

const pinIcon = L.divIcon({
  className: styles.mapPinIcon,
  html: `<span class="${styles.mapPinGlyph}"></span>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
});

function ClickToPlace({
  onPosition,
}: {
  onPosition: (next: LatLng) => void;
}) {
  useMapEvents({
    click(e) {
      onPosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

function Recenter({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center.lat, center.lng, zoom, map]);
  return null;
}

function MapCanvas({
  zonePath,
  position,
  onPosition,
}: {
  zonePath: string;
  position: LatLng | null;
  onPosition: (next: LatLng) => void;
}) {
  const fallback = useMemo(() => mapCenterForZonePath(zonePath), [zonePath]);
  const center = position ?? fallback;
  const zoom = position ? 15 : 12;

  return (
    <MapContainer
      className={styles.mapPinCanvas}
      center={[center.lat, center.lng]}
      zoom={zoom}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Recenter center={center} zoom={zoom} />
      <ClickToPlace onPosition={onPosition} />
      {position ? (
        <Marker
          position={[position.lat, position.lng]}
          draggable
          icon={pinIcon}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const ll = marker.getLatLng();
              onPosition({ lat: ll.lat, lng: ll.lng });
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}

export function MapPinPicker({
  zonePath,
  defaultLat = null,
  defaultLng = null,
  latName = "lat",
  lngName = "lng",
}: Props) {
  const [position, setPosition] = useState<LatLng | null>(() => {
    if (
      typeof defaultLat === "number" &&
      typeof defaultLng === "number" &&
      Number.isFinite(defaultLat) &&
      Number.isFinite(defaultLng)
    ) {
      return { lat: defaultLat, lng: defaultLng };
    }
    return null;
  });
  const cityKey = zonePath.split(" · ")[0] ?? "";
  const [lastCity, setLastCity] = useState(cityKey);

  useEffect(() => {
    if (cityKey && cityKey !== lastCity) {
      setLastCity(cityKey);
      if (
        !(
          typeof defaultLat === "number" &&
          typeof defaultLng === "number" &&
          Number.isFinite(defaultLat) &&
          Number.isFinite(defaultLng)
        )
      ) {
        setPosition(null);
      }
    }
  }, [cityKey, lastCity, defaultLat, defaultLng]);

  if (!zonePath) return null;

  return (
    <div className={styles.mapPinPicker}>
      <span className={styles.zoneSelectLabel}>Konum (xəritə)</span>
      <p className={styles.fieldHint}>
        Pulsuz OpenStreetMap — klikləyin və ya pin-i sürükləyin.
      </p>

      <div className={styles.mapPinFrame}>
        <MapCanvas
          key={zonePath}
          zonePath={zonePath}
          position={position}
          onPosition={setPosition}
        />
      </div>

      <input
        type="hidden"
        name={latName}
        value={position ? String(position.lat) : ""}
      />
      <input
        type="hidden"
        name={lngName}
        value={position ? String(position.lng) : ""}
      />

      {position ? (
        <p className={styles.zonePickerSummary}>
          Pin:{" "}
          <strong>
            {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
          </strong>
        </p>
      ) : (
        <p className={styles.fieldHint}>Hələ seçilməyib — xəritəyə klik edin</p>
      )}
    </div>
  );
}
