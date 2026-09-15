"use client";

import {
  useActionState,
  useEffect,
  useState,
  type ReactNode,
} from "react";
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
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const main = sorted[0] ?? null;
  const hasPhotos = sorted.length > 0;

  return (
    <aside className={styles.photoPanel}>
      <header className={styles.photoPanelHead}>
        <h2 className={styles.sectionHeading}>Fotolar</h2>
        <p className={styles.hint}>
          Bir neçə foto seç · üzərinə kliklə → əsas · max 5MB
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
        action={uploadAction}
      >
        <input type="hidden" name="property_id" value={propertyId} />
        <label className={styles.dropLabel}>
          <span className={styles.dropTitle}>
            {hasPhotos ? "Foto əlavə et" : "Fotoları yüklə"}
          </span>
          <span className={styles.dropHint}>
            Eyni anda bir neçə · jpg / png / webp · max 5MB
          </span>
          <input
            className={styles.dropFile}
            type="file"
            name="files"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            required
          />
        </label>
        <Status state={uploadState} />
        <button
          className={styles.submitSecondary}
          type="submit"
          disabled={uploadPending}
        >
          {uploadPending ? "Yüklənir…" : "Yüklə"}
        </button>
      </form>
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
