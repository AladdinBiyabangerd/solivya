import type { Metadata } from "next";
import { headers } from "next/headers";
import styles from "./marketing.module.css";

export const metadata: Metadata = {
  title: "Solivya — Sahib brendli günlük kirayə səhifəsi",
  description:
    "Günlük kirayə mənzilin üçün öz brendli sayt. WhatsApp ilə sorğu, gözəl foto, aydın qiymət — marketplace komissiyası olmadan.",
};

function salesWhatsAppHref(): string {
  const phone = (
    process.env.NEXT_PUBLIC_SALES_WHATSAPP || "994501234567"
  ).replace(/\D/g, "");
  const text =
    "Salam, Solivya ilə günlük kirayə səhifəsi yaratmaq istəyirəm";
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

export default async function MarketingHome() {
  const host = (await headers()).get("host") ?? "localhost:3000";
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "solivya.homes";
  const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");

  const demoUrl = isLocal
    ? "http://demo.localhost:3000"
    : `https://demo.${root}`;
  const signupUrl = isLocal
    ? "http://app.localhost:3000/signup"
    : `https://app.${root}/signup`;
  const wa = salesWhatsAppHref();

  return (
    <div className={styles.page}>
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
            <a className={styles.navBrand} href="/">
              Solivya
            </a>
            <nav className={styles.navLinks} aria-label="Əsas">
              <a className={styles.navLink} href={demoUrl}>
                Demo
              </a>
              <a className={styles.navLink} href="#qiymet">
                Qiymət
              </a>
            </nav>
          </div>
        </div>

        <div className={`${styles.wrap} ${styles.heroContent}`}>
          <p className={`${styles.brandMark} ${styles.anim1}`}>Solivya</p>
          <h1 className={`${styles.headline} ${styles.anim2}`}>
            Günlük kirayə üçün öz brendli səhifən
          </h1>
          <p className={`${styles.lead} ${styles.anim3}`}>
            Qonaq fotoları, qiyməti və qaydaları bir linkdə görür — sonra
            birbaşa sənin WhatsApp-ına yazır.
          </p>
          <div className={`${styles.actions} ${styles.anim4}`}>
            <a
              className={styles.btn}
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp ilə sifariş
            </a>
            <a className={styles.btnGhost} href={demoUrl}>
              Canlı demo
            </a>
          </div>
        </div>

        <div className={styles.scrollHint} aria-hidden="true">
          <span />
        </div>
      </header>

      <section className={styles.problem} id="nece">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Problem</p>
          <h2 className={styles.sectionTitle}>
            Elan var. Brend yoxdur.
          </h2>
          <p className={styles.sectionText}>
            bina.az və WhatsApp-da eyni suallar təkrarlanır: qiymət, wifi,
            depozit, boş tarix. Solivya bunları bir səhifədə toplayır —
            qonaq oxuyur, sən cavab verirən.
          </p>
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
          <p className={styles.sectionLabel}>Nümunə</p>
          <h2 className={styles.sectionTitle}>Belə görünür</h2>
          <p className={styles.sectionText}>
            Full-bleed foto, aydın qiymət, təchizat və qaydalar. Sticky
            WhatsApp — qonaq telefonunda dəqiqə içində yazır.
          </p>
          <a className={styles.btn} href={demoUrl}>
            Demo səhifəni aç
          </a>
        </div>
      </section>

      <section className={styles.pricing} id="qiymet">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Qiymət</p>
          <h2 className={styles.sectionTitle}>Sadə və aydın</h2>
          <p className={styles.sectionText}>
            Marketplace komissiyası yoxdur. Səhifə sənin brendindir —
            qurulum bir dəfə, sonra aylıq baxım.
          </p>

          <dl className={styles.priceList}>
            <div className={styles.priceItem}>
              <dt>Qurulum</dt>
              <dd>100 ₼</dd>
            </div>
            <div className={styles.priceItem}>
              <dt>Aylıq</dt>
              <dd>20 ₼</dd>
            </div>
          </dl>

          <div className={styles.actions}>
            <a className={styles.btn} href={signupUrl}>
              Hesab yarat
            </a>
            <a
              className={styles.btnSecondary}
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp-la danış
            </a>
          </div>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={`${styles.wrap} ${styles.footerInner}`}>
          <p className={styles.footerBrand}>Solivya</p>
          <p className={styles.footerNote}>
            Sahib brendli günlük kirayə səhifələri · Bakı
          </p>
        </div>
      </footer>
    </div>
  );
}
