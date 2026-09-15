"use client";

import {
  forwardRef,
  useActionState,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type { Photo, Property } from "@/types/database";
import type { CustomLocation } from "@/lib/azerbaijan-locations";
import { resolvePhotoSrc } from "@/lib/storage";
import { MIN_SITE_PHOTOS, MAX_SITE_PHOTOS, sitePhotoPlan } from "@/lib/photoLayout";
import {
  createProperty,
  deletePhoto,
  saveProperty,
  replacePhotoCrop,
  uploadPhoto,
  type EditorState,
} from "./property-actions";
import {
  PhotoCropQueue,
  PhotoCropSingle,
  type CropQueueItem,
} from "./PhotoCropQueue";
import {
  SITE_MAIN_ASPECT,
  SITE_PHOTO_ASPECT,
} from "@/lib/cropImage";
import dynamic from "next/dynamic";
import { ZonePicker } from "./ZonePicker";
import type { LatLng } from "./MapPinPicker";
import styles from "./admin.module.css";

const MapPinPicker = dynamic(
  () =>
    import("./MapPinPicker").then((mod) => ({ default: mod.MapPinPicker })),
  {
    ssr: false,
    loading: () => (
      <p className={styles.fieldHint}>Xəritə yüklənir…</p>
    ),
  },
);

const MapLocationCard = dynamic(
  () =>
    import("./MapPinPicker").then((mod) => ({
      default: mod.MapLocationCard,
    })),
  { ssr: false },
);

const empty: EditorState = {};

const STEPS = [
  { id: "brend", title: "Brend" },
  { id: "basliq", title: "Başlıq" },
  { id: "yerlesme", title: "Yerləşmə" },
  { id: "qiymet", title: "Qiymət" },
  { id: "detallar", title: "Detallar" },
  { id: "fotolar", title: "Fotolar" },
] as const;

function amenitiesToText(value: Property["amenities"]): string {
  if (!Array.isArray(value)) return "";
  return value
    .map((item) => {
      if (!item || typeof item !== "object" || !("title" in item)) return "";
      const row = item as { title: string; subtitle?: string };
      return row.subtitle ? `${row.title} | ${row.subtitle}` : row.title;
    })
    .filter(Boolean)
    .join(", ");
}

function rulesToText(value: Property["rules"]): string {
  if (!Array.isArray(value)) return "";
  return value.filter((item) => typeof item === "string").join("\n");
}

function liveUrl(slug: string): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith(".localhost") || host === "localhost") {
      return `http://${slug}.localhost:3000`;
    }
  }
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "solivya.homes";
  return `https://${slug}.${root}`;
}

function previewPath(slug: string): string {
  return `/admin/preview/${slug}`;
}

function useIsNarrow(query = "(max-width: 960px)") {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [query]);

  return narrow;
}

type Props = {
  property: Property;
  photos: Photo[];
  email: string;
  customLocations?: CustomLocation[];
};

function Status({ state }: { state: EditorState }) {
  if (state.error) return <p className={styles.error}>{state.error}</p>;
  if (state.ok) return <p className={styles.success}>{state.ok}</p>;
  return null;
}

function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.fieldGroup}>
      <h2 className={styles.sectionHeading}>{title}</h2>
      <div className={styles.fieldGroupBody}>{children}</div>
    </section>
  );
}

export function CreateForm() {
  const [state, action, pending] = useActionState(createProperty, empty);

  return (
    <form className={styles.createForm} action={action}>
      <FieldGroup title="Yeni mənzil">
        <label className={styles.label}>
          Brend adı
          <input
            className={styles.input}
            name="brand_name"
            required
            placeholder="Sahil Stay"
          />
        </label>
        <label className={styles.label}>
          Slug (subdomain)
          <input
            className={styles.input}
            name="slug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            placeholder="sahil"
          />
          <span className={styles.fieldHint}>
            Link: sahil.solivya.homes — yalnız kiçik hərf və tire
          </span>
        </label>
        <Status state={state} />
        <button className={styles.submit} type="submit" disabled={pending}>
          {pending ? "Yaradılır…" : "Mənzil yarat"}
        </button>
      </FieldGroup>
    </form>
  );
}

type PendingFile = {
  key: string;
  /** Gallery-cropped file (default upload payload). */
  file: File;
  url: string;
  originalFile: File;
  originalUrl: string;
  /** Hero crop from original; used when this pending is main. */
  mainFile?: File;
  mainUrl?: string;
};

type MainCropTarget =
  | {
      kind: "pending";
      key: string;
      imageUrl: string;
      fileName: string;
    }
  | {
      kind: "saved";
      photoId: string;
      imageUrl: string;
      fileName: string;
      /** Re-crop only, or also promote to main. */
      makeMain: boolean;
      /** Aspect for the crop UI. */
      role: "main" | "gallery";
    };

type LightboxItem = {
  key: string;
  src: string;
  alt: string;
};

export type PhotoPanelHandle = {
  flushUploads: () => Promise<EditorState | null>;
  effectiveCount: () => number;
};

function PhotoLightbox({
  items,
  index,
  onClose,
  onChange,
  actions,
}: {
  items: LightboxItem[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
  actions?: ReactNode;
}) {
  const total = items.length;
  const item = items[index];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!item) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (total < 2) return;
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onChange((index - 1 + total) % total);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        onChange((index + 1) % total);
      }
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [item, index, total, onClose, onChange]);

  if (!mounted || !item) return null;

  const goPrev = () => onChange((index - 1 + total) % total);
  const goNext = () => onChange((index + 1) % total);

  const onStageClick = (event: MouseEvent<HTMLDivElement>) => {
    if (total < 2) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width * 0.4) goPrev();
    else if (x > rect.width * 0.6) goNext();
  };

  return createPortal(
    <div
      className={styles.lightbox}
      role="dialog"
      aria-modal="true"
      aria-label="Foto önizləmə"
    >
      <button
        type="button"
        className={styles.lightboxBackdrop}
        aria-label="Bağla"
        onClick={onClose}
      />
      <div className={styles.lightboxChrome}>
        <div className={styles.lightboxTop}>
          <p className={styles.lightboxCount}>
            {index + 1} / {total}
          </p>
          <button
            type="button"
            className={styles.lightboxClose}
            onClick={onClose}
            aria-label="Bağla"
          >
            ×
          </button>
        </div>

        <div className={styles.lightboxStage} onClick={onStageClick}>
          {total > 1 ? (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNavPrev}`}
              onClick={(event) => {
                event.stopPropagation();
                goPrev();
              }}
              aria-label="Əvvəlki"
            >
              ‹
            </button>
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.src} alt={item.alt} className={styles.lightboxImage} />
          {total > 1 ? (
            <button
              type="button"
              className={`${styles.lightboxNav} ${styles.lightboxNavNext}`}
              onClick={(event) => {
                event.stopPropagation();
                goNext();
              }}
              aria-label="Növbəti"
            >
              ›
            </button>
          ) : null}
        </div>

        {actions ? <div className={styles.lightboxActions}>{actions}</div> : null}
      </div>
    </div>,
    document.body,
  );
}

const PhotoPanel = forwardRef<
  PhotoPanelHandle,
  { propertyId: string; photos: Photo[] }
>(function PhotoPanel({ propertyId, photos }, ref) {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<EditorState>(empty);
  const [uploadPending, setUploadPending] = useState(false);
  const [mainCropState, mainCropAction, mainCropPending] = useActionState(
    replacePhotoCrop,
    empty,
  );
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [mainKey, setMainKey] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);
  const [cropIndex, setCropIndex] = useState(0);
  const [mainCrop, setMainCrop] = useState<MainCropTarget | null>(null);
  const [optimisticMainSrc, setOptimisticMainSrc] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const cropQueueRef = useRef(cropQueue);
  cropQueueRef.current = cropQueue;
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const savedMain = sorted[0] ?? null;
  const hasPhotos = sorted.length > 0;
  const pendingMain = pending.find((item) => item.key === mainKey) ?? null;
  const mainPreviewSrc =
    pendingMain?.mainUrl ??
    pendingMain?.url ??
    optimisticMainSrc ??
    (savedMain ? resolvePhotoSrc(savedMain.storage_path) : null);
  const lightboxItems: LightboxItem[] = pending.map((item) => ({
    key: item.key,
    src: item.url,
    alt: item.file.name,
  }));

  const revokePending = (item: PendingFile) => {
    URL.revokeObjectURL(item.url);
    URL.revokeObjectURL(item.originalUrl);
    if (item.mainUrl) URL.revokeObjectURL(item.mainUrl);
  };

  useEffect(() => {
    return () => {
      pendingRef.current.forEach(revokePending);
      cropQueueRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  useEffect(() => {
    if (!uploadState.ok) return;
    setPending((prev) => {
      prev.forEach(revokePending);
      return [];
    });
    setMainKey(null);
    setLightboxIndex(null);
    setOptimisticMainSrc(null);
    setPickError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [uploadState.ok]);

  const buildUploadFormData = (): FormData | EditorState => {
    if (pending.length === 0) {
      return { error: "Əvvəl foto seç." };
    }
    if (mainKey) {
      const mainItem = pending.find((item) => item.key === mainKey);
      if (mainItem && !mainItem.mainFile) {
        setMainCrop({
          kind: "pending",
          key: mainItem.key,
          imageUrl: mainItem.originalUrl,
          fileName: mainItem.originalFile.name,
        });
        return { error: "Əsas foto üçün əvvəl hero kəsimini tamamla." };
      }
    }
    const ordered = mainKey
      ? [
          ...pending.filter((item) => item.key === mainKey),
          ...pending.filter((item) => item.key !== mainKey),
        ]
      : pending;
    const formData = new FormData();
    formData.set("property_id", propertyId);
    if (mainKey) formData.set("make_first_main", "1");
    for (const item of ordered) {
      const uploadFile =
        item.key === mainKey && item.mainFile ? item.mainFile : item.file;
      formData.append("files", uploadFile);
      formData.append("originals", item.originalFile);
    }
    return formData;
  };

  useImperativeHandle(
    ref,
    () => ({
      effectiveCount: () => photos.length + pending.length,
      flushUploads: async () => {
        if (pending.length === 0) return null;
        const built = buildUploadFormData();
        if (!(built instanceof FormData)) {
          setPickError(built.error ?? "Foto yüklənmədi.");
          return built;
        }
        setUploadPending(true);
        setUploadState(empty);
        try {
          const result = await uploadPhoto(empty, built);
          setUploadState(result);
          return result;
        } finally {
          setUploadPending(false);
        }
      },
    }),
    // pending/mainKey read via closure; refresh each render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pending, mainKey, photos.length, propertyId],
  );

  useEffect(() => {
    if (!mainCropState.ok) return;
    setMainCrop(null);
    setOptimisticMainSrc(null);
    router.refresh();
  }, [mainCropState.ok, router]);

  useEffect(() => {
    if (pending.length === 0) {
      if (!hasPhotos) setMainKey(null);
      setLightboxIndex(null);
      return;
    }
    if (mainKey && pending.some((item) => item.key === mainKey)) return;
    if (!hasPhotos) setMainKey(pending[0].key);
  }, [pending, hasPhotos, mainKey]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (pending.length === 0) {
      setLightboxIndex(null);
      return;
    }
    if (lightboxIndex >= pending.length) {
      setLightboxIndex(pending.length - 1);
    }
  }, [pending.length, lightboxIndex]);

  const clearCropQueue = () => {
    setCropQueue((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    setCropIndex(0);
  };

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    setPickError(null);

    const room = Math.max(0, MAX_SITE_PHOTOS - photos.length - pending.length);
    if (room === 0) {
      setPickError(`Maksimum ${MAX_SITE_PHOTOS} foto (əsas daxil).`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const next: CropQueueItem[] = [];
    for (const file of Array.from(list)) {
      if (next.length >= room) {
        setPickError(`Maksimum ${MAX_SITE_PHOTOS} foto (əsas daxil).`);
        break;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPickError(`"${file.name}" 5MB-dan böyükdür.`);
        continue;
      }
      next.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        url: URL.createObjectURL(file),
      });
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
    if (next.length === 0) return;

    setCropQueue((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return next;
    });
    setCropIndex(0);
  };

  const onGalleryCropConfirm = (file: File) => {
    const current = cropQueue[cropIndex];
    if (!current) return;

    const pendingItem: PendingFile = {
      key: `${current.key}-cropped`,
      file,
      url: URL.createObjectURL(file),
      originalFile: current.file,
      originalUrl: current.url,
    };

    const nextIndex = cropIndex + 1;
    const finished = nextIndex >= cropQueue.length;

    setPending((prev) => {
      const next = [...prev, pendingItem];
      if (finished && !hasPhotos && next[0]) {
        const first = next[0];
        queueMicrotask(() => {
          setMainKey(first.key);
          setOptimisticMainSrc(first.mainUrl ?? first.url);
          setMainCrop({
            kind: "pending",
            key: first.key,
            imageUrl: first.originalUrl,
            fileName: first.originalFile.name,
          });
        });
      }
      return next;
    });

    if (finished) {
      setCropQueue([]);
      setCropIndex(0);
      return;
    }
    setCropIndex(nextIndex);
  };

  const requestPendingAsMain = (key: string) => {
    const item = pending.find((row) => row.key === key);
    if (!item) return;
    setLightboxIndex(null);
    setMainKey(key);
    setOptimisticMainSrc(item.mainUrl ?? item.url);
    setMainCrop({
      kind: "pending",
      key: item.key,
      imageUrl: item.originalUrl,
      fileName: item.originalFile.name,
    });
  };

  const requestSavedRecrop = (
    photo: Photo,
    role: "main" | "gallery",
    makeMain: boolean,
  ) => {
    const sourcePath = photo.original_path || photo.storage_path;
    setMainCrop({
      kind: "saved",
      photoId: photo.id,
      imageUrl: resolvePhotoSrc(sourcePath),
      fileName: role === "main" ? "esas.jpg" : "qalereya.jpg",
      makeMain,
      role,
    });
    if (makeMain) {
      setOptimisticMainSrc(resolvePhotoSrc(photo.storage_path));
    }
  };

  const requestSavedAsMain = (photo: Photo) => {
    requestSavedRecrop(photo, "main", true);
  };

  const onMainCropConfirm = (file: File) => {
    if (!mainCrop) return;

    if (mainCrop.kind === "pending") {
      const mainUrl = URL.createObjectURL(file);
      setPending((prev) =>
        prev.map((item) => {
          if (item.key !== mainCrop.key) return item;
          if (item.mainUrl) URL.revokeObjectURL(item.mainUrl);
          return { ...item, mainFile: file, mainUrl };
        }),
      );
      setMainKey(mainCrop.key);
      setOptimisticMainSrc(mainUrl);
      setMainCrop(null);
      return;
    }

    const formData = new FormData();
    formData.set("photo_id", mainCrop.photoId);
    formData.set("file", file);
    if (mainCrop.makeMain) formData.set("make_main", "1");
    if (mainCrop.makeMain) {
      setOptimisticMainSrc(URL.createObjectURL(file));
    }
    mainCropAction(formData);
  };

  const removePending = (key: string) => {
    setPending((prev) => {
      const target = prev.find((item) => item.key === key);
      if (target) revokePending(target);
      return prev.filter((item) => item.key !== key);
    });
    if (mainKey === key) {
      setMainKey(null);
      setOptimisticMainSrc(null);
    }
    if (mainCrop?.kind === "pending" && mainCrop.key === key) {
      setMainCrop(null);
    }
    setPickError(null);
  };

  const activeLightbox =
    lightboxIndex !== null ? lightboxItems[lightboxIndex] : null;

  const totalCount = photos.length + pending.length;
  const plan = sitePhotoPlan(totalCount);

  return (
    <aside className={styles.photoPanel}>
      <header className={styles.photoPanelHead}>
        <h2 className={styles.sectionHeading}>Fotolar</h2>
        <p className={styles.hint}>
          Min {MIN_SITE_PHOTOS} · maks {MAX_SITE_PHOTOS} · əsasdan başqa ən
          çox {MAX_SITE_PHOTOS - 1}
          {plan.map ? " · +xəritə" : ""}
          {plan.spare > 0 ? ` · +${plan.spare} ehtiyat` : ""}
        </p>
        <p
          className={
            plan.missing > 0
              ? styles.photoCountWarn
              : totalCount >= MAX_SITE_PHOTOS
                ? styles.photoCountOk
                : styles.photoCountOk
          }
        >
          {totalCount} / {MAX_SITE_PHOTOS}
          {plan.missing > 0
            ? ` · daha ${plan.missing} lazımdır (min ${MIN_SITE_PHOTOS})`
            : totalCount >= MAX_SITE_PHOTOS
              ? " · limit doludur"
              : " · qalereya hazırdır"}
        </p>
      </header>

      {mainPreviewSrc ? (
        <div className={styles.mainPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={mainPreviewSrc} alt="" />
          <span className={styles.mainBadge}>Əsas</span>
        </div>
      ) : null}

      {hasPhotos ? (
        <div className={styles.thumbRail} role="list">
          {sorted.map((photo, index) => {
            const isMain = index === 0 && !pendingMain;
            return (
              <figure
                key={photo.id}
                className={
                  isMain ? `${styles.thumb} ${styles.thumbMain}` : styles.thumb
                }
                role="listitem"
              >
                <div className={styles.thumbHit}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolvePhotoSrc(photo.storage_path)}
                    alt={photo.alt || `Foto ${index + 1}`}
                  />
                  {isMain ? (
                    <span className={styles.thumbMeta}>Əsas</span>
                  ) : null}
                </div>
                <div className={styles.thumbActions}>
                  <button
                    type="button"
                    className={styles.thumbCropBtn}
                    onClick={() =>
                      requestSavedRecrop(
                        photo,
                        isMain ? "main" : "gallery",
                        false,
                      )
                    }
                  >
                    Kəs
                  </button>
                  {!isMain ? (
                    <button
                      type="button"
                      className={styles.thumbMainBtn}
                      onClick={() => requestSavedAsMain(photo)}
                    >
                      Əsas et
                    </button>
                  ) : null}
                  <form action={deletePhoto}>
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <button className={styles.thumbDanger} type="submit">
                      Sil
                    </button>
                  </form>
                </div>
              </figure>
            );
          })}
        </div>
      ) : null}

      <div className={hasPhotos ? styles.dropZone : styles.dropZoneEmpty}>
        <label className={styles.dropLabel}>
          <span className={styles.dropTitle}>
            {hasPhotos ? "Foto əlavə et" : "Fotoları seç"}
          </span>
          <span className={styles.dropHint}>
            Kəs · əlavə et · Yadda saxla ilə yüklənir · min{" "}
            {MIN_SITE_PHOTOS} · maks {MAX_SITE_PHOTOS}
          </span>
          <input
            ref={fileInputRef}
            className={styles.dropFile}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={(event) => addFiles(event.target.files)}
          />
        </label>

        {pending.length > 0 ? (
          <div className={styles.pendingRail} role="list">
            {pending.map((item, index) => {
              const isPendingMain = item.key === mainKey;
              return (
                <figure
                  key={item.key}
                  className={
                    isPendingMain
                      ? `${styles.pendingThumb} ${styles.pendingThumbMain}`
                      : styles.pendingThumb
                  }
                  role="listitem"
                >
                  <button
                    type="button"
                    className={styles.pendingPick}
                    onClick={() => setLightboxIndex(index)}
                    title="Böyüt"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.mainUrl ?? item.url}
                      alt={item.file.name}
                    />
                    <span
                      className={
                        isPendingMain
                          ? styles.pendingMainLabel
                          : styles.pendingPickLabel
                      }
                    >
                      {isPendingMain ? "Əsas" : "Böyüt"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={styles.pendingRemove}
                    onClick={() => removePending(item.key)}
                    aria-label={`${item.file.name} sil`}
                    title="Çıxar"
                  >
                    ×
                  </button>
                </figure>
              );
            })}
          </div>
        ) : null}

        {pending.length > 0 ? (
          <p className={styles.pendingSaveHint}>
            {pending.length} foto gözləyir — <strong>Yadda saxla</strong> ilə
            yüklənəcək
            {uploadPending ? "…" : ""}
          </p>
        ) : null}

        {pickError ? <p className={styles.error}>{pickError}</p> : null}
        <Status state={uploadState} />
        <Status state={mainCropState} />
      </div>

      {lightboxIndex !== null && activeLightbox ? (
        <PhotoLightbox
          items={lightboxItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChange={setLightboxIndex}
          actions={
            <>
              <button
                type="button"
                className={
                  activeLightbox.key === mainKey
                    ? styles.lightboxMainActive
                    : styles.lightboxMainBtn
                }
                onClick={() => requestPendingAsMain(activeLightbox.key)}
                disabled={mainCropPending}
              >
                {activeLightbox.key === mainKey
                  ? "Əsas kəsimi yenilə"
                  : "Əsas et"}
              </button>
              <button
                type="button"
                className={styles.lightboxRemoveBtn}
                onClick={() => removePending(activeLightbox.key)}
              >
                Çıxar
              </button>
            </>
          }
        />
      ) : null}

      {cropQueue.length > 0 ? (
        <PhotoCropQueue
          queue={cropQueue}
          index={cropIndex}
          aspect={SITE_PHOTO_ASPECT}
          title="Qalereya kəsimi"
          hint="4:3 · əlavə fotolar üçün · zoom ilə yerləşdir"
          onConfirm={onGalleryCropConfirm}
          onCancel={clearCropQueue}
        />
      ) : null}

      {mainCrop ? (
        <PhotoCropSingle
          imageUrl={mainCrop.imageUrl}
          fileName={mainCrop.fileName}
          aspect={
            mainCrop.kind === "saved" && mainCrop.role === "gallery"
              ? SITE_PHOTO_ASPECT
              : SITE_MAIN_ASPECT
          }
          title={
            mainCrop.kind === "saved" && !mainCrop.makeMain
              ? mainCrop.role === "main"
                ? "Əsas fotonu yenidən kəs"
                : "Qalereya fotonu yenidən kəs"
              : "Əsas (hero) kəsimi"
          }
          hint={
            mainCrop.kind === "saved" &&
            !photos.find((p) => p.id === mainCrop.photoId)?.original_path
              ? mainCrop.role === "gallery"
                ? "4:3 · orijinal yoxdursa cari fotodan"
                : "16:9 · orijinal yoxdursa cari fotodan"
              : mainCrop.kind === "saved" && mainCrop.role === "gallery"
                ? "4:3 · yükləmədəki orijinaldan · zoom ilə yerləşdir"
                : "16:9 · yükləmədəki orijinaldan · zoom ilə yerləşdir"
          }
          confirmLabel={
            mainCropPending
              ? "Yadda saxlanılır…"
              : mainCrop.kind === "saved" && !mainCrop.makeMain
                ? "Kəs · saxla"
                : "Kəs · əsas et"
          }
          onConfirm={onMainCropConfirm}
          onCancel={() => {
            if (!mainCropPending) setMainCrop(null);
          }}
        />
      ) : null}
    </aside>
  );
});

function WizardNav({
  step,
  total,
  title,
  onBack,
  onNext,
  showNext,
}: {
  step: number;
  total: number;
  title: string;
  onBack: () => void;
  onNext: () => void;
  showNext: boolean;
}) {
  return (
    <div className={styles.wizardNav}>
      <p className={styles.wizardProgress}>
        {step + 1} / {total}
        <span aria-hidden="true"> · </span>
        {title}
      </p>
      <div className={styles.wizardBtns}>
        <button
          type="button"
          className={styles.wizardBack}
          onClick={onBack}
          disabled={step === 0}
        >
          Geri
        </button>
        {showNext ? (
          <button type="button" className={styles.wizardNext} onClick={onNext}>
            Növbəti
          </button>
        ) : null}
      </div>
    </div>
  );
}

function EditForm({
  property,
  photos,
  email,
  customLocations = [],
}: {
  property: Property;
  photos: Photo[];
  email: string;
  customLocations?: CustomLocation[];
}) {
  const router = useRouter();
  const [saveState, setSaveState] = useState<EditorState>(empty);
  const [savePending, setSavePending] = useState(false);
  const photoRef = useRef<PhotoPanelHandle>(null);
  const narrow = useIsNarrow();
  const [step, setStep] = useState(0);
  const [zonePath, setZonePath] = useState(property.zone ?? "");
  const [mapPosition, setMapPosition] = useState<LatLng | null>(() => {
    if (
      typeof property.lat === "number" &&
      typeof property.lng === "number" &&
      Number.isFinite(property.lat) &&
      Number.isFinite(property.lng)
    ) {
      return { lat: property.lat, lng: property.lng };
    }
    return null;
  });
  const [mapOpen, setMapOpen] = useState(false);
  const url = liveUrl(property.slug);
  const last = STEPS.length - 1;

  useEffect(() => {
    if (!narrow) setStep(0);
  }, [narrow]);

  const goNext = () => setStep((s) => Math.min(s + 1, last));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));
  const visible = (index: number) => !narrow || step === index;

  const onSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSavePending(true);
    setSaveState(empty);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const publishing = formData.get("published") === "on";
    const photoCount = photoRef.current?.effectiveCount() ?? photos.length;

    if (publishing && photoCount < MIN_SITE_PHOTOS) {
      setSaveState({
        error: `Publish üçün ən azı ${MIN_SITE_PHOTOS} foto lazımdır (indi: ${photoCount}).`,
      });
      setSavePending(false);
      return;
    }

    const uploadResult = await photoRef.current?.flushUploads();
    if (uploadResult?.error) {
      setSaveState(uploadResult);
      setSavePending(false);
      return;
    }

    try {
      const result = await saveProperty(empty, formData);
      setSaveState(result);
      if (result.ok) router.refresh();
    } finally {
      setSavePending(false);
    }
  };

  return (
    <div className={styles.editorStack}>
      {narrow ? (
        <WizardNav
          step={step}
          total={STEPS.length}
          title={STEPS[step].title}
          onBack={goBack}
          onNext={goNext}
          showNext={step < last}
        />
      ) : null}

      <div className={styles.editorSplit}>
        <form className={styles.form} onSubmit={onSave}>
          <input type="hidden" name="id" value={property.id} />

          <div
            className={styles.wizardStep}
            hidden={!visible(0)}
            data-step="0"
          >
            <div className={styles.liveBar}>
              <div className={styles.liveCopy}>
                <a
                  className={styles.liveLink}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {url.replace(/^https?:\/\//, "")}
                </a>
              </div>
              <div className={styles.liveActions}>
                <a
                  className={styles.previewBtn}
                  href={previewPath(property.slug)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Önizlə
                </a>
                <span
                  className={
                    property.published ? styles.statusLive : styles.statusDraft
                  }
                >
                  {property.published ? "Published" : "Draft"}
                </span>
              </div>
            </div>

            <FieldGroup title="Brend">
              <div className={styles.grid2}>
                <label className={styles.label}>
                  Ad
                  <input
                    className={styles.input}
                    name="brand_name"
                    defaultValue={property.brand_name}
                    required
                  />
                </label>
                <label className={styles.label}>
                  Slug
                  <input
                    className={styles.input}
                    name="slug"
                    defaultValue={property.slug}
                    required
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  />
                </label>
              </div>
            </FieldGroup>
          </div>

          <div
            className={styles.wizardStep}
            hidden={!visible(1)}
            data-step="1"
          >
            <FieldGroup title="Başlıq">
              <div className={styles.grid2}>
                <label className={styles.label}>
                  AZ
                  <input
                    className={styles.input}
                    name="title_az"
                    defaultValue={property.title_az}
                  />
                </label>
                <label className={styles.label}>
                  RU
                  <input
                    className={styles.input}
                    name="title_ru"
                    defaultValue={property.title_ru}
                  />
                </label>
              </div>
              <div className={styles.grid2}>
                <label className={styles.label}>
                  Qısa təsvir AZ
                  <textarea
                    className={styles.textarea}
                    name="lead_az"
                    rows={3}
                    defaultValue={property.lead_az}
                  />
                </label>
                <label className={styles.label}>
                  Qısa təsvir RU
                  <textarea
                    className={styles.textarea}
                    name="lead_ru"
                    rows={3}
                    defaultValue={property.lead_ru}
                  />
                </label>
              </div>
            </FieldGroup>
          </div>

          <div
            className={styles.wizardStep}
            hidden={!visible(2)}
            data-step="2"
          >
            <FieldGroup title="Yerləşmə">
              <div className={styles.label}>
                Ünvan
                <ZonePicker
                  defaultValue={property.zone}
                  ownerKey={email}
                  initialCustoms={customLocations}
                  onZoneChange={setZonePath}
                />
              </div>
              {zonePath ? (
                <MapPinPicker
                  zonePath={zonePath}
                  position={mapPosition}
                  onPositionChange={setMapPosition}
                  cardElsewhere={!narrow}
                  open={mapOpen}
                  onOpenChange={setMapOpen}
                />
              ) : null}
              <label className={styles.label}>
                WhatsApp
                <input
                  className={styles.input}
                  name="whatsapp_e164"
                  defaultValue={property.whatsapp_e164}
                  placeholder="994501234567"
                />
              </label>
              <label className={styles.label}>
                Yerləşmə qeydi
                <textarea
                  className={styles.textarea}
                  name="zone_note"
                  rows={2}
                  defaultValue={property.zone_note}
                  placeholder="Metroya yaxınlıq, giriş və s."
                />
              </label>
            </FieldGroup>
          </div>

          <div
            className={styles.wizardStep}
            hidden={!visible(3)}
            data-step="3"
          >
            <FieldGroup title="Qiymət">
              <div className={styles.grid4}>
                <label className={styles.label}>
                  Otaq
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    name="rooms"
                    defaultValue={property.rooms}
                  />
                </label>
                <label className={styles.label}>
                  Qonaq
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    name="guests"
                    defaultValue={property.guests}
                  />
                </label>
                <label className={styles.label}>
                  Gecəlik
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    step="1"
                    name="price_night"
                    defaultValue={property.price_night}
                  />
                </label>
                <label className={styles.label}>
                  Min. gecə
                  <input
                    className={styles.input}
                    type="number"
                    min={1}
                    name="min_nights"
                    defaultValue={property.min_nights}
                  />
                </label>
              </div>
              <div className={styles.grid2}>
                <label className={styles.label}>
                  Qiymət qeydi
                  <input
                    className={styles.input}
                    name="price_note"
                    defaultValue={property.price_note}
                  />
                </label>
                <label className={styles.label}>
                  Depozit
                  <input
                    className={styles.input}
                    type="number"
                    min={0}
                    name="deposit"
                    defaultValue={property.deposit}
                  />
                </label>
              </div>
            </FieldGroup>
          </div>

          <div
            className={styles.wizardStep}
            hidden={!visible(4)}
            data-step="4"
          >
            <FieldGroup title="Detallar">
              <div className={styles.grid2}>
                <label className={styles.label}>
                  Təchizat
                  <textarea
                    className={styles.textarea}
                    name="amenities"
                    rows={4}
                    defaultValue={amenitiesToText(property.amenities)}
                  />
                  <span className={styles.fieldHint}>
                    Vergüllə ayır · istəsən: Başlıq | alt mətn
                  </span>
                </label>
                <label className={styles.label}>
                  Qaydalar
                  <textarea
                    className={styles.textarea}
                    name="rules"
                    rows={4}
                    defaultValue={rulesToText(property.rules)}
                  />
                  <span className={styles.fieldHint}>Hər sətir bir qayda</span>
                </label>
              </div>
              <div className={styles.grid2}>
                <label className={styles.label}>
                  Dil
                  <select
                    className={styles.input}
                    name="locale_default"
                    defaultValue={property.locale_default}
                  >
                    <option value="az">AZ</option>
                    <option value="ru">RU</option>
                  </select>
                </label>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    name="published"
                    defaultChecked={property.published}
                  />
                  <span>
                    <strong>Publish</strong>
                    <em>
                      Canlı səhifə · {MIN_SITE_PHOTOS}–{MAX_SITE_PHOTOS}{" "}
                      foto
                    </em>
                  </span>
                </label>
              </div>
            </FieldGroup>

            <div className={styles.saveBar}>
              <Status state={saveState} />
              <div className={styles.saveActions}>
                <a
                  className={styles.previewBtn}
                  href={previewPath(property.slug)}
                  target="_blank"
                  rel="noreferrer"
                >
                  Önizlə
                </a>
                <button
                  className={styles.submit}
                  type="submit"
                  disabled={savePending}
                >
                  {savePending ? "Saxlanılır…" : "Yadda saxla"}
                </button>
              </div>
            </div>
          </div>
        </form>

        <div
          className={`${styles.wizardStep} ${styles.photoColumn}`}
          hidden={!visible(5)}
          data-step="5"
        >
          <PhotoPanel
            ref={photoRef}
            propertyId={property.id}
            photos={photos}
          />
          {!narrow && zonePath && mapPosition ? (
            <MapLocationCard
              className={styles.mapLocationCardInPhotos}
              zonePath={zonePath}
              position={mapPosition}
              onEdit={() => setMapOpen(true)}
              onClear={() => setMapPosition(null)}
            />
          ) : null}
        </div>
      </div>

      {narrow ? (
        <WizardNav
          step={step}
          total={STEPS.length}
          title={STEPS[step].title}
          onBack={goBack}
          onNext={goNext}
          showNext={step < last}
        />
      ) : null}
    </div>
  );
}

export function PropertyEditor({
  property,
  photos,
  email,
  customLocations = [],
}: Props) {
  return (
    <>
      <header className={styles.panelHeader}>
        <div className={styles.panelHeaderRow}>
          <h1 className={styles.title}>{property.brand_name || "Mənzil"}</h1>
          <p className={styles.emailLine}>{email}</p>
        </div>
      </header>

      <EditForm
        property={property}
        photos={photos}
        email={email}
        customLocations={customLocations}
      />
    </>
  );
}
