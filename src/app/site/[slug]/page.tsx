import { PropertySite } from "@/components/site/PropertySite";
import { DEMO_PROPERTY } from "@/components/site/demo-property";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (slug !== "demo") {
    return { title: "Solivya" };
  }
  return {
    title: `${DEMO_PROPERTY.title} · ${DEMO_PROPERTY.brandName}`,
    description: DEMO_PROPERTY.lead,
  };
}

export default async function SiteHome({ params }: Props) {
  const { slug } = await params;

  // Addım 7-də DB-dən gələcək; indi yalnız demo UI.
  if (slug !== "demo") {
    notFound();
  }

  return <PropertySite property={{ ...DEMO_PROPERTY, slug }} />;
}
