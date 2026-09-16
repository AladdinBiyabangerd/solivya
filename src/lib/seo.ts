import type { Metadata } from "next";
import type { LocaleCode, Photo } from "@/types/database";
import type { SitePropertyView } from "@/components/site/types";
import { mainPhotoShareUrl } from "@/lib/properties";
import { parseZonePath } from "@/lib/azerbaijan-locations";
import {
  areaCountryName,
  brandCoverAbsoluteUrl,
  BUILDER,
  SITE,
  siteUrl,
} from "@/lib/site";

const OG_LOCALE: Record<LocaleCode, string> = {
  az: "az_AZ",
  ru: "ru_RU",
};

export function marketingUrl(locale: LocaleCode, origin = siteUrl()): string {
  return `${origin}/?lang=${locale}`;
}

export function browseUrl(locale: LocaleCode, origin = siteUrl()): string {
  return `${origin}/browse?lang=${locale}`;
}

export function propertyUrl(
  slug: string,
  locale: LocaleCode,
  rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "solivya.homes",
): string {
  return `https://${slug}.${rootDomain}/?lang=${locale}`;
}

export function hreflangLanguages(
  azUrl: string,
  ruUrl: string,
  xDefault: "az" | "ru" = "az",
) {
  return {
    az: azUrl,
    ru: ruUrl,
    "x-default": xDefault === "ru" ? ruUrl : azUrl,
  };
}

type PageMetadataInput = {
  locale: LocaleCode;
  canonical: string;
  title: string;
  description: string;
  /** Absolute image URLs or path strings Next can resolve via metadataBase. */
  images?: NonNullable<Metadata["openGraph"]>["images"];
  siteName?: string;
  /** When true, skip the root `%s — Solivya` title template. */
  absoluteTitle?: boolean;
};

/** Shared Metadata for marketing + tenant pages (canonical, hreflang, OG, Twitter). */
export function pageMetadata(input: PageMetadataInput): Metadata {
  const {
    locale,
    canonical,
    title,
    description,
    images,
    siteName = SITE.name,
    absoluteTitle = false,
  } = input;

  const base = canonical.replace(/\?.*$/, "");
  const az = `${base}?lang=az`;
  const ru = `${base}?lang=ru`;

  const twitterImages = (() => {
    if (!images) return undefined;
    const list = Array.isArray(images) ? images : [images];
    const urls = list
      .map((img) => {
        if (typeof img === "string") return img;
        if (img && typeof img === "object" && "url" in img) {
          return String(img.url);
        }
        return "";
      })
      .filter(Boolean);
    return urls.length ? urls : undefined;
  })();

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: hreflangLanguages(az, ru),
    },
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      alternateLocale: locale === "az" ? ["ru_RU"] : ["az_AZ"],
      url: canonical,
      siteName,
      title,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(twitterImages ? { images: twitterImages } : {}),
    },
  };
}

type MarketingSeoInput = {
  locale: LocaleCode;
  title: string;
  description: string;
};

/** Organization + WebSite + free SoftwareApplication; optional FAQ. */
export function marketingJsonLd(
  input: MarketingSeoInput & { faqs?: { q: string; a: string }[] },
) {
  const origin = siteUrl();
  const pageUrl = marketingUrl(input.locale, origin);
  const country = areaCountryName(input.locale);
  const appName =
    input.locale === "ru"
      ? "Solivya — страница для посуточной аренды"
      : "Solivya — günlük kirayə səhifəsi";

  const graph: Record<string, unknown>[] = [
    {
      "@type": "Organization",
      "@id": `${origin}/#organization`,
      name: SITE.name,
      url: origin,
      description: input.description,
      founder: {
        "@type": "Person",
        "@id": BUILDER.personId,
        name: BUILDER.name,
        url: BUILDER.portfolioOrigin,
      },
      areaServed: {
        "@type": "Country",
        name: country,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${origin}/#website`,
      name: SITE.name,
      url: origin,
      description: input.description,
      inLanguage: input.locale,
      publisher: { "@id": `${origin}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      "@id": `${origin}/#app`,
      name: appName,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: pageUrl,
      description: input.description,
      inLanguage: input.locale,
      offers: {
        "@type": "Offer",
        price: 0,
        priceCurrency: "AZN",
        description:
          input.locale === "ru"
            ? "Пока бесплатно (настройка и месяц)"
            : "İndilik pulsuz (qurulum və aylıq)",
        availability: "https://schema.org/InStock",
      },
      provider: { "@id": `${origin}/#organization` },
      areaServed: {
        "@type": "Country",
        name: country,
      },
    },
    {
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: input.title,
      description: input.description,
      isPartOf: { "@id": `${origin}/#website` },
      about: { "@id": `${origin}/#app` },
      inLanguage: input.locale,
    },
  ];

  if (input.faqs?.length) {
    graph.push(faqJsonLd(input.faqs, pageUrl));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

type BrowseListingSeo = {
  slug: string;
  title: string;
  brandName: string;
  url: string;
};

/** CollectionPage + ItemList for /browse (guest catalog). */
export function browseJsonLd(input: {
  locale: LocaleCode;
  title: string;
  description: string;
  listings: BrowseListingSeo[];
}) {
  const origin = siteUrl();
  const pageUrl = browseUrl(input.locale, origin);

  const graph: Record<string, unknown>[] = [
    {
      "@type": "CollectionPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: input.title,
      description: input.description,
      inLanguage: input.locale,
      isPartOf: { "@id": `${origin}/#website` },
    },
  ];

  if (input.listings.length > 0) {
    graph.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#itemlist`,
      numberOfItems: input.listings.length,
      itemListElement: input.listings.map((listing, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${listing.title} · ${listing.brandName}`,
        url: listing.url,
      })),
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

/** SERP description when owner left lead empty. */
export function propertyMetaDescription(property: SitePropertyView): string {
  const lead = property.lead?.trim();
  if (lead) return lead;

  const zone = property.zone?.trim();
  const country = areaCountryName(property.locale);
  if (property.locale === "ru") {
    const where = zone ? ` · ${zone}` : ` · ${country}`;
    return `${property.title}${where} — квартира посуточно. Фото, цена и правила — напишите хозяину в WhatsApp.`;
  }
  const where = zone ? ` · ${zone}` : ` · ${country}`;
  return `${property.title}${where} — günlük kirayə. Foto, qiymət və qaydalar; WhatsApp ilə sahibə yazın.`;
}

function propertyPostalAddress(property: SitePropertyView) {
  const country = areaCountryName(property.locale);
  const parts = parseZonePath(property.zone || "");
  if (parts.length === 0) {
    return {
      "@type": "PostalAddress" as const,
      addressLocality: country,
      addressCountry: "AZ",
    };
  }
  return {
    "@type": "PostalAddress" as const,
    addressLocality: parts[parts.length - 1],
    addressRegion: parts.length > 1 ? parts[0] : country,
    addressCountry: "AZ",
  };
}

export function faqJsonLd(
  faqs: { q: string; a: string }[],
  pageUrl: string,
) {
  return {
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    url: pageUrl,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

/** Absolute OG/Twitter image for marketing pages (never a listing photo). */
export function marketingShareImages(alt: string): NonNullable<
  Metadata["openGraph"]
>["images"] {
  return [
    {
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt,
    },
  ];
}

/**
 * Absolute OG image for a property subdomain share.
 * Uses the owner-selected main photo (sort_order 0); brand cover only if none.
 */
export function propertyShareImages(
  photos: Photo[],
  alt: string,
): NonNullable<Metadata["openGraph"]>["images"] {
  const mainUrl = mainPhotoShareUrl(photos);
  const url = mainUrl ?? brandCoverAbsoluteUrl();
  return [
    {
      url,
      width: 1200,
      height: 630,
      alt,
    },
  ];
}

type PropertyJsonLdInput = {
  property: SitePropertyView;
  canonical: string;
};

/** LodgingBusiness + WebPage for a published tenant microsite. */
export function propertyJsonLd(input: PropertyJsonLdInput) {
  const { property, canonical } = input;
  const origin = siteUrl();
  const lodgingId = `${canonical}#lodging`;
  // Prefer owner main photo; brand cover is page chrome, not the listing image.
  const imageRaw = property.photos[0]?.src || brandCoverAbsoluteUrl(origin);
  const image = imageRaw.startsWith("http")
    ? imageRaw
    : `${origin}${imageRaw}`;
  const description = propertyMetaDescription(property);
  const hasGeo =
    typeof property.lat === "number" &&
    typeof property.lng === "number" &&
    Number.isFinite(property.lat) &&
    Number.isFinite(property.lng);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LodgingBusiness",
        "@id": lodgingId,
        name: property.brandName,
        description,
        url: canonical,
        image,
        telephone: property.whatsappE164
          ? `+${property.whatsappE164.replace(/\D/g, "")}`
          : undefined,
        address: propertyPostalAddress(property),
        ...(hasGeo
          ? {
              geo: {
                "@type": "GeoCoordinates",
                latitude: property.lat,
                longitude: property.lng,
              },
            }
          : {}),
        numberOfRooms: property.rooms,
        occupancy: {
          "@type": "QuantitativeValue",
          maxValue: property.guests,
        },
        priceRange: `${Math.round(property.priceNight)} AZN`,
        makesOffer: {
          "@type": "Offer",
          price: property.priceNight,
          priceCurrency: "AZN",
          availability: "https://schema.org/InStock",
          url: canonical,
        },
        parentOrganization: {
          "@type": "Organization",
          "@id": `${origin}/#organization`,
          name: SITE.name,
          url: origin,
        },
      },
      {
        "@type": "WebPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
        name: `${property.title} · ${property.brandName}`,
        description,
        inLanguage: property.locale,
        isPartOf: { "@id": `${origin}/#website` },
        about: { "@id": lodgingId },
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: image,
        },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonical}#breadcrumb`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: SITE.name,
            item: origin,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: property.brandName,
            item: canonical,
          },
        ],
      },
    ],
  };
}

export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
