"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { Photo, Property } from "@/types/database";
import { resolvePhotoSrc } from "@/lib/storage";
import {
  createProperty,
  deletePhoto,
  saveProperty,
  setMainPhoto,
  uploadPhoto,
  type EditorState,
} from "./property-actions";
import {
  PhotoCropQueue,
  type CropQueueItem,
} from "./PhotoCropQueue";
import styles from "./admin.module.css";

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
    .join("\n");
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
  property: Property | null;
  photos: Photo[];
  email: string;
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

function CreateForm() {
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
  file: File;
  url: string;
};

type LightboxItem = {
  key: string;
  src: string;
  alt: string;
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

function PhotoPanel({
  propertyId,
  photos,
}: {
  propertyId: string;
  photos: Photo[];
}) {
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadPhoto,
    empty,
  );
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [mainKey, setMainKey] = useState<string | null>(null);
  const [pickError, setPickError] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [cropQueue, setCropQueue] = useState<CropQueueItem[]>([]);
  const [cropIndex, setCropIndex] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingRef = useRef(pending);
  pendingRef.current = pending;
  const cropQueueRef = useRef(cropQueue);
  cropQueueRef.current = cropQueue;
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const main = sorted[0] ?? null;
  const hasPhotos = sorted.length > 0;
  const lightboxItems: LightboxItem[] = pending.map((item) => ({
    key: item.key,
    src: item.url,
    alt: item.file.name,
  }));

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.url));
      cropQueueRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  useEffect(() => {
    if (!uploadState.ok) return;
    setPending((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return [];
    });
    setMainKey(null);
    setLightboxIndex(null);
    setPickError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [uploadState.ok]);

  useEffect(() => {
    if (pending.length === 0) {
      setMainKey(null);
      setLightboxIndex(null);
      return;
    }
    if (mainKey && pending.some((item) => item.key === mainKey)) return;
    setMainKey(hasPhotos ? null : pending[0].key);
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

    const room = Math.max(0, 12 - pending.length);
    if (room === 0) {
      setPickError("Maksimum 12 foto.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const next: CropQueueItem[] = [];
    for (const file of Array.from(list)) {
      if (next.length >= room) {
        setPickError("Maksimum 12 foto seçin.");
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

  const onCropConfirm = (file: File) => {
    const current = cropQueue[cropIndex];
    if (!current) return;

    const pendingItem: PendingFile = {
      key: `${current.key}-cropped`,
      file,
      url: URL.createObjectURL(file),
    };
    setPending((prev) => [...prev, pendingItem]);

    URL.revokeObjectURL(current.url);
    const nextIndex = cropIndex + 1;
    if (nextIndex >= cropQueue.length) {
      setCropQueue([]);
      setCropIndex(0);
      return;
    }
    setCropIndex(nextIndex);
  };

  const removePending = (key: string) => {
    setPending((prev) => {
      const target = prev.find((item) => item.key === key);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((item) => item.key !== key);
    });
    setPickError(null);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.length === 0) {
      setPickError("Əvvəl foto seç.");
      return;
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
      formData.append("files", item.file);
    }
    uploadAction(formData);
  };

  const activeLightbox =
    lightboxIndex !== null ? lightboxItems[lightboxIndex] : null;

  return (
    <aside className={styles.photoPanel}>
      <header className={styles.photoPanelHead}>
        <h2 className={styles.sectionHeading}>Fotolar</h2>
        <p className={styles.hint}>
          Seç · hər fotonu 4:3 kəs · böyüt · əsas · yüklə
        </p>
      </header>

      {main ? (
        <div className={styles.mainPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolvePhotoSrc(main.storage_path)} alt={main.alt || ""} />
          <span className={styles.mainBadge}>Əsas</span>
        </div>
      ) : null}

      {hasPhotos ? (
        <div className={styles.thumbRail} role="list">
          {sorted.map((photo, index) => {
            const isMain = index === 0;
            return (
              <figure
                key={photo.id}
                className={
                  isMain ? `${styles.thumb} ${styles.thumbMain}` : styles.thumb
                }
                role="listitem"
              >
                {isMain ? (
                  <div className={styles.thumbHit}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resolvePhotoSrc(photo.storage_path)}
                      alt={photo.alt || `Foto ${index + 1}`}
                    />
                    <span className={styles.thumbMeta}>Əsas</span>
                  </div>
                ) : (
                  <form action={setMainPhoto} className={styles.thumbPickForm}>
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <button
                      type="submit"
                      className={styles.thumbPick}
                      title="Əsas et"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolvePhotoSrc(photo.storage_path)}
                        alt={photo.alt || `Foto ${index + 1}`}
                      />
                      <span className={styles.thumbPickLabel}>Əsas et</span>
                    </button>
                  </form>
                )}
                <div className={styles.thumbActions}>
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

      <form
        className={hasPhotos ? styles.dropZone : styles.dropZoneEmpty}
        onSubmit={onSubmit}
      >
        <label className={styles.dropLabel}>
          <span className={styles.dropTitle}>
            {hasPhotos ? "Foto əlavə et" : "Fotoları seç"}
          </span>
          <span className={styles.dropHint}>
            Hər şəkil ayrı kəsilir · 4:3 · sonra yüklə
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
                    <img src={item.url} alt={item.file.name} />
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

        {pickError ? <p className={styles.error}>{pickError}</p> : null}
        <Status state={uploadState} />
        <button
          className={styles.submitSecondary}
          type="submit"
          disabled={uploadPending || pending.length === 0}
        >
          {uploadPending
            ? "Yüklənir…"
            : pending.length > 0
              ? `${pending.length} foto yüklə`
              : "Yüklə"}
        </button>
      </form>

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
                onClick={() => setMainKey(activeLightbox.key)}
              >
                {activeLightbox.key === mainKey ? "Əsas seçilib" : "Əsas et"}
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
          onConfirm={onCropConfirm}
          onCancel={clearCropQueue}
        />
      ) : null}
    </aside>
  );
}

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
}: {
  property: Property;
  photos: Photo[];
}) {
  const [saveState, saveAction, savePending] = useActionState(
    saveProperty,
    empty,
  );
  const narrow = useIsNarrow();
  const [step, setStep] = useState(0);
  const url = liveUrl(property.slug);
  const last = STEPS.length - 1;

  useEffect(() => {
    if (!narrow) setStep(0);
  }, [narrow]);

  const goNext = () => setStep((s) => Math.min(s + 1, last));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));
  const visible = (index: number) => !narrow || step === index;

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
        <form className={styles.form} action={saveAction}>
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
                  Lead AZ
                  <textarea
                    className={styles.textarea}
                    name="lead_az"
                    rows={3}
                    defaultValue={property.lead_az}
                  />
                </label>
                <label className={styles.label}>
                  Lead RU
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
              <div className={styles.grid2}>
                <label className={styles.label}>
                  Zona
                  <input
                    className={styles.input}
                    name="zone"
                    defaultValue={property.zone}
                  />
                </label>
                <label className={styles.label}>
                  WhatsApp
                  <input
                    className={styles.input}
                    name="whatsapp_e164"
                    defaultValue={property.whatsapp_e164}
                    placeholder="994501234567"
                  />
                </label>
              </div>
              <label className={styles.label}>
                Zona qeydi
                <textarea
                  className={styles.textarea}
                  name="zone_note"
                  rows={2}
                  defaultValue={property.zone_note}
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
                  <span className={styles.fieldHint}>Başlıq | alt mətn</span>
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
                    <em>Canlı səhifə açıq</em>
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
          <PhotoPanel propertyId={property.id} photos={photos} />
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

export function PropertyEditor({ property, photos, email }: Props) {
  return (
    <div className={styles.panelWide}>
      <header className={styles.panelHeader}>
        <div className={styles.panelHeaderRow}>
          <h1 className={styles.title}>
            {property ? property.brand_name || "Mənzil" : "İlk mənzil"}
          </h1>
          <p className={styles.emailLine}>{email}</p>
        </div>
      </header>

      {property ? (
        <EditForm property={property} photos={photos} />
      ) : (
        <CreateForm />
      )}
    </div>
  );
}
