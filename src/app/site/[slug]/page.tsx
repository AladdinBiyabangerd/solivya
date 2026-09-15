import { PropertySite } from "@/components/site/PropertySite";
import { resolveLocale } from "@/components/site/i18n";
import {
  getPublishedPropertyRecord,
  toSitePropertyView,
} from "@/lib/properties";
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
    return { title: "Solivya" };
  }

  const locale = resolveLocale(lang, record.property.locale_default);
  const localized = toSitePropertyView(
    record.property,
    record.photos,
    locale,
  );

  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "solivya.homes";
  const canonical = `https://${slug}.${root}/?lang=${locale}`;

  return {
    title: `${localized.title} · ${localized.brandName}`,
    description: localized.lead,
    alternates: {
      canonical,
      languages: {
        az: `https://${slug}.${root}/?lang=az`,
        ru: `https://${slug}.${root}/?lang=ru`,
      },
    },
    openGraph: {
      title: `${localized.title} · ${localized.brandName}`,
      description: localized.lead,
      locale: locale === "ru" ? "ru_RU" : "az_AZ",
      type: "website",
      images: [
        {
          url: localized.heroImage,
          width: 1200,
          height: 630,
          alt: localized.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${localized.title} · ${localized.brandName}`,
      description: localized.lead,
      images: [localized.heroImage],
    },
  };
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

  return <PropertySite property={property} />;
}
