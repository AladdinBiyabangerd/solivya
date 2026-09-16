/** Product brand — marketing SEO and display. */
export const SITE = {
  name: "Solivya",
  /** Canonical production origin (no trailing slash). */
  url: "https://solivya.homes",
} as const;

/** Locale display name for country-wide coverage (SEO copy + JSON-LD). */
export function areaCountryName(locale: "az" | "ru"): string {
  return locale === "ru" ? "Азербайджан" : "Azərbaycan";
}

/** Shared brand assets in /public/brand. */
export const BRAND = {
  markSrc: "/brand/solivya-mark.svg",
  coverSrc: "/brand/solivya-cover.jpg",
  markAlt: "Solivya",
} as const;

/** Absolute URL for brand cover (Open Graph / JSON-LD). */
export function brandCoverAbsoluteUrl(origin = siteUrl()): string {
  return `${origin}${BRAND.coverSrc}`;
}

/** Builder credit in the site footer — portfolio hub for SEO and attribution. */
export const BUILDER = {
  name: "Aladdin Biyabangerd",
  portfolioOrigin: "https://aladdinbiyabangerd.site",
  /** Stable Person @id on the portfolio (JSON-LD merge target). */
  personId: "https://aladdinbiyabangerd.site/#aladdin-biyabangerd",
} as const;

/** Locale-matched portfolio URL with UTM for the Solivya footer credit. */
export function builderPortfolioUrl(locale: string): string {
  const pathLocale = locale === "ru" || locale === "az" ? locale : "az";
  const url = new URL(`/${pathLocale}`, BUILDER.portfolioOrigin);
  url.searchParams.set("utm_source", "solivya");
  url.searchParams.set("utm_medium", "organic_social");
  url.searchParams.set("utm_campaign", "portfolio");
  url.searchParams.set("utm_content", "footer_credit");
  return url.toString();
}

/** Absolute marketing home (landing), with optional lang. */
export function marketingHomeHref(
  options: { locale?: string; isLocal?: boolean } = {},
): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "solivya.homes";
  const isLocal = options.isLocal ?? false;
  const base = isLocal ? "http://localhost:3000" : `https://${root}`;
  if (options.locale === "az" || options.locale === "ru") {
    return `${base}/?lang=${options.locale}`;
  }
  return `${base}/`;
}

export function siteUrl(): string {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim();
  if (root && !root.includes("localhost")) {
    return `https://${root.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }
  return SITE.url;
}
