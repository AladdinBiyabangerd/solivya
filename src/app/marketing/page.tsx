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
              <a className={styles.navLink} href="#necə">
                Necə
              </a>
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

      <section className={styles.splitBand} id="problem">
        <div className={`${styles.wrap} ${styles.split}`}>
          <div>
            <p className={styles.sectionLabel}>Problem</p>
            <h2 className={styles.sectionTitle}>Elan var. Brend yoxdur.</h2>
            <p className={styles.sectionText}>
              bina.az, Instagram, WhatsApp — eyni suallar hər gün: qiymət,
              wifi, depozit, boş tarix. Foto 20 dəfə göndərilir. Solivya bir
              səhifədə toplayır; linki bio-ya qoyursan, qonaq oxuyub yazır.
            </p>
          </div>
          <div id="kim">
            <p className={styles.sectionLabel}>Kim üçündür</p>
            <h2 className={styles.sectionTitle}>1–5 mənzilli sahib</h2>
            <ul className={styles.plainList}>
              <li>Günlük kirayə verən mənzil sahibləri</li>
              <li>Airbnb / Booking + birbaşa qonaq istəyənlər</li>
              <li>Instagram / WhatsApp-la işləyən, saytı olmayanlar</li>
              <li>Özün idarə edən “sahibindən” elanlar</li>
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
          <p className={styles.sectionLabel}>Nümunə</p>
          <h2 className={styles.sectionTitle}>Belə görünür</h2>
          <p className={styles.sectionText}>
            Full-bleed foto, aydın qiymət, təchizat və qaydalar. Sticky
            WhatsApp — AZ / RU. Qonaq telefonda dəqiqə içində yazır.
          </p>
          <a className={styles.btn} href={demoUrl}>
            Demo səhifəni aç
          </a>
        </div>
      </section>

      <section className={styles.includes} id="daxil">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionLabel}>Nə daxildir</p>
              <h2 className={styles.sectionTitle}>Səhifəndə nə olur</h2>
            </div>
            <p className={styles.sectionText}>
              Hazır şablon + sənin məzmunun. Texniki başağrısı sənə qalmır.
            </p>
          </div>
          <ol className={styles.includeGrid}>
            <li>
              <strong>Öz subdomain</strong>
              <span>
                məs. <em>sahil.solivya.homes</em>
              </span>
            </li>
            <li>
              <strong>Foto qalereya</strong>
              <span>yüklə, sıra dəyiş, sil</span>
            </li>
            <li>
              <strong>Qiymət və qaydalar</strong>
              <span>gecəlik, depozit, təchizat</span>
            </li>
            <li>
              <strong>WhatsApp CTA</strong>
              <span>bir toxunuşda yazışma</span>
            </li>
            <li>
              <strong>AZ / RU</strong>
              <span>qonaq dili dəyişir</span>
            </li>
            <li>
              <strong>Sadə admin</strong>
              <span>özün yenilə · publish</span>
            </li>
          </ol>
        </div>
      </section>

      <section className={styles.process} id="necə">
        <div className={styles.wrap}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.sectionLabel}>Necə işləyir</p>
              <h2 className={styles.sectionTitle}>3 addım</h2>
            </div>
          </div>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNum}>01</span>
              <strong>WhatsApp və ya qeydiyyat</strong>
              <p>Mənzil adı, zona, qiymət və fotolar — yaz və ya paneldən.</p>
            </li>
            <li>
              <span className={styles.stepNum}>02</span>
              <strong>Səhifə hazırlanır</strong>
              <p>Dizayn və qurulum bizdə. Subdomain açılır, publish edirsən.</p>
            </li>
            <li>
              <span className={styles.stepNum}>03</span>
              <strong>Linki paylaş</strong>
              <p>Bio, elan, status. Qonaq oxuyur — sənə yazır. Aylıq 20 ₼.</p>
            </li>
          </ol>
        </div>
      </section>

      <section className={styles.dealBand} id="qiymet">
        <div className={`${styles.wrap} ${styles.split}`}>
          <div>
            <p className={styles.sectionLabel}>Qiymət</p>
            <h2 className={styles.sectionTitle}>Sadə və aydın</h2>
            <p className={styles.sectionText}>
              Komissiya yoxdur. Qurulum bir dəfə, sonra aylıq baxım. Bron
              WhatsApp-ladır — qəsdən.
            </p>
            <dl className={styles.priceList}>
              <div className={styles.priceItem}>
                <dt>
                  Qurulum
                  <span className={styles.priceHint}>
                    dizayn, subdomain, ilk məzmun
                  </span>
                </dt>
                <dd>100 ₼</dd>
              </div>
              <div className={styles.priceItem}>
                <dt>
                  Aylıq
                  <span className={styles.priceHint}>
                    hosting, SSL, admin
                  </span>
                </dt>
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
                WhatsApp
              </a>
            </div>
          </div>
          <div id="sual">
            <p className={styles.sectionLabel}>Suallar</p>
            <h2 className={styles.sectionTitle}>Tez-tez</h2>
            <dl className={styles.faqList}>
              <div className={styles.faqItem}>
                <dt>Airbnb / bina.az əvəzi?</dt>
                <dd>
                  Xeyr — sənin öz səhifən; marketplace deyil, vitrindir.
                </dd>
              </div>
              <div className={styles.faqItem}>
                <dt>Saytdan ödəniş?</dt>
                <dd>İndilik yox. WhatsApp / nağd / köçürmə.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>Özüm dəyişə bilərəm?</dt>
                <dd>Bəli — foto, qiymət, qaydalar admin paneldən.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>Neçə mənzil?</dt>
                <dd>Başlanğıcda bir səhifə; əlavə ayrıca razılaşdırılır.</dd>
              </div>
              <div className={styles.faqItem}>
                <dt>Nə qədər vaxt?</dt>
                <dd>Foto/mətn hazırdırsa adətən 1–3 gün.</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={`${styles.wrap} ${styles.closingInner}`}>
          <div>
            <p className={styles.sectionLabel}>Başla</p>
            <h2 className={styles.sectionTitleWide}>
              Linkini bu həftə paylaş
            </h2>
            <p className={styles.sectionText}>
              Demo-ya bax, WhatsApp-la yaz və ya hesab yarat.
            </p>
          </div>
          <div className={styles.actions}>
            <a
              className={styles.btn}
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp ilə sifariş
            </a>
            <a className={styles.btnSecondary} href={demoUrl}>
              Demo
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
