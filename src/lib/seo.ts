import { BUILDER, SITE, siteUrl } from "@/lib/site";

type MarketingSeoInput = {
  locale: "az" | "ru";
  title: string;
  description: string;
};

/** Organization + WebSite graph with founder → portfolio Person. */
export function marketingJsonLd(input: MarketingSeoInput) {
  const origin = siteUrl();
  const pageUrl = `${origin}/?lang=${input.locale}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
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
    ],
  };
}

export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
