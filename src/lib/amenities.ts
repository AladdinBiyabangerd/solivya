import type { Amenity, LocaleCode } from "@/types/database";

export const AMENITY_IDS = [
  "wifi",
  "ac",
  "heating",
  "washer",
  "kitchen",
  "dishwasher",
  "parking",
  "elevator",
  "hot_water",
  "tv",
  "workspace",
  "balcony",
  "sea_view",
  "iron",
  "hairdryer",
  "towels",
  "linens",
  "self_checkin",
] as const;

export type AmenityId = (typeof AMENITY_IDS)[number];

export type AmenityDef = {
  id: AmenityId;
  az: string;
  ru: string;
};

export const AMENITIES: AmenityDef[] = [
  { id: "wifi", az: "Wi‑Fi", ru: "Wi‑Fi" },
  { id: "ac", az: "Kondisioner", ru: "Кондиционер" },
  { id: "heating", az: "İstilik / kombi", ru: "Отопление" },
  { id: "washer", az: "Paltaryuyan", ru: "Стиральная машина" },
  { id: "kitchen", az: "Mətbəx", ru: "Кухня" },
  { id: "dishwasher", az: "Qabyuyan", ru: "Посудомойка" },
  { id: "parking", az: "Parking", ru: "Парковка" },
  { id: "elevator", az: "Lift", ru: "Лифт" },
  { id: "hot_water", az: "İsti su", ru: "Горячая вода" },
  { id: "tv", az: "TV", ru: "ТВ" },
  { id: "workspace", az: "İş masası", ru: "Рабочее место" },
  { id: "balcony", az: "Balkon", ru: "Балкон" },
  { id: "sea_view", az: "Dəniz mənzərəsi", ru: "Вид на море" },
  { id: "iron", az: "Ütü", ru: "Утюг" },
  { id: "hairdryer", az: "Fen", ru: "Фен" },
  { id: "towels", az: "Dəsmal", ru: "Полотенца" },
  { id: "linens", az: "Yataq dəsti", ru: "Постельное бельё" },
  { id: "self_checkin", az: "Özünüz check-in", ru: "Самостоятельный заезд" },
];

const BY_ID = new Map(AMENITIES.map((item) => [item.id, item]));

export function isAmenityId(value: string): value is AmenityId {
  return BY_ID.has(value as AmenityId);
}

export function parseAmenityIds(values: unknown): AmenityId[] {
  if (!Array.isArray(values)) return [];
  const seen = new Set<AmenityId>();
  const out: AmenityId[] = [];
  for (const item of values) {
    if (typeof item !== "string") continue;
    const id = item.trim();
    if (!isAmenityId(id) || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function amenityLabel(id: AmenityId, locale: LocaleCode): string {
  const def = BY_ID.get(id);
  if (!def) return id;
  return locale === "ru" ? def.ru : def.az;
}

/** Microsite / card display rows from stored amenity IDs (+ optional free-text). */
export function amenitiesToView(
  ids: unknown,
  locale: LocaleCode,
  extra?: string,
): Amenity[] {
  const rows: Amenity[] = parseAmenityIds(ids).map((id) => ({
    title: amenityLabel(id, locale),
  }));
  const note = extra?.trim();
  if (note) {
    rows.push({ title: note });
  }
  return rows;
}

/** Best-effort map free-text titles → taxonomy ids (migration / legacy rows). */
export function guessAmenityIdsFromText(raw: string): AmenityId[] {
  const n = raw
    .toLocaleLowerCase("az")
    .replaceAll("ə", "e")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replaceAll("ç", "c")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g")
    .replaceAll("‑", "-")
    .replaceAll("—", "-");

  const found: AmenityId[] = [];
  const add = (id: AmenityId) => {
    if (!found.includes(id)) found.push(id);
  };

  if (/wi-?fi|вайфай|интернет/.test(n)) add("wifi");
  if (/kondision|кондиц|air.?cond|\bac\b/.test(n)) add("ac");
  if (/kombi|istilik|отопл|heating/.test(n)) add("heating");
  if (/paltaryuyan|стирал|washer|washing/.test(n)) add("washer");
  if (/metbex|кухн|kitchen/.test(n)) add("kitchen");
  if (/qabyuyan|посудом|dishwasher/.test(n)) add("dishwasher");
  if (/parking|парков|avtoyeri/.test(n)) add("parking");
  if (/lift|лифт|elevator/.test(n)) add("elevator");
  if (/isti su|горяч|hot.?water/.test(n)) add("hot_water");
  if (/\btv\b|телевиз|netflix|smart tv/.test(n)) add("tv");
  if (/is masasi|рабоч|workspace|desk/.test(n)) add("workspace");
  if (/balkon|балкон/.test(n)) add("balcony");
  if (/deniz|море|sea.?view/.test(n)) add("sea_view");
  if (/utu|утюг|iron/.test(n) && !/kombi/.test(n)) add("iron");
  if (/fen\b|фен|hair.?dry/.test(n)) add("hairdryer");
  if (/desmal|полотен/.test(n)) add("towels");
  if (/yataq dest|постел|linens|bedding/.test(n)) add("linens");
  if (/self.?check|ozunuz check|самостоятель/.test(n)) add("self_checkin");

  return found;
}
