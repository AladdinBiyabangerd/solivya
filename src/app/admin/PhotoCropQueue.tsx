"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { createPortal } from "react-dom";
import { cropImageToFile } from "@/lib/cropImage";
import styles from "./admin.module.css";

export type CropQueueItem = {
  key: string;
  file: File;
  url: string;
};

type SharedProps = {
  imageUrl: string;
  fileName: string;
  aspect: number;
  title: string;
  hint: string;
  progressLabel?: string;
  confirmLabel: string;
  /** Longest edge for export (hero uses a higher cap). */
  maxEdge?: number;
  onConfirm: (file: File) => void;
  onCancel: () => void;
};

function CropDialog({
  imageUrl,
  fileName,
  aspect,
  title,
  hint,
  progressLabel,
  confirmLabel,
  maxEdge,
  onConfirm,
  onCancel,
}: SharedProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setError(null);
    setBusy(false);
  }, [imageUrl]);

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

  const onDone = async () => {
    if (!croppedAreaPixels || busy) return;
    setBusy(true);
    setError(null);
    try {
      const file = await cropImageToFile(
        imageUrl,
        croppedAreaPixels,
        fileName,
        maxEdge ? { maxEdge } : undefined,
      );
      onConfirm(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kəsim alınmadı.");
      setBusy(false);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={styles.cropModal}
      role="dialog"
      aria-modal="true"
      aria-label="Şəkli kəs"
    >
      <div className={styles.cropPanel}>
        <header className={styles.cropHead}>
          <div>
            {progressLabel ? (
              <p className={styles.cropProgress}>{progressLabel}</p>
            ) : null}
            <h2 className={styles.cropTitle}>{title}</h2>
            <p className={styles.cropHint}>{hint}</p>
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
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
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
            {busy ? "Hazırlanır…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

type QueueProps = {
  queue: CropQueueItem[];
  index: number;
  aspect: number;
  title: string;
  hint: string;
  maxEdge?: number;
  onConfirm: (file: File) => void;
  onCancel: () => void;
};

export function PhotoCropQueue({
  queue,
  index,
  aspect,
  title,
  hint,
  maxEdge,
  onConfirm,
  onCancel,
}: QueueProps) {
  const item = queue[index];
  if (!item) return null;

  return (
    <CropDialog
      imageUrl={item.url}
      fileName={item.file.name}
      aspect={aspect}
      title={title}
      hint={hint}
      maxEdge={maxEdge}
      progressLabel={`Kəsim ${index + 1} / ${queue.length}`}
      confirmLabel={
        index + 1 < queue.length ? "Kəs · növbəti" : "Kəs · bitir"
      }
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

type SingleProps = {
  imageUrl: string;
  fileName: string;
  aspect: number;
  title: string;
  hint: string;
  confirmLabel?: string;
  maxEdge?: number;
  onConfirm: (file: File) => void;
  onCancel: () => void;
};

export function PhotoCropSingle({
  imageUrl,
  fileName,
  aspect,
  title,
  hint,
  confirmLabel = "Kəs · əsas et",
  maxEdge,
  onConfirm,
  onCancel,
}: SingleProps) {
  return (
    <CropDialog
      imageUrl={imageUrl}
      fileName={fileName}
      aspect={aspect}
      title={title}
      hint={hint}
      maxEdge={maxEdge}
      confirmLabel={confirmLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
