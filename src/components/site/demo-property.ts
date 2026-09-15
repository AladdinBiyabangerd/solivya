import type { SitePropertyView } from "./types";

/** Static demo for Addım 6 UI — Addım 7 DB-yə bağlayacaq. */
export const DEMO_PROPERTY: SitePropertyView = {
  slug: "demo",
  brandName: "Sahil Stay",
  kicker: "Bakı · Səbail · Günlük kirayə",
  title: "Bulvar yaxınlığında sakit 2 otaqlı",
  lead:
    "İşıqlı otaqlar, tam mətbəx və şəhərin mərkəzinə piyada məsafə — qısa və rahat qalış üçün.",
  zone: "Səbail · Bulvar zonası",
  zoneNote:
    "Sahil metrosuna və Dənizkənarı bulvara yaxın. Dəqiq ünvan bron zamanı göndərilir.",
  rooms: 2,
  guests: 4,
  priceNight: 90,
  priceNote: "gecədən başlayaraq",
  minNights: 2,
  deposit: 50,
  amenities: [
    { title: "Sürətli Wi‑Fi", subtitle: "İş və streaming üçün" },
    { title: "Kombi + kondisioner", subtitle: "Bütün mövsümlər" },
    { title: "Tam mətbəx", subtitle: "Plyta, soyuducu, qablar" },
    { title: "Smart TV", subtitle: "Netflix hazır" },
  ],
  rules: [
    "Minimum qalış: 2 gecə",
    "Depozit: 50 ₼ (çıxışda qaytarılır)",
    "Siqaret və partiya qadağandır",
    "Check-in: 15:00 · Check-out: 12:00",
  ],
  whatsappE164: "994501234567",
  whatsappMessage:
    "Salam, Bulvar yaxını mənzil haqqında məlumat almaq istəyirəm",
  heroImage:
    "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=80",
  photos: [
    {
      src: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=1200&q=80",
      alt: "Qonaq otağı",
    },
    {
      src: "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=800&q=80",
      alt: "Mətbəx",
    },
    {
      src: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80",
      alt: "Yataq otağı",
    },
    {
      src: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
      alt: "Hamam",
    },
    {
      src: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80",
      alt: "Detal",
    },
  ],
  mapImage:
    "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1200&q=80",
  locale: "az",
};
