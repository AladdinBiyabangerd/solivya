"use client";

import { useActionState, type ReactNode } from "react";
import type { Photo, Property } from "@/types/database";
import { resolvePhotoSrc } from "@/lib/storage";
import {
  createProperty,
  deletePhoto,
  movePhoto,
  saveProperty,
  setMainPhoto,
  uploadPhoto,
  type EditorState,
} from "./property-actions";
import styles from "./admin.module.css";

const empty: EditorState = {};

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
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={styles.fieldGroup}>
      <header className={styles.fieldGroupHead}>
        <p className={styles.sectionLabel}>{label}</p>
        <h2 className={styles.sectionHeading}>{title}</h2>
      </header>
      <div className={styles.fieldGroupBody}>{children}</div>
    </section>
  );
}

function CreateForm() {
  const [state, action, pending] = useActionState(createProperty, empty);

  return (
    <form className={styles.createForm} action={action}>
      <FieldGroup label="Başla" title="Yeni mənzil">
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

  return (
    <aside className={styles.photoPanel}>
      <header className={styles.photoPanelHead}>
        <p className={styles.sectionLabel}>Qalereya</p>
        <h2 className={styles.sectionHeading}>Fotolar</h2>
        <p className={styles.hint}>
          Əsas foto hero-dur. Max 5MB · jpg / png / webp
        </p>
      </header>

      {main ? (
        <div className={styles.mainPreview}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={resolvePhotoSrc(main.storage_path)} alt={main.alt || ""} />
          <span className={styles.mainBadge}>Əsas</span>
        </div>
      ) : (
        <div className={styles.mainEmpty}>Hələ foto yoxdur</div>
      )}

      {sorted.length > 0 ? (
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolvePhotoSrc(photo.storage_path)}
                  alt={photo.alt || `Foto ${index + 1}`}
                />
                <div className={styles.thumbMeta}>
                  <span>{isMain ? "Əsas" : `#${index + 1}`}</span>
                </div>
                <div className={styles.thumbActions}>
                  {!isMain ? (
                    <form action={setMainPhoto}>
                      <input type="hidden" name="photo_id" value={photo.id} />
                      <button className={styles.thumbMainBtn} type="submit">
                        Əsas et
                      </button>
                    </form>
                  ) : null}
                  <form action={movePhoto}>
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      className={styles.thumbIcon}
                      type="submit"
                      aria-label="Sola"
                      disabled={index === 0}
                    >
                      ←
                    </button>
                  </form>
                  <form action={movePhoto}>
                    <input type="hidden" name="photo_id" value={photo.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      className={styles.thumbIcon}
                      type="submit"
                      aria-label="Sağa"
                      disabled={index === sorted.length - 1}
                    >
                      →
                    </button>
                  </form>
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

      <form className={styles.dropZone} action={uploadAction}>
        <input type="hidden" name="property_id" value={propertyId} />
        <label className={styles.dropLabel}>
          <span className={styles.dropTitle}>Foto əlavə et</span>
          <span className={styles.dropHint}>Fayl seç və ya bura at</span>
          <input
            className={styles.dropFile}
            type="file"
            name="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            required
          />
        </label>
        <input
          className={styles.input}
          name="alt"
          placeholder="Qısa alt mətn (istəyə görə)"
        />
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

  const url = liveUrl(property.slug);

  return (
    <div className={styles.editorStack}>
      <div className={styles.liveBar}>
        <div className={styles.liveCopy}>
          <p className={styles.sectionLabel}>Canlı səhifə</p>
          <a
            className={styles.liveLink}
            href={url}
            target="_blank"
            rel="noreferrer"
          >
            {url}
          </a>
        </div>
        <span
          className={
            property.published ? styles.statusLive : styles.statusDraft
          }
        >
          {property.published ? "Published" : "Draft"}
        </span>
      </div>

      <div className={styles.editorSplit}>
        <form className={styles.form} action={saveAction}>
          <input type="hidden" name="id" value={property.id} />

          <FieldGroup label="Kimlik" title="Brend və ünvan">
            <div className={styles.grid2}>
              <label className={styles.label}>
                Brend
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

          <FieldGroup label="Mətn" title="Başlıq və təsvir">
            <div className={styles.grid2}>
              <label className={styles.label}>
                Başlıq (AZ)
                <input
                  className={styles.input}
                  name="title_az"
                  defaultValue={property.title_az}
                />
              </label>
              <label className={styles.label}>
                Başlıq (RU)
                <input
                  className={styles.input}
                  name="title_ru"
                  defaultValue={property.title_ru}
                />
              </label>
            </div>
            <label className={styles.label}>
              Lead (AZ)
              <textarea
                className={styles.textarea}
                name="lead_az"
                rows={2}
                defaultValue={property.lead_az}
              />
            </label>
            <label className={styles.label}>
              Lead (RU)
              <textarea
                className={styles.textarea}
                name="lead_ru"
                rows={2}
                defaultValue={property.lead_ru}
              />
            </label>
          </FieldGroup>

          <FieldGroup label="Yerləşmə" title="Zona və əlaqə">
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

          <FieldGroup label="Qiymət" title="Gecəlik və şərtlər">
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
                Qiymət / gecə
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

          <FieldGroup label="Detallar" title="Təchizat və qaydalar">
            <label className={styles.label}>
              Təchizat
              <textarea
                className={styles.textarea}
                name="amenities"
                rows={3}
                defaultValue={amenitiesToText(property.amenities)}
              />
              <span className={styles.fieldHint}>
                Hər sətir: Başlıq | alt mətn
              </span>
            </label>
            <label className={styles.label}>
              Qaydalar
              <textarea
                className={styles.textarea}
                name="rules"
                rows={3}
                defaultValue={rulesToText(property.rules)}
              />
              <span className={styles.fieldHint}>Hər sətir bir qayda</span>
            </label>
            <div className={styles.grid2}>
              <label className={styles.label}>
                Default dil
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
                  <em>İctimai səhifə açıq olsun</em>
                </span>
              </label>
            </div>
          </FieldGroup>

          <div className={styles.saveBar}>
            <Status state={saveState} />
            <button
              className={styles.submit}
              type="submit"
              disabled={savePending}
            >
              {savePending ? "Saxlanılır…" : "Yadda saxla"}
            </button>
          </div>
        </form>

        <PhotoPanel propertyId={property.id} photos={photos} />
      </div>
    </div>
  );
}

export function PropertyEditor({ property, photos, email }: Props) {
  return (
    <div className={styles.panelWide}>
      <header className={styles.panelHeader}>
        <h1 className={styles.title}>
          {property ? property.brand_name || "Mənzil redaktəsi" : "İlk mənzil"}
        </h1>
        <p className={styles.meta}>
          {property
            ? "Mətn, qiymət və fotoları yenilə — publish edəndə canlı səhifə dəyişir."
            : "Brend adı və slug ilə başla; sonra məzmunu dolduracaqsan."}
        </p>
        <p className={styles.emailLine}>{email}</p>
      </header>

      {property ? (
        <EditForm property={property} photos={photos} />
      ) : (
        <CreateForm />
      )}
    </div>
  );
}
