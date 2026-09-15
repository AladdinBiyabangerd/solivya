import type { Metadata } from "next";
import { headers } from "next/headers";
import styles from "./marketing.module.css";

export const metadata: Metadata = {
  title: "Solivya — Sahib brendli günlük kirayə səhifəsi",
  description:
    "Günlük kirayə mənzilin üçün öz brendli sayt. WhatsApp ilə sorğu, gözəl foto, aydın qiymət.",
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
            src="https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1800&q=80"
            alt=""
          />
        </div>
        <div className={styles.heroOverlay} aria-hidden="true" />

        <div className={styles.topbar}>
          <div className={`${styles.wrap} ${styles.topInner}`}>
            <div className={styles.navBrand}>Solivya</div>
            <a className={styles.navLink} href={demoUrl}>
              Demo
            </a>
          </div>
        </div>

        <div className={`${styles.wrap} ${styles.heroContent}`}>
          <p className={styles.brandMark}>Solivya</p>
          <h1 className={styles.headline}>
            Günlük kirayə üçün öz brendli səhifən
          </h1>
          <p className={styles.lead}>
            Qonaq fotoları, qiyməti və qaydaları bir linkdə görür — sonra
            birbaşa WhatsApp-a yazır.
          </p>
          <div className={styles.actions}>
            <a className={styles.btn} href={wa} target="_blank" rel="noopener noreferrer">
              WhatsApp ilə sifariş
            </a>
            <a className={styles.btnGhost} href={demoUrl}>
              Canlı demo
            </a>
          </div>
        </div>
      </header>

      <section className={styles.pricing} id="qiymet">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Qiymət</p>
          <h2 className={styles.sectionTitle}>Sadə və aydın</h2>
          <p className={styles.sectionText}>
            Qurulum bir dəfə, sonra aylıq baxım. Marketplace komissiyası yoxdur —
            səhifə sənin brendindir.
          </p>
          <div className={styles.priceRow}>
            <div className={styles.priceBlock}>
              100 ₼
              <span>qurulum</span>
            </div>
            <div className={styles.priceBlock}>
              20 ₼
              <span>aylıq</span>
            </div>
          </div>
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
              WhatsApp
            </a>
          </div>
          <p className={styles.footerNote} style={{ marginTop: "1.75rem" }}>
            Demo: {demoUrl.replace(/^https?:\/\//, "")}
          </p>
        </div>
      </section>
    </div>
  );
}
