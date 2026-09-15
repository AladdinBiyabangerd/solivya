import type { Metadata } from "next";
import { headers } from "next/headers";
import { resolveLocale } from "@/components/site/i18n";
import {
  jsonLdScript,
  marketingJsonLd,
  marketingUrl,
  pageMetadata,
} from "@/lib/seo";
import { BUILDER, builderPortfolioUrl } from "@/lib/site";
import { MARKETING } from "./copy";
import styles from "./marketing.module.css";

type Props = {
  searchParams: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang, "az");
  const t = MARKETING[locale];
  return pageMetadata({
    locale,
    canonical: marketingUrl(locale),
    title: t.metaTitle,
    description: t.metaDescription,
  });
}

function salesWhatsAppHref(message: string): string {
  const phone = (
    process.env.NEXT_PUBLIC_SALES_WHATSAPP || "994501234567"
  ).replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export default async function MarketingHome({ searchParams }: Props) {
  const { lang } = await searchParams;
  const locale = resolveLocale(lang, "az");
  const t = MARKETING[locale];

  const host = (await headers()).get("host") ?? "localhost:3000";
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "solivya.homes";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");

  const demoUrl = isLocal
    ? `http://demo.localhost:3000/?lang=${locale}`
    : `https://demo.${root}/?lang=${locale}`;
  const signupUrl = isLocal
    ? "http://app.localhost:3000/signup"
    : `https://app.${root}/signup`;
  const loginUrl = isLocal
    ? "http://app.localhost:3000/login"
    : `https://app.${root}/login`;
  const wa = salesWhatsAppHref(t.waMessage);
  const langAzHref = "/?lang=az";
  const langRuHref = "/?lang=ru";

  const jsonLd = marketingJsonLd({
    locale,
    title: t.metaTitle,
    description: t.metaDescription,
    faqs: t.faqs,
  });

  return (
    <div className={styles.page} lang={locale}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />
      <header className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=2000&q=80"
            alt=""
          />
        </div>
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={styles.heroGrain} aria-hidden="true" />

        <div className={styles.topbar}>
          <div className={`${styles.wrap} ${styles.topInner}`}>
            <a className={styles.navBrand} href={`/?lang=${locale}`}>
              Solivya
            </a>
            <div className={styles.navRight}>
              <nav className={styles.navLinks} aria-label={t.navAria}>
                <a className={styles.navLink} href="#necə">
                  {t.navHow}
                </a>
                <a className={styles.navLink} href={demoUrl}>
                  {t.navDemo}
                </a>
                <a className={styles.navLink} href="#qiymet">
                  {t.navPrice}
                </a>
              </nav>
              <div className={styles.langSwitch} aria-label={t.langAria}>
                <a
                  className={
                    locale === "az" ? styles.langActive : styles.langLink
                  }
                  href={langAzHref}
                  hrefLang="az"
                >
                  AZ
                </a>
                <span className={styles.langSep} aria-hidden="true">
                  /
                </span>
                <a
                  className={
                    locale === "ru" ? styles.langActive : styles.langLink
                  }
                  href={langRuHref}
                  hrefLang="ru"
                >
                  RU
                </a>
              </div>
              <a className={styles.navLogin} href={loginUrl}>
                {t.navLogin}
              </a>
            </div>
          </div>
        </div>

        <div className={`${styles.wrap} ${styles.heroContent}`}>
          <p className={`${styles.brandMark} ${styles.anim1}`}>Solivya</p>
          <h1 className={`${styles.headline} ${styles.anim2}`}>{t.headline}</h1>
          <p className={`${styles.lead} ${styles.anim3}`}>{t.lead}</p>
          <div className={`${styles.actions} ${styles.anim4}`}>
            <a
              className={styles.btn}
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.ctaWhatsApp}
            </a>
            <a className={styles.btnGhost} href={demoUrl}>
              {t.ctaDemo}
            </a>
          </div>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span />
        </div>
      </header>

      <section className={styles.splitBand} id="problem">
        <div className={`${styles.wrap} ${styles.split}`}>
          <div>
            <p className={styles.sectionLabel}>{t.problemLabel}</p>
            <h2 className={styles.sectionTitle}>{t.problemTitle}</h2>
            <p className={styles.sectionText}>{t.problemText}</p>
          </div>
          <div id="kim">
            <p className={styles.sectionLabel}>{t.audienceLabel}</p>
            <h2 className={styles.sectionTitle}>{t.audienceTitle}</h2>
            <ul className={styles.plainList}>
              {t.audienceItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className={styles.proof}>
        <div className={styles.proofMedia} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1600&q=80"
            alt=""
          />
        </div>
        <div className={styles.proofCopy}>
          <p className={styles.sectionLabel}>{t.proofLabel}</p>
          <h2 className={styles.sectionTitle}>{t.proofTitle}</h2>
          <p className={styles.sectionText}>{t.proofText}</p>
          <a className={styles.btn} href={demoUrl}>
            {t.proofCta}
          </a>
        </div>
      </section>

      <section className={styles.includes} id="daxil">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionLabel}>{t.includesLabel}</p>
              <h2 className={styles.sectionTitle}>{t.includesTitle}</h2>
            </div>
            <p className={styles.sectionText}>{t.includesLead}</p>
          </div>
          <ol className={styles.includeGrid}>
            {t.includes.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                <span>
                  {item.text}
                  {item.accent ? <em>{item.accent}</em> : null}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.process} id="necə">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionLabel}>{t.processLabel}</p>
              <h2 className={styles.sectionTitle}>{t.processTitle}</h2>
            </div>
          </div>
          <ol className={styles.steps}>
            {t.steps.map((step, i) => (
              <li key={step.title}>
                <span className={styles.stepNum}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className={styles.dealBand} id="qiymet">
        <div className={`${styles.wrap} ${styles.split}`}>
          <div>
            <p className={styles.sectionLabel}>{t.priceLabel}</p>
            <h2 className={styles.sectionTitle}>{t.priceTitle}</h2>
            <p className={styles.sectionText}>{t.priceLead}</p>
            <dl className={styles.priceList}>
              <div className={styles.priceItem}>
                <dt>
                  {t.setupLabel}
                  <span className={styles.priceHint}>{t.setupHint}</span>
                </dt>
                <dd>100 ₼</dd>
              </div>
              <div className={styles.priceItem}>
                <dt>
                  {t.monthlyLabel}
                  <span className={styles.priceHint}>{t.monthlyHint}</span>
                </dt>
                <dd>20 ₼</dd>
              </div>
            </dl>
            <div className={styles.actions}>
              <a className={styles.btn} href={signupUrl}>
                {t.signupCta}
              </a>
              <a
                className={styles.btnSecondary}
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.waShort}
              </a>
            </div>
          </div>
          <div id="sual">
            <p className={styles.sectionLabel}>{t.faqLabel}</p>
            <h2 className={styles.sectionTitle}>{t.faqTitle}</h2>
            <dl className={styles.faqList}>
              {t.faqs.map((item) => (
                <div className={styles.faqItem} key={item.q}>
                  <dt>{item.q}</dt>
                  <dd>{item.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={`${styles.wrap} ${styles.closingInner}`}>
          <div>
            <p className={styles.sectionLabel}>{t.closeLabel}</p>
            <h2 className={styles.sectionTitleWide}>{t.closeTitle}</h2>
            <p className={styles.sectionText}>{t.closeText}</p>
          </div>
          <div className={styles.actions}>
            <a
              className={styles.btn}
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t.ctaWhatsApp}
            </a>
            <a className={styles.btnSecondary} href={demoUrl}>
              {t.navDemo}
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerInner}`}>
          <div className={styles.footerMeta}>
            <p className={styles.footerBrand}>Solivya</p>
            <p className={styles.footerNote}>{t.footerNote}</p>
          </div>
          <p className={styles.footerCredit}>
            {t.footerCredit}{" "}
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
