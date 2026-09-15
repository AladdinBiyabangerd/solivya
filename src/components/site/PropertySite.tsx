import type { CSSProperties } from "react";
import styles from "./site.module.css";
import { SiteAnalytics } from "./SiteAnalytics";
import { SiteGallery } from "./SiteGallery";
import {
  formatPriceAz,
  type SitePropertyView,
  whatsappHref,
} from "./types";

type Props = {
  property: SitePropertyView;
  /** Owner-only preview route — banner + relative lang links. */
  preview?: boolean;
  draft?: boolean;
};

export function PropertySite({
  property,
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
            <a
              className={`${styles.btn} ${styles.contactBtn}`}
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              data-track="whatsapp"
            >
              {ui.writeWhatsApp}
            </a>
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
