"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import type { SitePhoto } from "./types";
import styles from "./site.module.css";

type Props = {
  photos: SitePhoto[];
  brandName: string;
  closeLabel: string;
  viewerLabel: string;
  prevLabel: string;
  nextLabel: string;
};

export function SiteGallery({
  photos,
  brandName,
  closeLabel,
  viewerLabel,
  prevLabel,
  nextLabel,
}: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const titleId = useId();
  const items = photos.slice(0, 5);
  const open = index !== null;
  const current = index !== null ? items[index] : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const close = useCallback(() => setIndex(null), []);

  const go = useCallback(
    (next: number) => {
      if (items.length < 2) return;
      setIndex((next + items.length) % items.length);
    },
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        go((index ?? 0) - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        go((index ?? 0) + 1);
      }
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, index, close, go]);

  const onStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (items.length < 2) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width * 0.35) go((index ?? 0) - 1);
    else if (x > rect.width * 0.65) go((index ?? 0) + 1);
  };

  return (
    <>
      <div className={styles.galleryGrid}>
        {items.map((photo, i) => (
          <figure key={photo.src}>
            <button
              type="button"
              className={styles.galleryHit}
              onClick={() => setIndex(i)}
              aria-label={`${viewerLabel}: ${photo.alt || brandName}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.alt || brandName} />
            </button>
          </figure>
        ))}
      </div>

      {mounted && open && current
        ? createPortal(
            <div
              className={styles.viewer}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
            >
              <button
                type="button"
                className={styles.viewerVeil}
                aria-label={closeLabel}
                onClick={close}
              />

              <div className={styles.viewerSheet}>
                <header className={styles.viewerHead}>
                  <p id={titleId} className={styles.viewerBrand}>
                    {brandName}
                  </p>
                  <p className={styles.viewerCount} aria-live="polite">
                    {(index ?? 0) + 1} / {items.length}
                  </p>
                  <button
                    type="button"
                    className={styles.viewerClose}
                    onClick={close}
                  >
                    {closeLabel}
                  </button>
                </header>

                <div className={styles.viewerStage} onClick={onStageClick}>
                  {items.length > 1 ? (
                    <button
                      type="button"
                      className={`${styles.viewerNav} ${styles.viewerNavPrev}`}
                      aria-label={prevLabel}
                      onClick={(event) => {
                        event.stopPropagation();
                        go((index ?? 0) - 1);
                      }}
                    >
                      <span aria-hidden="true">‹</span>
                    </button>
                  ) : null}

                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={current.src}
                    src={current.src}
                    alt={current.alt || brandName}
                    className={styles.viewerImage}
                  />

                  {items.length > 1 ? (
                    <button
                      type="button"
                      className={`${styles.viewerNav} ${styles.viewerNavNext}`}
                      aria-label={nextLabel}
                      onClick={(event) => {
                        event.stopPropagation();
                        go((index ?? 0) + 1);
                      }}
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  ) : null}
                </div>

                {items.length > 1 ? (
                  <div
                    className={styles.viewerStrip}
                    role="tablist"
                    aria-label={viewerLabel}
                  >
                    {items.map((photo, i) => (
                      <button
                        key={photo.src}
                        type="button"
                        role="tab"
                        aria-selected={i === index}
                        className={
                          i === index
                            ? `${styles.viewerThumb} ${styles.viewerThumbActive}`
                            : styles.viewerThumb
                        }
                        onClick={() => setIndex(i)}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={photo.src} alt="" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
