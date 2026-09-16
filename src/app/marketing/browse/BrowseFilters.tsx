"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AMENITIES, parseAmenityIds, type AmenityId } from "@/lib/amenities";
import {
  AZ_LOCATIONS,
  matchesSearch,
} from "@/lib/azerbaijan-locations";
import type { LocaleCode } from "@/types/database";
import type { ListingFilters } from "@/lib/properties";
import { browseQueryString } from "./filterParams";
import styles from "./browse.module.css";

const AMENITY_PREVIEW = 10;

/** Strings only — never pass BrowseCopy (has functions) into a client component. */
export type BrowseFilterCopy = {
  filtersAria: string;
  filtersToggle: string;
  filtersApply: string;
  filtersClear: string;
  filterAny: string;
  filterCity: string;
  filterRayon: string;
  filterNish: string;
  filterPriceMin: string;
  filterPriceMax: string;
  filterRooms: string;
  filterGuests: string;
  filterAmenities: string;
  filterAmenitySearch: string;
  filterAmenityEmpty: string;
  filterAmenityMore: string;
};

export type BrowseIntroCopy = {
  label: string;
  title: string;
  lead: string;
  count: string | null;
};

type Props = {
  locale: LocaleCode;
  owner?: string;
  filters: ListingFilters;
  copy: BrowseFilterCopy;
  intro: BrowseIntroCopy;
};

export function BrowseFilters({
  locale,
  owner,
  filters,
  copy,
  intro,
}: Props) {
  const [cityId, setCityId] = useState(filters.cityId ?? "");
  const [rayonId, setRayonId] = useState(filters.rayonId ?? "");
  const [nishId, setNishId] = useState(filters.nishangahId ?? "");
  const [amenityQuery, setAmenityQuery] = useState("");
  const [pickedAmenities, setPickedAmenities] = useState(
    () => new Set<AmenityId>(parseAmenityIds(filters.amenityIds ?? [])),
  );
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

  const clearHref = `/browse?${browseQueryString({ lang: locale, owner })}`;

  const visibleAmenities = useMemo(() => {
    const q = amenityQuery.trim();
    if (q) {
      return AMENITIES.filter((item) => {
        const label = locale === "ru" ? item.ru : item.az;
        return matchesSearch(label, q) || matchesSearch(item.id, q);
      });
    }
    return AMENITIES.slice(0, AMENITY_PREVIEW);
  }, [amenityQuery, locale]);

  const toggleAmenity = (id: AmenityId, checked: boolean) => {
    setPickedAmenities((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  return (
    <>
      <header className={styles.intro}>
        <div className={styles.introCopy}>
          <p className={styles.introLabel}>{intro.label}</p>
          <h1 className={styles.title}>{intro.title}</h1>
          <p className={styles.lead}>{intro.lead}</p>
          {intro.count ? (
            <p className={styles.count}>{intro.count}</p>
          ) : null}
        </div>
        <div className={styles.introFilter}>
          <button
            type="button"
            className={styles.filtersToggle}
            aria-expanded={open}
            aria-controls="browse-filters-panel"
            onClick={() => setOpen((v) => !v)}
          >
            {copy.filtersToggle}
            <span aria-hidden="true">{open ? "−" : "+"}</span>
          </button>
        </div>
      </header>

      <section
        id="browse-filters-panel"
        className={styles.filters}
        aria-label={copy.filtersAria}
        hidden={!open}
      >
        <div className={styles.filtersBar}>
          <p className={styles.filtersBarTitle}>{copy.filtersToggle}</p>
          <Link className={styles.filtersClear} href={clearHref}>
            {copy.filtersClear}
          </Link>
        </div>

        <form className={styles.filtersForm} method="get" action="/browse">
          <input type="hidden" name="lang" value={locale} />
          {owner ? <input type="hidden" name="owner" value={owner} /> : null}
          {Array.from(pickedAmenities).map((id) => (
            <input key={id} type="hidden" name="amenity" value={id} />
          ))}

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
            <label className={styles.amenitySearchLabel}>
              <span className={styles.srOnly}>{copy.filterAmenitySearch}</span>
              <input
                className={styles.filterControl}
                type="search"
                value={amenityQuery}
                onChange={(e) => setAmenityQuery(e.target.value)}
                placeholder={copy.filterAmenitySearch}
                autoComplete="off"
              />
            </label>
            {!amenityQuery.trim() && AMENITIES.length > AMENITY_PREVIEW ? (
              <p className={styles.amenityHint}>
                {copy.filterAmenityMore.replace(
                  "{n}",
                  String(AMENITIES.length - AMENITY_PREVIEW),
                )}
              </p>
            ) : null}
            {visibleAmenities.length === 0 ? (
              <p className={styles.amenityEmpty}>{copy.filterAmenityEmpty}</p>
            ) : (
              <div className={styles.filterAmenityGrid}>
                {visibleAmenities.map((item) => {
                  const label = locale === "ru" ? item.ru : item.az;
                  const id = item.id as AmenityId;
                  return (
                    <label key={id} className={styles.filterAmenity}>
                      <input
                        type="checkbox"
                        checked={pickedAmenities.has(id)}
                        onChange={(e) => toggleAmenity(id, e.target.checked)}
                      />
                      <span>{label}</span>
                    </label>
                  );
                })}
              </div>
            )}
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
    </>
  );
}
