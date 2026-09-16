"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { mapCenterForZonePath } from "@/lib/azerbaijan-locations";
import styles from "../admin.module.css";
import "leaflet/dist/leaflet.css";

export type LatLng = { lat: number; lng: number };

type PickerProps = {
  zonePath: string;
  position: LatLng | null;
  onPositionChange: (next: LatLng | null) => void;
  latName?: string;
  lngName?: string;
  /** When true, compact card is rendered elsewhere (photo column). */
  cardElsewhere?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type CardProps = {
  zonePath: string;
  position: LatLng;
  onEdit: () => void;
  onClear?: () => void;
  className?: string;
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
  draft,
  onDraft,
}: {
  zonePath: string;
  draft: LatLng | null;
  onDraft: (next: LatLng) => void;
}) {
  const fallback = useMemo(() => mapCenterForZonePath(zonePath), [zonePath]);
  const center = draft ?? fallback;
  const zoom = draft ? 15 : 12;

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
      <ClickToPlace onPosition={onDraft} />
      {draft ? (
        <Marker
          position={[draft.lat, draft.lng]}
          draggable
          icon={pinIcon}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target as L.Marker;
              const ll = marker.getLatLng();
              onDraft({ lat: ll.lat, lng: ll.lng });
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}

export function MapLocationCard({
  zonePath,
  position,
  onEdit,
  onClear,
  className,
}: CardProps) {
  const mapsLink = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
  const navigateLink = `https://www.google.com/maps/dir/?api=1&destination=${position.lat},${position.lng}`;

  return (
    <aside
      className={`${styles.mapLocationCard} ${className ?? ""}`.trim()}
      aria-label="Seçilmiş konum"
    >
      <div className={styles.mapLocationBody}>
        <p className={styles.mapLocationLabel}>Konum</p>
        <p className={styles.mapLocationZone}>{zonePath}</p>
        <p className={styles.mapLocationCoords}>
          {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
        </p>
        <a
          className={styles.mapLocationLink}
          href={navigateLink}
          target="_blank"
          rel="noreferrer"
        >
          Yol götür
        </a>
        <a
          className={styles.mapLocationLink}
          href={mapsLink}
          target="_blank"
          rel="noreferrer"
        >
          Xəritədə bax
        </a>
        <div className={styles.mapLocationActions}>
          <button
            type="button"
            className={styles.mapLocationEdit}
            onClick={onEdit}
          >
            Dəyiş
          </button>
          {onClear ? (
            <button
              type="button"
              className={styles.mapLocationClear}
              onClick={onClear}
            >
              Sil
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

export function MapPinPicker({
  zonePath,
  position,
  onPositionChange,
  latName = "lat",
  lngName = "lng",
  cardElsewhere = false,
  open: openProp,
  onOpenChange,
}: PickerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;
  const [draft, setDraft] = useState<LatLng | null>(position);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setDraft(position);
  }, [open, position]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!zonePath) return null;

  function confirm() {
    if (!draft) return;
    onPositionChange(draft);
    setOpen(false);
  }

  function close() {
    setDraft(position);
    setOpen(false);
  }

  const modal =
    open && mounted
      ? createPortal(
          <div
            className={styles.mapPinModal}
            role="dialog"
            aria-modal="true"
            aria-label="Konum seç"
          >
            <button
              type="button"
              className={styles.mapPinModalBackdrop}
              aria-label="Bağla"
              onClick={close}
            />
            <div className={styles.mapPinModalSheet}>
              <header className={styles.mapPinModalHead}>
                <div>
                  <p className={styles.mapPinModalTitle}>Konum seç</p>
                  <p className={styles.fieldHint}>{zonePath}</p>
                </div>
                <button
                  type="button"
                  className={styles.mapPinModalClose}
                  onClick={close}
                >
                  ✕
                </button>
              </header>
              <p className={styles.fieldHint}>
                Xəritəyə klikləyin və ya pin-i sürükləyin.
              </p>
              <div className={styles.mapPinFrame}>
                <MapCanvas
                  key={`${zonePath}-${open}`}
                  zonePath={zonePath}
                  draft={draft}
                  onDraft={setDraft}
                />
              </div>
              {draft ? (
                <p className={styles.zonePickerSummary}>
                  Pin:{" "}
                  <strong>
                    {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}
                  </strong>
                </p>
              ) : (
                <p className={styles.fieldHint}>Hələ seçilməyib</p>
              )}
              <div className={styles.mapPinModalActions}>
                <button
                  type="button"
                  className={styles.zoneCustomCancel}
                  onClick={close}
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  className={styles.zoneCustomSave}
                  disabled={!draft}
                  onClick={confirm}
                >
                  Təsdiq et
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={styles.mapPinPicker}>
      <span className={styles.zoneSelectLabel}>Konum (xəritə)</span>

      <div className={styles.mapPinActions}>
        <button
          type="button"
          className={styles.mapPinOpenBtn}
          onClick={() => setOpen(true)}
        >
          {position ? "Konumu dəyiş" : "Xəritədən konum seç"}
        </button>
        {position ? (
          <button
            type="button"
            className={styles.mapPinClearBtn}
            onClick={() => onPositionChange(null)}
          >
            Sil
          </button>
        ) : null}
      </div>

      {!position ? (
        <p className={styles.fieldHint}>
          Ünvan seçilib — indi xəritədə dəqiq nöqtəni seçin.
        </p>
      ) : null}

      {position && !cardElsewhere ? (
        <MapLocationCard
          className={styles.mapLocationCardInForm}
          zonePath={zonePath}
          position={position}
          onEdit={() => setOpen(true)}
          onClear={() => onPositionChange(null)}
        />
      ) : null}

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

      {modal}
    </div>
  );
}
