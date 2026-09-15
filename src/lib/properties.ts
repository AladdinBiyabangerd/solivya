import { resolvePhotoSrc } from "@/lib/storage";
import type { Amenity, LocaleCode, Photo, Property } from "@/types/database";
import { SITE_UI } from "@/components/site/i18n";
import type { SitePropertyView } from "@/components/site/types";
import { createClient } from "@/utils/supabase/server";

export type PropertyWithPhotos = Property & {
  photos: Photo[];
};

function asAmenities(value: Property["amenities"]): Amenity[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is Amenity =>
      typeof item === "object" &&
      item !== null &&
      "title" in item &&
      typeof (item as Amenity).title === "string",
  );
}

function asRules(value: Property["rules"]): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export { resolvePhotoSrc };

export function toSitePropertyView(
  property: Property & { zone_note?: string; lat?: number | null; lng?: number | null },
  photos: Photo[],
  locale: LocaleCode = property.locale_default,
): SitePropertyView {
  const ui = SITE_UI[locale];
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const gallery = sorted.map((photo) => ({
    src: resolvePhotoSrc(photo.storage_path),
    alt: photo.alt || property.brand_name,
  }));

  const heroImage =
    gallery[0]?.src ??
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=80";

  // Site layout: [0]=hero+large tile, [1..4]=gallery, [5]=map (if any), rest unused on page
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
    amenities: asAmenities(property.amenities),
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
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

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
