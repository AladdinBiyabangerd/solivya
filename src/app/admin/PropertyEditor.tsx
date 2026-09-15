"use client";

import { useActionState } from "react";
import type { Photo, Property } from "@/types/database";
import { resolvePhotoSrc } from "@/lib/storage";
import {
  createProperty,
  deletePhoto,
  movePhoto,
  saveProperty,
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

function CreateForm() {
  const [state, action, pending] = useActionState(createProperty, empty);

  return (
    <form className={styles.form} action={action}>
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
      </label>
      <Status state={state} />
      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? "Yaradılır…" : "Mənzil yarat"}
      </button>
    </form>
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
  const [uploadState, uploadAction, uploadPending] = useActionState(
    uploadPhoto,
    empty,
  );

  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const url = liveUrl(property.slug);

  return (
    <div className={styles.editorStack}>
      <div className={styles.liveBar}>
        <span>
          Canlı link:{" "}
          <a className={styles.switchLink} href={url} target="_blank" rel="noreferrer">
            {url}
          </a>
        </span>
        <span className={styles.badge}>
          {property.published ? "Published" : "Draft"}
        </span>
      </div>

      <form className={styles.form} action={saveAction}>
        <input type="hidden" name="id" value={property.id} />

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
            rows={3}
            defaultValue={property.lead_az}
          />
        </label>
        <label className={styles.label}>
          Lead (RU)
          <textarea
            className={styles.textarea}
            name="lead_ru"
            rows={3}
            defaultValue={property.lead_ru}
          />
        </label>

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
            WhatsApp (994…)
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

        <label className={styles.label}>
          Təchizat (hər sətir: Başlıq | alt mətn)
          <textarea
            className={styles.textarea}
            name="amenities"
            rows={4}
            defaultValue={amenitiesToText(property.amenities)}
          />
        </label>

        <label className={styles.label}>
          Qaydalar (hər sətir bir qayda)
          <textarea
            className={styles.textarea}
            name="rules"
            rows={4}
            defaultValue={rulesToText(property.rules)}
          />
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
            Publish (ictimai səhifə açıq)
          </label>
        </div>

        <Status state={saveState} />
        <button className={styles.submit} type="submit" disabled={savePending}>
          {savePending ? "Saxlanılır…" : "Yadda saxla"}
        </button>
      </form>

      <section className={styles.photoSection}>
        <h2 className={styles.sectionHeading}>Fotolar</h2>
        <p className={styles.hint}>
          İlk foto hero olur. Max 5MB · jpg/png/webp
        </p>

        <div className={styles.photoGrid}>
          {sorted.map((photo, index) => (
            <figure key={photo.id} className={styles.photoCard}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resolvePhotoSrc(photo.storage_path)} alt={photo.alt} />
              <figcaption>
                #{index + 1}
                {photo.alt ? ` · ${photo.alt}` : ""}
              </figcaption>
              <div className={styles.photoActions}>
                <form action={movePhoto}>
                  <input type="hidden" name="photo_id" value={photo.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button className={styles.ghost} type="submit">
                    ↑
                  </button>
                </form>
                <form action={movePhoto}>
                  <input type="hidden" name="photo_id" value={photo.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button className={styles.ghost} type="submit">
                    ↓
                  </button>
                </form>
                <form action={deletePhoto}>
                  <input type="hidden" name="photo_id" value={photo.id} />
                  <button className={styles.danger} type="submit">
                    Sil
                  </button>
                </form>
              </div>
            </figure>
          ))}
        </div>

        <form className={styles.form} action={uploadAction}>
          <input type="hidden" name="property_id" value={property.id} />
          <label className={styles.label}>
            Yeni foto
            <input
              className={styles.input}
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              required
            />
          </label>
          <label className={styles.label}>
            Alt mətn
            <input className={styles.input} name="alt" placeholder="Qonaq otağı" />
          </label>
          <Status state={uploadState} />
          <button className={styles.submit} type="submit" disabled={uploadPending}>
            {uploadPending ? "Yüklənir…" : "Foto yüklə"}
          </button>
        </form>
      </section>
    </div>
  );
}

export function PropertyEditor({ property, photos, email }: Props) {
  return (
    <div className={styles.panelWide}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Solivya · admin</p>
          <h1 className={styles.title}>
            {property ? "Mənzil redaktəsi" : "İlk mənzilini yarat"}
          </h1>
          <p className={styles.meta}>
            {email}
          </p>
        </div>
      </div>

      {property ? (
        <EditForm property={property} photos={photos} />
      ) : (
        <CreateForm />
      )}
    </div>
  );
}
