/**
 * Hierarchical locations for daily-rental listings in Azerbaijan.
 * Level 1: şəhər · Level 2: rayon · Level 3: zona / məhəllə (when useful).
 */

export type LocationNode = {
  id: string;
  name: string;
  children?: LocationNode[];
};

export const AZ_LOCATIONS: LocationNode[] = [
  {
    id: "baki",
    name: "Bakı",
    children: [
      {
        id: "sabail",
        name: "Səbail",
        children: [
          { id: "bulvar", name: "Bulvar" },
          { id: "iceriseher", name: "İçərişəhər" },
          { id: "bayil", name: "Bayıl" },
          { id: "badamdar", name: "Badamdar" },
          { id: "shikh", name: "Şıxov" },
          { id: "white-city", name: "White City" },
        ],
      },
      {
        id: "nasimi",
        name: "Nəsimi",
        children: [
          { id: "28-may", name: "28 May" },
          { id: "sahil", name: "Sahil" },
          { id: "port-baku", name: "Port Baku" },
          { id: "cafar-cabbarli", name: "Cəfər Cabbarlı" },
          { id: "kombinat", name: "4-cü mikrorayon" },
        ],
      },
      {
        id: "yasamal",
        name: "Yasamal",
        children: [
          { id: "elmler", name: "Elmlər Akademiyası" },
          { id: "inshaatchilar", name: "İnşaatçılar" },
          { id: "20-yanvar", name: "20 Yanvar" },
          { id: "yeni-yasamal", name: "Yeni Yasamal" },
          { id: "kaspi", name: "Kaspi" },
        ],
      },
      {
        id: "narimanov",
        name: "Nərimanov",
        children: [
          { id: "ganjlik", name: "Gənclik" },
          { id: "nariman-narimanov", name: "Nəriman Nərimanov" },
          { id: "montin", name: "Montin" },
          { id: "halqa", name: "Halqa parkı" },
        ],
      },
      {
        id: "nizami",
        name: "Nizami",
        children: [
          { id: "8-km", name: "8-ci kilometr" },
          { id: "neftchilar", name: "Neftçilər" },
          { id: "xalqlar", name: "Xalqlar Dostluğu" },
          { id: "ahmadli-nizami", name: "Əhmədli" },
        ],
      },
      {
        id: "khatai",
        name: "Xətai",
        children: [
          { id: "hazi-aslanov", name: "Həzi Aslanov" },
          { id: "ahmadli", name: "Əhmədli" },
          { id: "gunashli", name: "Günəşli" },
          { id: "ukraina", name: "Ukrayna dairəsi" },
        ],
      },
      {
        id: "binagadi",
        name: "Binəqədi",
        children: [
          { id: "bilajari", name: "Biləcəri" },
          { id: "binagadi-qas", name: "Binəqədi qəsəbəsi" },
          { id: "6-7-mikrorayon", name: "6–7-ci mikrorayon" },
          { id: "8-9-mikrorayon", name: "8–9-cu mikrorayon" },
          { id: "khojasan", name: "Xocəsən" },
        ],
      },
      {
        id: "sabunchu",
        name: "Sabunçu",
        children: [
          { id: "bakikhanov", name: "Bakıxanov" },
          { id: "zabrat", name: "Zabrat" },
          { id: "ramana", name: "Ramana" },
          { id: "balakhani", name: "Balaxanı" },
          { id: "kurdakhani", name: "Kürdəxanı" },
        ],
      },
      {
        id: "surakhani",
        name: "Suraxanı",
        children: [
          { id: "hovsan", name: "Hovsan" },
          { id: "yeni-gunashli", name: "Yeni Günəşli" },
          { id: "amirjan", name: "Əmircan" },
          { id: "garachukhur", name: "Qaraçuxur" },
        ],
      },
      {
        id: "khazar",
        name: "Xəzər",
        children: [
          { id: "bina", name: "Binə" },
          { id: "buzovna", name: "Buzovna" },
          { id: "mardakan", name: "Mərdəkan" },
          { id: "shuvalan", name: "Şüvəlan" },
          { id: "zaqulba", name: "Zaqulba" },
          { id: "turkan", name: "Türkan" },
        ],
      },
      {
        id: "garadagh",
        name: "Qaradağ",
        children: [
          { id: "lokbatan", name: "Lökbatan" },
          { id: "sahil-qas", name: "Sahil qəsəbəsi" },
          { id: "alat", name: "Ələt" },
          { id: "gobu", name: "Qobu" },
        ],
      },
      {
        id: "pirallahi",
        name: "Pirallahı",
        children: [
          { id: "pirallahi-ada", name: "Pirallahı adası" },
          { id: "turkan-pir", name: "Türkan" },
        ],
      },
    ],
  },
  {
    id: "sumqayit",
    name: "Sumqayıt",
    children: [
      { id: "1-mkr", name: "1-ci mikrorayon" },
      { id: "2-mkr", name: "2-ci mikrorayon" },
      { id: "3-mkr", name: "3-cü mikrorayon" },
      { id: "17-mkr", name: "17-ci mikrorayon" },
      { id: "corat", name: "Corat" },
      { id: "hizzi", name: "Hızı yolu" },
      { id: "merkez-sum", name: "Şəhər mərkəzi" },
    ],
  },
  {
    id: "gence",
    name: "Gəncə",
    children: [
      {
        id: "kapaz",
        name: "Kəpəz",
        children: [
          { id: "kapaz-merkez", name: "Kəpəz mərkəzi" },
          { id: "yeni-gence", name: "Yeni Gəncə" },
        ],
      },
      {
        id: "nizami-gence",
        name: "Nizami",
        children: [
          { id: "nizami-merkez", name: "Nizami mərkəzi" },
          { id: "goygol-yolu", name: "Göygöl yolu" },
        ],
      },
      { id: "gence-merkez", name: "Şəhər mərkəzi" },
      { id: "air-port-gence", name: "Hava limanı yolu" },
    ],
  },
  {
    id: "mingechevir",
    name: "Mingəçevir",
    children: [
      { id: "ming-merkez", name: "Şəhər mərkəzi" },
      { id: "ming-1", name: "1-ci mikrorayon" },
      { id: "ming-2", name: "2-ci mikrorayon" },
      { id: "su-anbari", name: "Su anbarı yanı" },
    ],
  },
  {
    id: "lankaran",
    name: "Lənkəran",
    children: [
      { id: "len-merkez", name: "Şəhər mərkəzi" },
      { id: "liman", name: "Liman" },
      { id: "hirkan", name: "Hirkan" },
      { id: "goytepe", name: "Göytəpə" },
    ],
  },
  {
    id: "shirvan",
    name: "Şirvan",
    children: [
      { id: "shir-merkez", name: "Şəhər mərkəzi" },
      { id: "shir-yeni", name: "Yeni yaşayış massivi" },
    ],
  },
  {
    id: "nakhchivan",
    name: "Naxçıvan",
    children: [
      { id: "nax-merkez", name: "Şəhər mərkəzi" },
      { id: "nax-yeni", name: "Yeni Naxçıvan" },
      { id: "nax-duz", name: "Duzdağ yolu" },
    ],
  },
  {
    id: "shaki",
    name: "Şəki",
    children: [
      { id: "sheki-merkez", name: "Şəhər mərkəzi" },
      { id: "yuxari-bash", name: "Yuxarı Baş" },
      { id: "kish", name: "Kiş" },
    ],
  },
  {
    id: "quba",
    name: "Quba",
    children: [
      { id: "quba-merkez", name: "Şəhər mərkəzi" },
      { id: "qechresh", name: "Qəçrəş" },
      { id: "red-village", name: "Qırmızı Qəsəbə" },
    ],
  },
  {
    id: "gabala",
    name: "Qəbələ",
    children: [
      { id: "qab-merkez", name: "Şəhər mərkəzi" },
      { id: "nij", name: "Nic" },
      { id: "vendam", name: "Vəndam" },
      { id: "tufandag", name: "Tufandağ" },
    ],
  },
  {
    id: "shamakhi",
    name: "Şamaxı",
    children: [
      { id: "sham-merkez", name: "Şəhər mərkəzi" },
      { id: "lahij", name: "Lahıc" },
      { id: "pirgulu", name: "Pirgulu" },
    ],
  },
  {
    id: "khachmaz",
    name: "Xaçmaz",
    children: [
      { id: "xac-merkez", name: "Şəhər mərkəzi" },
      { id: "nabran", name: "Nabran" },
      { id: "yalama", name: "Yalama" },
    ],
  },
  {
    id: "absheron",
    name: "Abşeron",
    children: [
      { id: "khirdalan", name: "Xırdalan" },
      { id: "mehdiabad", name: "Mehdiabad" },
      { id: "novkhani", name: "Novxanı" },
      { id: "masazir", name: "Masazır" },
      { id: "fatmayi", name: "Fatmayı" },
      { id: "saray", name: "Saray" },
      { id: "ceyranbatan", name: "Ceyranbatan" },
    ],
  },
  {
    id: "yevlakh",
    name: "Yevlax",
    children: [
      { id: "yev-merkez", name: "Şəhər mərkəzi" },
      { id: "yev-yeni", name: "Yeni massiv" },
    ],
  },
  {
    id: "barda",
    name: "Bərdə",
    children: [
      { id: "ber-merkez", name: "Şəhər mərkəzi" },
      { id: "ber-yeni", name: "Yeni yaşayış" },
    ],
  },
  {
    id: "agdash",
    name: "Ağdaş",
    children: [{ id: "agd-merkez", name: "Şəhər mərkəzi" }],
  },
  {
    id: "salyan",
    name: "Salyan",
    children: [
      { id: "sal-merkez", name: "Şəhər mərkəzi" },
      { id: "sal-neftchala", name: "Neftçala yolu" },
    ],
  },
  {
    id: "jalilabad",
    name: "Cəlilabad",
    children: [{ id: "cel-merkez", name: "Şəhər mərkəzi" }],
  },
  {
    id: "imishli",
    name: "İmişli",
    children: [{ id: "im-merkez", name: "Şəhər mərkəzi" }],
  },
  {
    id: "goychay",
    name: "Göyçay",
    children: [{ id: "goy-merkez", name: "Şəhər mərkəzi" }],
  },
];

const SEP = " · ";

export function formatZonePath(names: string[]): string {
  return names.filter(Boolean).join(SEP);
}

export function parseZonePath(value: string): string[] {
  if (!value.trim()) return [];
  return value
    .split(SEP)
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Normalize for AZ typeahead (ə/e, ı/i, ö/o, ü/u, ç/c, ş/s, ğ/g). */
export function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("az")
    .replaceAll("ə", "e")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ü", "u")
    .replaceAll("ç", "c")
    .replaceAll("ş", "s")
    .replaceAll("ğ", "g");
}

export function matchesSearch(name: string, query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  return normalizeSearch(name).includes(q);
}

export function findCityByName(name: string): LocationNode | undefined {
  const n = normalizeSearch(name);
  return AZ_LOCATIONS.find((c) => normalizeSearch(c.name) === n);
}

/** Resolve a saved zone string into [city, rayon?, zona?]. */
export function resolveZoneSelection(value: string): {
  cityId: string;
  rayonId: string;
  zonaId: string;
  labels: string[];
} | null {
  const parts = parseZonePath(value);
  if (parts.length === 0) return null;

  // Prefer full path starting with city
  let city = findCityByName(parts[0]);
  let rest = parts.slice(1);

  // Legacy: "Səbail · Bulvar" without Bakı prefix
  if (!city && parts.length >= 1) {
    for (const c of AZ_LOCATIONS) {
      const rayon = c.children?.find(
        (r) => normalizeSearch(r.name) === normalizeSearch(parts[0]),
      );
      if (rayon) {
        city = c;
        rest = parts;
        break;
      }
    }
  }

  if (!city) return null;

  const labels = [city.name];
  let rayonId = "";
  let zonaId = "";

  if (rest.length === 0) {
    return { cityId: city.id, rayonId: "", zonaId: "", labels };
  }

  const rayon = city.children?.find(
    (r) => normalizeSearch(r.name) === normalizeSearch(rest[0]),
  );
  if (!rayon) {
    return { cityId: city.id, rayonId: "", zonaId: "", labels };
  }

  labels.push(rayon.name);
  rayonId = rayon.id;

  if (rest.length >= 2 && rayon.children?.length) {
    const zonaQuery = normalizeSearch(rest[1]);
    const zona =
      rayon.children.find((z) => normalizeSearch(z.name) === zonaQuery) ??
      rayon.children.find((z) => {
        const n = normalizeSearch(z.name);
        return zonaQuery.startsWith(n) || n.startsWith(zonaQuery);
      });
    if (zona) {
      labels.push(zona.name);
      zonaId = zona.id;
    }
  }

  return { cityId: city.id, rayonId, zonaId, labels };
}
