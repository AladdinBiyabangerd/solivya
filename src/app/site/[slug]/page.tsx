import { PropertySite } from "@/components/site/PropertySite";
import { resolveLocale } from "@/components/site/i18n";
import {
  getPublishedPropertyRecord,
  listPublishedSiblings,
  toSitePropertyView,
} from "@/lib/properties";
import { jsonLdScript, pageMetadata, propertyJsonLd, propertyUrl } from "@/lib/seo";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

function siblingHref(
  slug: string,
  locale: string,
  isLocal: boolean,
  root: string,
): string {
  return isLocal
    ? `http://${slug}.localhost:3000/?lang=${locale}`
    : `https://${slug}.${root}/?lang=${locale}`;
}

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

  const siblingRows = await listPublishedSiblings(
    record.property.owner_id,
    slug,
    locale,
  );

  const host = (await headers()).get("host") ?? "localhost:3000";
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "solivya.homes";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");

  const siblings = siblingRows.map((item) => ({
    slug: item.slug,
    title: item.title,
    zone: item.zone,
    rooms: item.rooms,
    guests: item.guests,
    priceNight: item.priceNight,
    coverSrc: item.coverSrc,
    coverAlt: item.coverAlt,
    href: siblingHref(item.slug, locale, isLocal, root),
  }));

  const ownerListingsHref = isLocal
    ? `http://localhost:3000/browse?owner=${record.property.owner_id}&lang=${locale}`
    : `https://${root}/browse?owner=${record.property.owner_id}&lang=${locale}`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <PropertySite
        property={property}
        siblings={siblings}
        ownerListingsHref={ownerListingsHref}
      />
    </>
  );
}
