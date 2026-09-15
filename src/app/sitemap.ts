import type { MetadataRoute } from "next";
import { listPublishedPropertySitemapEntries } from "@/lib/properties";
import {
  hreflangLanguages,
  marketingUrl,
  propertyUrl,
} from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import type { LocaleCode } from "@/types/database";

const LOCALES: LocaleCode[] = ["az", "ru"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteUrl();
  const properties = await listPublishedPropertySitemapEntries();
  const marketingLastMod =
    properties[0]?.updated_at != null
      ? new Date(properties[0].updated_at)
      : undefined;

  const marketingEntries: MetadataRoute.Sitemap = LOCALES.map((locale) => ({
    url: marketingUrl(locale, origin),
    ...(marketingLastMod ? { lastModified: marketingLastMod } : {}),
    alternates: {
      languages: hreflangLanguages(
        marketingUrl("az", origin),
        marketingUrl("ru", origin),
      ),
    },
  }));

  const propertyEntries: MetadataRoute.Sitemap = properties.flatMap(
    (property) => {
      const lastModified = new Date(property.updated_at);
      return LOCALES.map((locale) => ({
        url: propertyUrl(property.slug, locale),
        lastModified,
        alternates: {
          languages: hreflangLanguages(
            propertyUrl(property.slug, "az"),
            propertyUrl(property.slug, "ru"),
          ),
        },
      }));
    },
  );

  // No changeFrequency / priority — major engines ignore them.
  return [...marketingEntries, ...propertyEntries];
}
