import { amenitiesToView, guessAmenityIdsFromText, parseAmenityIds } from "@/lib/amenities";
import { resolvePhotoSrc } from "@/lib/storage";
import { BRAND } from "@/lib/site";
import type { Amenity, LocaleCode, Photo, Property } from "@/types/database";
import { SITE_UI } from "@/components/site/i18n";
import type { SitePropertyView } from "@/components/site/types";
import { getCurrentUser } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/server";

export type PropertyWithPhotos = Property & {
  photos: Photo[];
};

/** Resolve stored amenity ids (or legacy {title} objects) for display. */
function asAmenities(
  value: Property["amenities"],
  locale: LocaleCode,
  extra?: string,
): Amenity[] {
  if (!Array.isArray(value) || value.length === 0) {
    return amenitiesToView([], locale, extra);
  }
  if (typeof value[0] === "string") {
    return amenitiesToView(value, locale, extra);
  }
  // Legacy rows not yet migrated
  const titles: string[] = [];
  for (const item of value) {
    if (
      item &&
      typeof item === "object" &&
      "title" in item &&
      typeof (item as Amenity).title === "string"
    ) {
      titles.push((item as Amenity).title);
    }
  }
  const ids = titles.flatMap((t) => guessAmenityIdsFromText(t));
  const unmatched = titles.filter((t) => guessAmenityIdsFromText(t).length === 0);
  const note = [extra?.trim(), ...unmatched].filter(Boolean).join(", ");
  return amenitiesToView(parseAmenityIds(ids), locale, note || undefined);
}

function asRules(value: Property["rules"]): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export { resolvePhotoSrc };

/** Owner-selected main photo is always sort_order 0. */
export function sortPhotosByOrder<T extends { sort_order: number }>(
  photos: T[],
): T[] {
  return [...photos].sort((a, b) => a.sort_order - b.sort_order);
}

/** Main (Əsas) photo — the one the owner picks for hero / share preview. */
export function mainPhotoFromList(photos: Photo[]): Photo | null {
  const sorted = sortPhotosByOrder(photos);
  return sorted[0] ?? null;
}

/** Absolute public URL for share cards (WhatsApp / Telegram / OG). */
export function mainPhotoShareUrl(photos: Photo[]): string | null {
  const main = mainPhotoFromList(photos);
  if (!main) return null;
  return resolvePhotoSrc(main.storage_path);
}

export function toSitePropertyView(
  property: Property & {
    zone_note?: string;
    amenities_extra?: string;
    lat?: number | null;
    lng?: number | null;
  },
  photos: Photo[],
  locale: LocaleCode = property.locale_default,
): SitePropertyView {
  const ui = SITE_UI[locale];
  const sorted = sortPhotosByOrder(photos);
  const gallery = sorted.map((photo) => ({
    src: resolvePhotoSrc(photo.storage_path),
    alt: photo.alt || property.brand_name,
  }));

  const heroImage = BRAND.coverSrc;

  // Site layout: hero = Solivya brand cover; gallery = owner photos [0..4]; map tile [5]
  const galleryPhotos = gallery.slice(0, 5);
  const mapImage = gallery[5]?.src;

  const title =
    locale === "ru"
      ? property.title_ru || property.title_az
      : property.title_az || property.title_ru;
  const lead =
    locale === "ru"
      ? property.lead_ru || property.lead_az
      : property.lead_az || property.lead_ru;
  const zoneNote = property.zone_note ?? "";

  return {
    slug: property.slug,
    brandName: property.brand_name,
    kicker: property.zone
      ? `${property.zone} · ${ui.rentalKicker}`
      : ui.rentalKicker,
    title,
    lead,
    zone: property.zone,
    zoneNote,
    rooms: property.rooms,
    guests: property.guests,
    priceNight: Number(property.price_night),
    priceNote: property.price_note || (locale === "ru" ? "за ночь" : "gecədən başlayaraq"),
    minNights: property.min_nights,
    deposit: Number(property.deposit),
    amenities: asAmenities(
      property.amenities,
      locale,
      property.amenities_extra,
    ),
    rules: asRules(property.rules),
    whatsappE164: property.whatsapp_e164,
    whatsappMessage:
      locale === "ru"
        ? `Здравствуйте, хочу узнать о жилье «${title}»`
        : `Salam, «${title}» haqqında məlumat almaq istəyirəm`,
    stickyWhatsAppMessage: ui.stickyWhatsAppMessage,
    heroImage,
    photos: galleryPhotos,
    mapImage,
    lat:
      typeof property.lat === "number" && Number.isFinite(property.lat)
        ? property.lat
        : null,
    lng:
      typeof property.lng === "number" && Number.isFinite(property.lng)
        ? property.lng
        : null,
    locale,
    ui,
  };
}

export async function getPublishedPropertyRecord(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*, photos(*)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublishedPropertyRecord", error.message);
    return null;
  }

  if (!data) return null;

  const row = data as unknown as PropertyWithPhotos;
  const photos = Array.isArray(row.photos) ? row.photos : [];
  return { property: row, photos };
}

/** Owner-only: draft or published, for admin preview. */
export async function getOwnerPropertyRecord(slug: string) {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*, photos(*)")
    .eq("slug", slug)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("getOwnerPropertyRecord", error.message);
    return null;
  }

  if (!data) return null;

  const row = data as unknown as PropertyWithPhotos;
  const photos = Array.isArray(row.photos) ? row.photos : [];
  return { property: row, photos };
}

export async function getPublishedPropertyBySlug(
  slug: string,
  locale?: LocaleCode,
): Promise<SitePropertyView | null> {
  const record = await getPublishedPropertyRecord(slug);
  if (!record) return null;
  const resolved = locale ?? record.property.locale_default;
  return toSitePropertyView(record.property, record.photos, resolved);
}

/** Lightweight rows for sitemap (published only; public RLS). */
export async function listPublishedPropertySitemapEntries(): Promise<
  { slug: string; updated_at: string }[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("properties")
    .select("slug, updated_at")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listPublishedPropertySitemapEntries", error.message);
    return [];
  }

  return (data as { slug: string; updated_at: string }[] | null) ?? [];
}

export type PublishedListingCard = {
  slug: string;
  brandName: string;
  title: string;
  zone: string;
  rooms: number;
  guests: number;
  priceNight: number;
  coverSrc: string | null;
  coverAlt: string;
};

export type ListingFilters = {
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
  guestsMin?: number;
  cityId?: string;
  rayonId?: string;
  nishangahId?: string;
  amenityIds?: string[];
};

const LISTING_SELECT =
  "slug, brand_name, title_az, title_ru, zone, rooms, guests, price_night, city_id, rayon_id, nishangah_id, amenities, photos(storage_path, sort_order, alt)";

type ListingRow = Property & {
  photos: Pick<Photo, "storage_path" | "sort_order" | "alt">[] | null;
};

function mapListingRows(
  rows: ListingRow[],
  locale: LocaleCode,
): PublishedListingCard[] {
  return rows.map((row) => {
    const photos = Array.isArray(row.photos) ? row.photos : [];
    const cover = sortPhotosByOrder(photos)[0];
    const title =
      locale === "ru"
        ? row.title_ru || row.title_az
        : row.title_az || row.title_ru;

    return {
      slug: row.slug,
      brandName: row.brand_name,
      title,
      zone: row.zone,
      rooms: row.rooms,
      guests: row.guests,
      priceNight: Number(row.price_night),
      coverSrc: cover ? resolvePhotoSrc(cover.storage_path) : null,
      coverAlt: cover?.alt || row.brand_name,
    };
  });
}

type FilterableQuery = {
  gte: (column: string, value: number) => FilterableQuery;
  lte: (column: string, value: number) => FilterableQuery;
  eq: (column: string, value: string) => FilterableQuery;
  contains: (column: string, value: string[]) => FilterableQuery;
};

function applyListingFilters<T extends FilterableQuery>(
  query: T,
  filters?: ListingFilters,
): T {
  if (!filters) return query;
  let next = query;
  if (typeof filters.priceMin === "number" && Number.isFinite(filters.priceMin)) {
    next = next.gte("price_night", filters.priceMin) as T;
  }
  if (typeof filters.priceMax === "number" && Number.isFinite(filters.priceMax)) {
    next = next.lte("price_night", filters.priceMax) as T;
  }
  if (typeof filters.roomsMin === "number" && Number.isFinite(filters.roomsMin)) {
    next = next.gte("rooms", filters.roomsMin) as T;
  }
  if (
    typeof filters.guestsMin === "number" &&
    Number.isFinite(filters.guestsMin)
  ) {
    next = next.gte("guests", filters.guestsMin) as T;
  }
  if (filters.cityId) {
    next = next.eq("city_id", filters.cityId) as T;
  }
  if (filters.rayonId) {
    next = next.eq("rayon_id", filters.rayonId) as T;
  }
  if (filters.nishangahId) {
    next = next.eq("nishangah_id", filters.nishangahId) as T;
  }
  const amenityIds = parseAmenityIds(filters.amenityIds ?? []);
  if (amenityIds.length > 0) {
    // jsonb array containment — AND (must include every selected id)
    next = next.contains("amenities", amenityIds) as T;
  }
  return next;
}

/** Published listings for the public browse catalog. */
export async function listPublishedListings(
  locale: LocaleCode,
  filters?: ListingFilters,
): Promise<PublishedListingCard[]> {
  const supabase = await createClient();
  const query = applyListingFilters(
    supabase
      .from("properties")
      .select(LISTING_SELECT)
      .eq("published", true)
      .order("updated_at", { ascending: false }),
    filters,
  );

  const { data, error } = await query;

  if (error) {
    console.error("listPublishedListings", error.message);
    return [];
  }

  const rows = (data as unknown as ListingRow[] | null) ?? [];
  return mapListingRows(rows, locale);
}

/** Other published listings by the same owner (excludes current slug). */
export async function listPublishedSiblings(
  ownerId: string,
  excludeSlug: string,
  locale: LocaleCode,
): Promise<PublishedListingCard[]> {
  return listPublishedByOwner(ownerId, locale, excludeSlug);
}

/** All published listings for an owner. */
export async function listPublishedByOwner(
  ownerId: string,
  locale: LocaleCode,
  excludeSlug?: string,
  filters?: ListingFilters,
): Promise<PublishedListingCard[]> {
  const supabase = await createClient();
  let query = applyListingFilters(
    supabase
      .from("properties")
      .select(LISTING_SELECT)
      .eq("published", true)
      .eq("owner_id", ownerId)
      .order("updated_at", { ascending: false }),
    filters,
  );

  if (excludeSlug) {
    query = query.neq("slug", excludeSlug);
  }

  const { data, error } = await query;

  if (error) {
    console.error("listPublishedByOwner", error.message);
    return [];
  }

  const rows = (data as unknown as ListingRow[] | null) ?? [];
  return mapListingRows(rows, locale);
}
