import { PropertySite } from "@/components/site/PropertySite";
import { resolveLocale } from "@/components/site/i18n";
import {
  getPublishedPropertyRecord,
  toSitePropertyView,
} from "@/lib/properties";
import { jsonLdScript, pageMetadata, propertyJsonLd, propertyUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { slug } = await params;
  const { lang } = await searchParams;
  const record = await getPublishedPropertyRecord(slug);

  if (!record) {
    return { title: "Solivya", robots: { index: false, follow: false } };
  }

  const locale = resolveLocale(lang, record.property.locale_default);
  const localized = toSitePropertyView(
    record.property,
    record.photos,
    locale,
  );
  const canonical = propertyUrl(slug, locale);

  return pageMetadata({
    locale,
    canonical,
    title: `${localized.title} · ${localized.brandName}`,
    description: localized.lead,
    images: [
      {
        url: localized.heroImage,
        width: 1200,
        height: 630,
        alt: localized.title,
      },
    ],
  });
}

export default async function SiteHome({ params, searchParams }: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;

  const record = await getPublishedPropertyRecord(slug);
  if (!record) {
    notFound();
  }

  const locale = resolveLocale(lang, record.property.locale_default);
  const property = toSitePropertyView(
    record.property,
    record.photos,
    locale,
  );
  const canonical = propertyUrl(slug, locale);
  const jsonLd = propertyJsonLd({ property, canonical });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <PropertySite property={property} />
    </>
  );
}
