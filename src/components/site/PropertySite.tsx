import type { CSSProperties } from "react";
import styles from "./site.module.css";
import { SiteAnalytics } from "./SiteAnalytics";
import { SiteGallery } from "./SiteGallery";
import {
  formatPriceAz,
  type SitePropertyView,
  whatsappHref,
} from "./types";

export type SiblingListing = {
  slug: string;
  title: string;
  zone: string;
  rooms: number;
  guests: number;
  priceNight: number;
  coverSrc: string | null;
  coverAlt: string;
  href: string;
};

type Props = {
  property: SitePropertyView;
  siblings?: SiblingListing[];
  /** Public catalog of this owner's listings (cross-subdomain). */
  ownerListingsHref?: string;
  /** Owner-only preview route — banner + relative lang links. */
  preview?: boolean;
  draft?: boolean;
};

export function PropertySite({
  property,
  siblings = [],
  ownerListingsHref,
  preview = false,
  draft = false,
}: Props) {
  const { ui, locale } = property;
  const wa = whatsappHref(property.whatsappE164, property.whatsappMessage);
  const stickyWa = whatsappHref(
    property.whatsappE164,
    property.stickyWhatsAppMessage,
  );
  const langAz = preview ? "?lang=az" : "/?lang=az";
  const langRu = preview ? "?lang=ru" : "/?lang=ru";
  const hasSiblings = siblings.length > 0;
  const otherApartmentsHref = hasSiblings
    ? "#diger-menziller"
    : ownerListingsHref;
  const showOtherApartments = Boolean(otherApartmentsHref);

  const hasCoords =
    typeof property.lat === "number" &&
    typeof property.lng === "number" &&
    Number.isFinite(property.lat) &&
    Number.isFinite(property.lng);

  const mapStyle = !hasCoords && property.mapImage
    ? ({
        "--map-image": `url("${property.mapImage}")`,
      } as CSSProperties)
    : undefined;

  const mapsEmbed =
    hasCoords
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${property.lng! - 0.012}%2C${property.lat! - 0.008}%2C${property.lng! + 0.012}%2C${property.lat! + 0.008}&layer=mapnik&marker=${property.lat}%2C${property.lng}`
      : null;
  const navigateHref = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`
    : null;
  const mapsHref = hasCoords
    ? `https://www.google.com/maps?q=${property.lat},${property.lng}`
    : null;

  return (
    <div style={{ paddingBottom: "5.5rem" }} lang={locale}>
      <SiteAnalytics slug={property.slug} enabled={!preview} />
      {preview ? (
        <div className={styles.previewBanner} role="status">
          <span>
            {draft
              ? "Draft önizləmə — hələ publish olunmayıb"
              : "Önizləmə — yalnız sən görürsən"}
          </span>
          <a className={styles.previewBack} href="/admin">
            Redaktəyə qayıt
          </a>
        </div>
      ) : null}

      <header className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={property.heroImage} alt="" />
        </div>
        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={styles.topbar}>
          <div className={`${styles.wrap} ${styles.topbarInner}`}>
            <div className={styles.brand}>{property.brandName}</div>
            <div className={styles.topActions}>
              <div className={styles.langSwitch} aria-label="Language">
                <a
                  className={
                    locale === "az" ? styles.langActive : styles.langLink
                  }
                  href={langAz}
                  hrefLang="az"
                >
                  {ui.langAz}
                </a>
                <span aria-hidden="true">/</span>
                <a
                  className={
                    locale === "ru" ? styles.langActive : styles.langLink
                  }
                  href={langRu}
                  hrefLang="ru"
                >
                  {ui.langRu}
                </a>
              </div>
              <a className={styles.topLink} href="#elaqe">
                {ui.contact}
              </a>
            </div>
          </div>
        </div>

        <div className={`${styles.wrap} ${styles.heroContent}`}>
          <p className={styles.heroKicker}>{property.kicker}</p>
          <h1 className={styles.heroTitle}>{property.title}</h1>
          <p className={styles.heroLead}>{property.lead}</p>

          <div className={styles.heroMeta}>
            <div className={styles.price}>
              {formatPriceAz(property.priceNight)}
              <span>{property.priceNote}</span>
            </div>
            <div className={styles.metaItem}>
              {ui.roomsGuests(property.rooms, property.guests)}
            </div>
            <div className={styles.metaItem}>
              {ui.minNights(property.minNights)}
            </div>
          </div>

          <div className={styles.heroActions}>
            <a
              className={styles.btn}
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp"
            >
              {ui.askWhatsApp}
            </a>
            <a className={styles.btnGhost} href="#qalereya">
              {ui.viewPhotos}
            </a>
            {showOtherApartments ? (
              <a className={styles.btnGhost} href={otherApartmentsHref}>
                {ui.otherApartments}
              </a>
            ) : null}
          </div>
        </div>
      </header>

      <section className={styles.gallery} id="qalereya">
        <div className={styles.wrap}>
          <SiteGallery
            photos={property.photos}
            brandName={property.brandName}
            closeLabel={ui.closeViewer}
            viewerLabel={ui.photoViewer}
            prevLabel={ui.prevPhoto}
            nextLabel={ui.nextPhoto}
          />
        </div>
      </section>

      <section className={`${styles.section} ${styles.amenities}`}>
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>{ui.amenitiesLabel}</p>
          <h2 className={styles.sectionTitle}>{ui.amenitiesTitle}</h2>
          <ul className={styles.amenityList}>
            {property.amenities.map((item) => (
              <li key={item.title}>
                <strong>{item.title}</strong>
                {item.subtitle ? <span>{item.subtitle}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.section} id="elaqe">
        <div className={`${styles.wrap} ${styles.split}`}>
          <div>
            <p className={styles.sectionLabel}>{ui.rulesLabel}</p>
            <h2 className={styles.sectionTitle}>{ui.rulesTitle}</h2>
            <ul className={styles.rules}>
              {property.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <div className={styles.contactActions}>
              <a
                className={styles.btn}
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                data-track="whatsapp"
              >
                {ui.writeWhatsApp}
              </a>
              {showOtherApartments ? (
                <a className={styles.btnGhost} href={otherApartmentsHref}>
                  {ui.otherApartments}
                </a>
              ) : null}
            </div>
          </div>

          <div className={styles.mapCard}>
            {mapsEmbed && navigateHref ? (
              <a
                className={styles.mapHit}
                href={navigateHref}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ui.navigateHere}
              >
                <iframe
                  className={styles.mapEmbed}
                  title={ui.mapAria}
                  src={mapsEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={-1}
                  aria-hidden
                />
                <span className={styles.mapHitLabel}>{ui.navigateHere}</span>
              </a>
            ) : (
              <div
                className={styles.mapVisual}
                role="img"
                aria-label={ui.mapAria}
                style={mapStyle}
              />
            )}
            <div className={styles.mapInfo}>
              <strong>{property.zone}</strong>
              <p>{property.zoneNote}</p>
              {navigateHref ? (
                <div className={styles.mapLinks}>
                  <a
                    className={styles.mapNavBtn}
                    href={navigateHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {ui.navigateHere}
                  </a>
                  {mapsHref ? (
                    <a
                      className={styles.mapOpenLink}
                      href={mapsHref}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ui.openMap}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {hasSiblings ? (
        <section className={styles.section} id="diger-menziller">
          <div className={styles.wrap}>
            <p className={styles.sectionLabel}>{ui.otherApartmentsLabel}</p>
            <h2 className={styles.sectionTitle}>{ui.otherApartmentsTitle}</h2>
            <ul className={styles.siblingList}>
              {siblings.map((item) => (
                <li key={item.slug}>
                  <a className={styles.siblingCard} href={item.href}>
                    <div className={styles.siblingMedia}>
                      {item.coverSrc ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.coverSrc}
                          alt={item.coverAlt}
                          loading="lazy"
                        />
                      ) : (
                        <div
                          className={styles.siblingMediaFallback}
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className={styles.siblingBody}>
                      <h3 className={styles.siblingTitle}>{item.title}</h3>
                      <p className={styles.siblingMeta}>
                        {item.zone
                          ? `${item.zone} · ${ui.roomsGuests(item.rooms, item.guests)}`
                          : ui.roomsGuests(item.rooms, item.guests)}
                      </p>
                      <div className={styles.siblingFooter}>
                        <span className={styles.siblingPrice}>
                          {formatPriceAz(item.priceNight)}
                          <span>
                            {locale === "ru" ? " / ночь" : " / gecə"}
                          </span>
                        </span>
                        <span className={styles.siblingOpen}>
                          {ui.openOtherApartment}
                        </span>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <div className={styles.stickyCta} aria-label={ui.contact}>
        <p>{ui.stickyText}</p>
        <a
          className={styles.btn}
          href={stickyWa}
          target="_blank"
          rel="noopener noreferrer"
          data-track="whatsapp"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
