import type { Metadata } from "next";
import type { LocaleCode } from "@/types/database";
import type { SitePropertyView } from "@/components/site/types";
import { BUILDER, SITE, siteUrl } from "@/lib/site";

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

/** Organization + WebSite graph with founder → portfolio Person. */
export function marketingJsonLd(
  input: MarketingSeoInput & { faqs?: { q: string; a: string }[] },
) {
  const origin = siteUrl();
  const pageUrl = marketingUrl(input.locale, origin);

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
        "@type": "City",
        name: input.locale === "ru" ? "Баку" : "Bakı",
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
      "@type": "WebPage",
      "@id": `${pageUrl}#webpage`,
      url: pageUrl,
      name: input.title,
      description: input.description,
      isPartOf: { "@id": `${origin}/#website` },
      about: { "@id": `${origin}/#organization` },
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

type PropertyJsonLdInput = {
  property: SitePropertyView;
  canonical: string;
};

/** LodgingBusiness + WebPage for a published tenant microsite. */
export function propertyJsonLd(input: PropertyJsonLdInput) {
  const { property, canonical } = input;
  const origin = siteUrl();
  const lodgingId = `${canonical}#lodging`;
  const city =
    property.locale === "ru" ? "Баку" : "Bakı";
  const imageRaw = property.photos[0]?.src || property.heroImage;
  const image = imageRaw.startsWith("http")
    ? imageRaw
    : `${origin}${imageRaw}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LodgingBusiness",
        "@id": lodgingId,
        name: property.brandName,
        description: property.lead,
        url: canonical,
        image,
        telephone: property.whatsappE164
          ? `+${property.whatsappE164.replace(/\D/g, "")}`
          : undefined,
        address: {
          "@type": "PostalAddress",
          addressLocality: property.zone || city,
          addressRegion: city,
          addressCountry: "AZ",
        },
        geo: undefined,
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
        description: property.lead,
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
