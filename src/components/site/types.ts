import type { Amenity, LocaleCode } from "@/types/database";
import type { SiteUiCopy } from "./i18n";

export type SitePhoto = {
  src: string;
  alt: string;
};

export type SitePropertyView = {
  slug: string;
  brandName: string;
  kicker: string;
  title: string;
  lead: string;
  zone: string;
  zoneNote: string;
  rooms: number;
  guests: number;
  priceNight: number;
  priceNote: string;
  minNights: number;
  deposit: number;
  amenities: Amenity[];
  rules: string[];
  whatsappE164: string;
  whatsappMessage: string;
  stickyWhatsAppMessage: string;
  heroImage: string;
  photos: SitePhoto[];
  mapImage?: string;
  lat?: number | null;
  lng?: number | null;
  locale: LocaleCode;
  ui: SiteUiCopy;
};

export { whatsappHref } from "@/lib/whatsapp";

export function formatPriceAz(amount: number): string {
  return `${Math.round(amount)} ₼`;
}
