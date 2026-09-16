"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AMENITIES, type AmenityId } from "@/lib/amenities";
import { AZ_LOCATIONS } from "@/lib/azerbaijan-locations";
import type { LocaleCode } from "@/types/database";
import type { BrowseCopy } from "./copy";
import type { ListingFilters } from "@/lib/properties";
import { browseQueryString } from "./filterParams";
import styles from "./browse.module.css";

type Props = {
  locale: LocaleCode;
  owner?: string;
  filters: ListingFilters;
  copy: BrowseCopy;
};

export function BrowseFilters({ locale, owner, filters, copy }: Props) {
  const [cityId, setCityId] = useState(filters.cityId ?? "");
  const [rayonId, setRayonId] = useState(filters.rayonId ?? "");
  const [nishId, setNishId] = useState(filters.nishangahId ?? "");
  const [open, setOpen] = useState(() =>
    Boolean(
      filters.priceMin != null ||
        filters.priceMax != null ||
        filters.roomsMin != null ||
        filters.guestsMin != null ||
        filters.cityId ||
        filters.rayonId ||
        filters.nishangahId ||
        (filters.amenityIds && filters.amenityIds.length > 0),
    ),
  );

  const city = AZ_LOCATIONS.find((c) => c.id === cityId);
  const rayons = city?.children ?? [];
  const rayon = rayons.find((r) => r.id === rayonId);
  const nishangahs = rayon?.children ?? [];

  const selectedAmenities = useMemo(
    () => new Set(filters.amenityIds ?? []),
    [filters.amenityIds],
  );

  const clearHref = `/browse?${browseQueryString({ lang: locale, owner })}`;

  return (
    <section className={styles.filters} aria-label={copy.filtersAria}>
      <div className={styles.filtersBar}>
        <button
          type="button"
          className={styles.filtersToggle}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {copy.filtersToggle}
          <span aria-hidden="true">{open ? "−" : "+"}</span>
        </button>
        {open ? (
          <Link className={styles.filtersClear} href={clearHref}>
            {copy.filtersClear}
          </Link>
        ) : null}
      </div>

      <form
        className={styles.filtersForm}
        method="get"
        action="/browse"
        hidden={!open}
      >
        <input type="hidden" name="lang" value={locale} />
        {owner ? <input type="hidden" name="owner" value={owner} /> : null}

        <div className={styles.filtersRow}>
          <label className={styles.filterField}>
            <span>{copy.filterCity}</span>
            <select
              className={styles.filterControl}
              name="city"
              value={cityId}
              onChange={(e) => {
                setCityId(e.target.value);
                setRayonId("");
                setNishId("");
              }}
            >
              <option value="">{copy.filterAny}</option>
              {AZ_LOCATIONS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>{copy.filterRayon}</span>
            <select
              className={styles.filterControl}
              name="rayon"
              value={rayonId}
              disabled={!cityId || rayons.length === 0}
              onChange={(e) => {
                setRayonId(e.target.value);
                setNishId("");
              }}
            >
              <option value="">{copy.filterAny}</option>
              {rayons.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.filterField}>
            <span>{copy.filterNish}</span>
            <select
              className={styles.filterControl}
              name="nish"
              value={nishId}
              disabled={!rayonId || nishangahs.length === 0}
              onChange={(e) => setNishId(e.target.value)}
            >
              <option value="">{copy.filterAny}</option>
              {nishangahs.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className={styles.filtersRow}>
          <label className={styles.filterField}>
            <span>{copy.filterPriceMin}</span>
            <input
              className={styles.filterControl}
              type="number"
              name="price_min"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={filters.priceMin ?? ""}
              placeholder="0"
            />
          </label>
          <label className={styles.filterField}>
            <span>{copy.filterPriceMax}</span>
            <input
              className={styles.filterControl}
              type="number"
              name="price_max"
              min={0}
              step={1}
              inputMode="numeric"
              defaultValue={filters.priceMax ?? ""}
              placeholder="500"
            />
          </label>
          <label className={styles.filterField}>
            <span>{copy.filterRooms}</span>
            <input
              className={styles.filterControl}
              type="number"
              name="rooms"
              min={1}
              step={1}
              inputMode="numeric"
              defaultValue={filters.roomsMin ?? ""}
              placeholder="1"
            />
          </label>
          <label className={styles.filterField}>
            <span>{copy.filterGuests}</span>
            <input
              className={styles.filterControl}
              type="number"
              name="guests"
              min={1}
              step={1}
              inputMode="numeric"
              defaultValue={filters.guestsMin ?? ""}
              placeholder="2"
            />
          </label>
        </div>

        <fieldset className={styles.filterAmenities}>
          <legend>{copy.filterAmenities}</legend>
          <div className={styles.filterAmenityGrid}>
            {AMENITIES.map((item) => {
              const label = locale === "ru" ? item.ru : item.az;
              const id = item.id as AmenityId;
              return (
                <label key={id} className={styles.filterAmenity}>
                  <input
                    type="checkbox"
                    name="amenity"
                    value={id}
                    defaultChecked={selectedAmenities.has(id)}
                  />
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className={styles.filtersActions}>
          <button type="submit" className={styles.filtersApply}>
            {copy.filtersApply}
          </button>
          <Link className={styles.filtersClearBtn} href={clearHref}>
            {copy.filtersClear}
          </Link>
        </div>
      </form>
    </section>
  );
}
