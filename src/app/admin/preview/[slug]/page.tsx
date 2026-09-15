import { PropertySite } from "@/components/site/PropertySite";
import { resolveLocale } from "@/components/site/i18n";
import {
  getOwnerPropertyRecord,
  listPublishedSiblings,
  toSitePropertyView,
} from "@/lib/properties";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const record = await getOwnerPropertyRecord(slug);

  if (!record) {
    return { title: "Önizləmə · Solivya", robots: { index: false, follow: false } };
  }

  return {
    title: `Önizləmə · ${record.property.brand_name}`,
    robots: { index: false, follow: false },
  };
}

export default async function AdminPreviewPage({
  params,
  searchParams,
}: Props) {
  const { slug } = await params;
  const { lang } = await searchParams;

  const record = await getOwnerPropertyRecord(slug);
  if (!record) {
    notFound();
  }

  const locale = resolveLocale(lang, record.property.locale_default);
  const property = toSitePropertyView(
    record.property,
    record.photos,
    locale,
  );

  const siblingRows = await listPublishedSiblings(
    record.property.owner_id,
    slug,
    locale,
  );

  const siblings = siblingRows.map((item) => ({
    slug: item.slug,
    title: item.title,
    zone: item.zone,
    rooms: item.rooms,
    guests: item.guests,
    priceNight: item.priceNight,
    coverSrc: item.coverSrc,
    coverAlt: item.coverAlt,
    href: `/preview/${item.slug}?lang=${locale}`,
  }));

  return (
    <PropertySite
      property={property}
      siblings={siblings}
      ownerListingsHref={`/admin?lang=${locale}`}
      platformHomeHref="http://localhost:3000/"
      preview
      draft={!record.property.published}
    />
  );
}
