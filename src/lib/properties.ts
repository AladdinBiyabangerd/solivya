import { propertyPhotoUrl } from "@/lib/storage";
import type { Amenity, LocaleCode, Photo, Property } from "@/types/database";
import type { SitePropertyView } from "@/components/site/types";
import { createClient } from "@/utils/supabase/server";

export type PropertyWithPhotos = Property & {
  zone_note: string;
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

export function resolvePhotoSrc(storagePath: string): string {
  if (
    storagePath.startsWith("http://") ||
    storagePath.startsWith("https://")
  ) {
    return storagePath;
  }
  return propertyPhotoUrl(storagePath);
}

export function toSitePropertyView(
  property: Property & { zone_note?: string },
  photos: Photo[],
  locale: LocaleCode = property.locale_default,
): SitePropertyView {
  const sorted = [...photos].sort((a, b) => a.sort_order - b.sort_order);
  const gallery = sorted.map((photo) => ({
    src: resolvePhotoSrc(photo.storage_path),
    alt: photo.alt || property.brand_name,
  }));

  const heroImage =
    gallery[0]?.src ??
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=80";

  const title = locale === "ru" ? property.title_ru : property.title_az;
  const lead = locale === "ru" ? property.lead_ru : property.lead_az;
  const zoneNote = property.zone_note ?? "";

  return {
    slug: property.slug,
    brandName: property.brand_name,
    kicker: `${property.zone} · Günlük kirayə`,
    title,
    lead,
    zone: property.zone,
    zoneNote,
    rooms: property.rooms,
    guests: property.guests,
    priceNight: Number(property.price_night),
    priceNote: property.price_note || "gecədən başlayaraq",
    minNights: property.min_nights,
    deposit: Number(property.deposit),
    amenities: asAmenities(property.amenities),
    rules: asRules(property.rules),
    whatsappE164: property.whatsapp_e164,
    whatsappMessage:
      locale === "ru"
        ? `Здравствуйте, хочу узнать о жилье «${title}»`
        : `Salam, «${title}» haqqında məlumat almaq istəyirəm`,
    heroImage,
    photos: gallery.slice(0, 5),
    mapImage: gallery.length > 5 ? gallery[gallery.length - 1]?.src : undefined,
    locale,
  };
}

export async function getPublishedPropertyBySlug(
  slug: string,
): Promise<SitePropertyView | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("properties")
    .select("*, photos(*)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    console.error("getPublishedPropertyBySlug", error.message);
    return null;
  }

  if (!data) return null;

  const row = data as unknown as PropertyWithPhotos;
  const photos = Array.isArray(row.photos) ? row.photos : [];
  return toSitePropertyView(row, photos, row.locale_default);
}
