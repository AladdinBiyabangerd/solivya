"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import {
  SITE_PHOTO_ASPECT,
  cropImageToFile,
} from "@/lib/cropImage";
import styles from "./admin.module.css";

export type CropQueueItem = {
  key: string;
  file: File;
  url: string;
};

type Props = {
  queue: CropQueueItem[];
  index: number;
  onConfirm: (file: File) => void;
  onCancel: () => void;
};

export function PhotoCropQueue({ queue, index, onConfirm, onCancel }: Props) {
  const item = queue[index];
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
    setBusy(false);
  }, [item?.key]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  if (!item) return null;

  const onDone = async () => {
    if (!croppedAreaPixels || busy) return;
    setBusy(true);
    setError(null);
    try {
      const file = await cropImageToFile(
        item.url,
        croppedAreaPixels,
        item.file.name,
      );
      onConfirm(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kəsim alınmadı.");
      setBusy(false);
    }
  };

  return (
    <div
      className={styles.cropModal}
      role="dialog"
      aria-modal="true"
      aria-label="Şəkli kəs"
    >
      <div className={styles.cropPanel}>
        <header className={styles.cropHead}>
          <div>
            <p className={styles.cropProgress}>
              Kəsim {index + 1} / {queue.length}
            </p>
            <h2 className={styles.cropTitle}>Saytda görünəcək hissəni seç</h2>
            <p className={styles.cropHint}>
              4:3 format · hero və qalereya üçün uyğun · zoom ilə yerləşdir
            </p>
          </div>
          <button
            type="button"
            className={styles.cropCancel}
            onClick={onCancel}
            disabled={busy}
          >
            Ləğv et
          </button>
        </header>

        <div className={styles.cropStage}>
          <Cropper
            image={item.url}
            crop={crop}
            zoom={zoom}
            aspect={SITE_PHOTO_ASPECT}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid
          />
        </div>

        <div className={styles.cropControls}>
          <label className={styles.cropZoom}>
            <span>Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              disabled={busy}
            />
          </label>
          {error ? <p className={styles.error}>{error}</p> : null}
          <button
            type="button"
            className={styles.cropConfirm}
            onClick={onDone}
            disabled={busy || !croppedAreaPixels}
          >
            {busy
              ? "Hazırlanır…"
              : index + 1 < queue.length
                ? "Kəs · növbəti"
                : "Kəs · bitir"}
          </button>
        </div>
      </div>
    </div>
  );
}
