import { PropertySite } from "@/components/site/PropertySite";
import { getPublishedPropertyBySlug } from "@/lib/properties";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property) {
    return { title: "Solivya" };
  }

  return {
    title: `${property.title} · ${property.brandName}`,
    description: property.lead,
  };
}

export default async function SiteHome({ params }: Props) {
  const { slug } = await params;
  const property = await getPublishedPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return <PropertySite property={property} />;
}
