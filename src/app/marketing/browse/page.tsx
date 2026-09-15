import type { Metadata } from "next";
import { headers } from "next/headers";
import { SolivyaLogo } from "@/components/brand/SolivyaLogo";
import { resolveLocale, SITE_UI } from "@/components/site/i18n";
import {
  listPublishedByOwner,
  listPublishedListings,
} from "@/lib/properties";
import {
  browseUrl,
  jsonLdScript,
  pageMetadata,
} from "@/lib/seo";
import { BUILDER, builderPortfolioUrl } from "@/lib/site";
import { MARKETING } from "../copy";
import { BROWSE } from "./copy";
import marketing from "../marketing.module.css";
import styles from "./browse.module.css";

type Props = {
  searchParams: Promise<{ lang?: string; owner?: string }>;
};

function listingHref(
  slug: string,
  locale: string,
  isLocal: boolean,
  root: string,
): string {
  return isLocal
    ? `http://${slug}.localhost:3000/?lang=${locale}`
    : `https://${slug}.${root}/?lang=${locale}`;
}

function isOwnerId(value: string | undefined): value is string {
  return Boolean(
    value &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value,
      ),
  );
}

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { lang, owner } = await searchParams;
  const locale = resolveLocale(lang, "az");
  const t = BROWSE[locale];
  const ownerMode = isOwnerId(owner);
  return pageMetadata({
    locale,
    canonical: browseUrl(locale),
    title: ownerMode ? t.ownerTitle : t.metaTitle,
    description: ownerMode ? t.ownerLead : t.metaDescription,
    absoluteTitle: !ownerMode,
  });
}

export default async function BrowsePage({ searchParams }: Props) {
  const { lang, owner } = await searchParams;
  const locale = resolveLocale(lang, "az");
  const t = BROWSE[locale];
  const m = MARKETING[locale];
  const ui = SITE_UI[locale];
  const ownerMode = isOwnerId(owner);
  const listings = ownerMode
    ? await listPublishedByOwner(owner, locale)
    : await listPublishedListings(locale);

  const host = (await headers()).get("host") ?? "localhost:3000";
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "solivya.homes";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");

  const demoUrl = isLocal
    ? `http://demo.localhost:3000/?lang=${locale}`
    : `https://demo.${root}/?lang=${locale}`;
  const loginUrl = isLocal
    ? "http://app.localhost:3000/login"
    : `https://app.${root}/login`;
  const homeHref = `/?lang=${locale}`;
  const allBrowseHref = `/browse?lang=${locale}`;
  const langAzHref = ownerMode
    ? `/browse?owner=${owner}&lang=az`
    : "/browse?lang=az";
  const langRuHref = ownerMode
    ? `/browse?owner=${owner}&lang=ru`
    : "/browse?lang=ru";

  const pageTitle = ownerMode ? t.ownerTitle : t.title;
  const pageLead = ownerMode ? t.ownerLead : t.lead;
  const emptyTitle = ownerMode ? t.ownerEmptyTitle : t.emptyTitle;
  const emptyText = ownerMode ? t.ownerEmptyText : t.emptyText;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageLead,
    url: browseUrl(locale),
    inLanguage: locale === "ru" ? "ru" : "az",
    isPartOf: {
      "@type": "WebSite",
      name: "Solivya",
      url: `${browseUrl(locale).replace(/\/browse.*/, "")}/`,
    },
  };

  return (
    <div className={`${marketing.page} ${styles.page}`} lang={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      <header className={styles.top}>
        <div className={`${marketing.wrap} ${marketing.topInner}`}>
          <SolivyaLogo size="sm" className={marketing.navBrand} href={homeHref} />
          <div className={marketing.navRight}>
            <nav className={marketing.navLinks} aria-label={t.navAria}>
              <a className={marketing.navLink} href={homeHref}>
                {t.backHome}
              </a>
              {ownerMode ? (
                <a className={marketing.navLink} href={allBrowseHref}>
                  {t.title}
                </a>
              ) : null}
            </nav>
            <div className={marketing.langSwitch} aria-label={t.langAria}>
              <a
                className={
                  locale === "az" ? marketing.langActive : marketing.langLink
                }
                href={langAzHref}
                hrefLang="az"
              >
                AZ
              </a>
              <span className={marketing.langSep} aria-hidden="true">
                /
              </span>
              <a
                className={
                  locale === "ru" ? marketing.langActive : marketing.langLink
                }
                href={langRuHref}
                hrefLang="ru"
              >
                RU
              </a>
            </div>
            <a className={marketing.navLogin} href={loginUrl}>
              {m.navLogin}
            </a>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={marketing.wrap}>
          <header className={styles.intro}>
            <p className={marketing.sectionLabel}>{t.label}</p>
            <h1 className={styles.title}>{pageTitle}</h1>
            <p className={styles.lead}>{pageLead}</p>
            {listings.length > 0 ? (
              <p className={styles.count}>{t.countLabel(listings.length)}</p>
            ) : null}
          </header>

          {listings.length === 0 ? (
            <div className={styles.empty}>
              <h2 className={styles.emptyTitle}>{emptyTitle}</h2>
              <p className={styles.emptyText}>{emptyText}</p>
              <div className={styles.emptyActions}>
                {ownerMode ? (
                  <a className={marketing.btnGhost} href={allBrowseHref}>
                    {t.title}
                  </a>
                ) : null}
                <a className={marketing.btn} href={demoUrl}>
                  {t.emptyDemo}
                </a>
              </div>
            </div>
          ) : (
            <ul className={styles.grid}>
              {listings.map((listing, index) => {
                const href = listingHref(
                  listing.slug,
                  locale,
                  isLocal,
                  root,
                );
                return (
                  <li key={listing.slug}>
                    <a
                      className={styles.card}
                      href={href}
                      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
                    >
                      <div className={styles.media}>
                        {listing.coverSrc ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={listing.coverSrc}
                            alt={listing.coverAlt}
                            loading={index < 4 ? "eager" : "lazy"}
                          />
                        ) : (
                          <div
                            className={styles.mediaFallback}
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className={styles.body}>
                        <p className={styles.brand}>{listing.brandName}</p>
                        <h2 className={styles.listingTitle}>{listing.title}</h2>
                        <p className={styles.meta}>
                          {listing.zone
                            ? `${listing.zone} · ${ui.roomsGuests(listing.rooms, listing.guests)}`
                            : ui.roomsGuests(listing.rooms, listing.guests)}
                        </p>
                        <div className={styles.footer}>
                          <span className={styles.price}>
                            {t.priceNight(listing.priceNight)}
                          </span>
                          <span className={styles.open}>{t.openListing}</span>
                        </div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>

      <footer className={marketing.footer}>
        <div className={`${marketing.wrap} ${marketing.footerInner}`}>
          <div className={marketing.footerMeta}>
            <p className={marketing.footerBrand}>
              <SolivyaLogo size="sm" href={homeHref} />
            </p>
            <p className={marketing.footerNote}>{t.footerNote}</p>
          </div>
          <p className={marketing.footerCredit}>
            <a
              href={builderPortfolioUrl(locale)}
              target="_blank"
              rel="noopener noreferrer"
            >
              {BUILDER.name}
              <span aria-hidden="true"> ↗</span>
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
