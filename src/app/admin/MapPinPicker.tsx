"use client";

import { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  Map,
  Pin,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import { mapCenterForZonePath } from "@/lib/azerbaijan-locations";
import styles from "./admin.module.css";

type LatLng = { lat: number; lng: number };

type Props = {
  zonePath: string;
  defaultLat?: number | null;
  defaultLng?: number | null;
  latName?: string;
  lngName?: string;
};

function readApiKey(): string {
  return (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "").trim();
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
  const mapId =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID?.trim() || "DEMO_MAP_ID";

  return (
    <Map
      className={styles.mapPinCanvas}
      defaultCenter={center}
      defaultZoom={position ? 15 : 12}
      gestureHandling="greedy"
      disableDefaultUI={false}
      mapId={mapId}
      onClick={(ev: MapMouseEvent) => {
        const ll = ev.detail.latLng;
        if (!ll) return;
        onPosition({ lat: ll.lat, lng: ll.lng });
      }}
    >
      {position ? (
        <AdvancedMarker
          position={position}
          draggable
          onDragEnd={(ev) => {
            const ll = ev.latLng;
            if (!ll) return;
            onPosition({ lat: ll.lat(), lng: ll.lng() });
          }}
        >
          <Pin
            background="#9a7b4f"
            borderColor="#7c623f"
            glyphColor="#fffcfa"
          />
        </AdvancedMarker>
      ) : null}
    </Map>
  );
}

export function MapPinPicker({
  zonePath,
  defaultLat = null,
  defaultLng = null,
  latName = "lat",
  lngName = "lng",
}: Props) {
  const apiKey = readApiKey();
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
      // Keep pin if defaults match current property; clear when user switches city
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
        Xəritədə dəqiq nöqtəni seçin — klikləyin və ya pin-i sürükləyin.
      </p>

      {!apiKey ? (
        <div className={styles.mapPinMissing}>
          <p>
            Google Maps üçün API açarı lazımdır.{" "}
            <code>.env.local</code> faylına əlavə edin:
          </p>
          <pre className={styles.mapPinEnvSample}>
            {`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key`}
          </pre>
          <p className={styles.fieldHint}>
            Google Cloud → Maps JavaScript API aktiv edin. İstəyə bağlı:{" "}
            <code>NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID</code>
          </p>
        </div>
      ) : (
        <div className={styles.mapPinFrame}>
          <APIProvider apiKey={apiKey} language="az" region="AZ" libraries={["marker"]}>
            <MapCanvas
              key={zonePath}
              zonePath={zonePath}
              position={position}
              onPosition={setPosition}
            />
          </APIProvider>
        </div>
      )}

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
      ) : apiKey ? (
        <p className={styles.fieldHint}>Hələ seçilməyib — xəritəyə klik edin</p>
      ) : null}
    </div>
  );
}
