import type { ListingFilters } from "@/lib/properties";
import { parseAmenityIds } from "@/lib/amenities";

export type BrowseSearchParams = {
  lang?: string;
  owner?: string;
  price_min?: string;
  price_max?: string;
  rooms?: string;
  guests?: string;
  city?: string;
  rayon?: string;
  nish?: string;
  amenity?: string | string[];
};

function positiveInt(raw: string | undefined): number | undefined {
  if (!raw?.trim()) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.floor(n);
}

function nonNegNumber(raw: string | undefined): number | undefined {
  if (!raw?.trim()) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

export function listingFiltersFromSearchParams(
  params: BrowseSearchParams,
): ListingFilters {
  const amenityRaw = params.amenity;
  const amenityList = Array.isArray(amenityRaw)
    ? amenityRaw
    : amenityRaw
      ? [amenityRaw]
      : [];

  return {
    priceMin: nonNegNumber(params.price_min),
    priceMax: nonNegNumber(params.price_max),
    roomsMin: positiveInt(params.rooms),
    guestsMin: positiveInt(params.guests),
    cityId: params.city?.trim() || undefined,
    rayonId: params.rayon?.trim() || undefined,
    nishangahId: params.nish?.trim() || undefined,
    amenityIds: parseAmenityIds(amenityList),
  };
}

export function hasActiveListingFilters(filters: ListingFilters): boolean {
  return Boolean(
    filters.priceMin != null ||
      filters.priceMax != null ||
      filters.roomsMin != null ||
      filters.guestsMin != null ||
      filters.cityId ||
      filters.rayonId ||
      filters.nishangahId ||
      (filters.amenityIds && filters.amenityIds.length > 0),
  );
}

/** Build /browse query string preserving lang/owner + filters. */
export function browseQueryString(opts: {
  lang: string;
  owner?: string;
  filters?: ListingFilters;
}): string {
  const q = new URLSearchParams();
  q.set("lang", opts.lang);
  if (opts.owner) q.set("owner", opts.owner);
  const f = opts.filters;
  if (f?.priceMin != null) q.set("price_min", String(f.priceMin));
  if (f?.priceMax != null) q.set("price_max", String(f.priceMax));
  if (f?.roomsMin != null) q.set("rooms", String(f.roomsMin));
  if (f?.guestsMin != null) q.set("guests", String(f.guestsMin));
  if (f?.cityId) q.set("city", f.cityId);
  if (f?.rayonId) q.set("rayon", f.rayonId);
  if (f?.nishangahId) q.set("nish", f.nishangahId);
  for (const id of f?.amenityIds ?? []) {
    q.append("amenity", id);
  }
  return q.toString();
}
