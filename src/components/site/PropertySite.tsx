import type { CSSProperties } from "react";
import styles from "./site.module.css";
import {
  formatPriceAz,
  type SitePropertyView,
  whatsappHref,
} from "./types";

type Props = {
  property: SitePropertyView;
};

export function PropertySite({ property }: Props) {
  const wa = whatsappHref(property.whatsappE164, property.whatsappMessage);
  const stickyWa = whatsappHref(
    property.whatsappE164,
    "Salam, tarix soruşmaq istəyirəm",
  );

  const mapStyle = property.mapImage
    ? ({
        "--map-image": `url("${property.mapImage}")`,
      } as CSSProperties)
    : undefined;

  return (
    <div style={{ paddingBottom: "5.5rem" }}>
      <header className={styles.hero}>
        <div className={styles.heroMedia} aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={property.heroImage} alt="" />
        </div>
        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={styles.topbar}>
          <div className={`${styles.wrap} ${styles.topbarInner}`}>
            <div className={styles.brand}>{property.brandName}</div>
            <a className={styles.topLink} href="#elaqe">
              Əlaqə
            </a>
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
              {property.rooms} otaq · {property.guests} qonaq
            </div>
            <div className={styles.metaItem}>
              Min. {property.minNights} gecə
            </div>
          </div>

          <div className={styles.heroActions}>
            <a className={styles.btn} href={wa} target="_blank" rel="noopener noreferrer">
              WhatsApp ilə soruş
            </a>
            <a className={styles.btnGhost} href="#qalereya">
              Fotolara bax
            </a>
          </div>
        </div>
      </header>

      <section className={styles.gallery} id="qalereya">
        <div className={styles.wrap}>
          <div className={styles.galleryGrid}>
            {property.photos.slice(0, 5).map((photo) => (
              <figure key={photo.src}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.src} alt={photo.alt} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.amenities}`}>
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Təchizat</p>
          <h2 className={styles.sectionTitle}>Rahat qalış üçün hər şey</h2>
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
            <p className={styles.sectionLabel}>Qaydalar</p>
            <h2 className={styles.sectionTitle}>Şəffaf və sadə</h2>
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
            >
              WhatsApp ilə yaz
            </a>
          </div>

          <div className={styles.mapCard}>
            <div
              className={styles.mapVisual}
              role="img"
              aria-label="Yerləşmə vizualı"
              style={mapStyle}
            />
            <div className={styles.mapInfo}>
              <strong>{property.zone}</strong>
              <p>{property.zoneNote}</p>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.stickyCta} aria-label="Sürətli əlaqə">
        <p>Boş tarix üçün yazın — adətən tez cavab</p>
        <a
          className={styles.btn}
          href={stickyWa}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}
