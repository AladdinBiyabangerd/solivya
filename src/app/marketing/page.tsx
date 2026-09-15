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

      <section className={styles.problem} id="problem">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Problem</p>
          <h2 className={styles.sectionTitle}>Elan var. Brend yoxdur.</h2>
          <p className={styles.sectionTextWide}>
            bina.az, Instagram və WhatsApp-da eyni suallar hər gün təkrarlanır:
            qiymət nə qədərdir, wifi varmı, depozit, minimum gecə, boş tarix.
            Foto 20 dəfə göndərilir, qaydalar unudulur. Qonaq etibar etmir —
            sən isə vaxt itirirsən.
          </p>
          <p className={styles.sectionTextWide}>
            Solivya bir səhifədə hər şeyi toplayır. Linki bio-ya, elana və ya
            WhatsApp statusuna qoyursan — qonaq oxuyur, sonra yazır.
          </p>
        </div>
      </section>

      <section className={styles.audience} id="kim">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Kim üçündür</p>
          <h2 className={styles.sectionTitle}>1–5 mənzili olan sahib</h2>
          <p className={styles.sectionText}>
            Marketplace qururuq yox — sənin mənzilin üçün premium vitrin.
          </p>
          <ul className={styles.plainList}>
            <li>Günlük kirayə verən mənzil sahibləri (Bakı və digər şəhərlər)</li>
            <li>Airbnb / Booking-də olan, amma birbaşa qonaq da istəyənlər</li>
            <li>Instagram və WhatsApp-la işləyən, saytı olmayan sahiblər</li>
            <li>Agentlik yox — özün idarə edən “sahibindən” elanlar</li>
          </ul>
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
            WhatsApp — qonaq telefonda dəqiqə içində yazır. AZ və RU dil
            dəstəyi var.
          </p>
          <a className={styles.btn} href={demoUrl}>
            Demo səhifəni aç
          </a>
        </div>
      </section>

      <section className={styles.includes} id="daxil">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Nə daxildir</p>
          <h2 className={styles.sectionTitle}>Səhifəndə nə olur</h2>
          <p className={styles.sectionText}>
            Hazır şablon + sənin məzmunun. Texniki başağrısı sənə qalmır.
          </p>
          <ol className={styles.includeList}>
            <li>
              <strong>Öz subdomain</strong>
              <span>
                məsələn <em>sahil.solivya.homes</em> — bir link, sənin brendin
              </span>
            </li>
            <li>
              <strong>Foto qalereya</strong>
              <span>hero + qalereya; paneldən yüklə, sıra dəyiş, sil</span>
            </li>
            <li>
              <strong>Qiymət və qaydalar</strong>
              <span>gecəlik qiymət, depozit, min. gecə, təchizat siyahısı</span>
            </li>
            <li>
              <strong>WhatsApp CTA</strong>
              <span>hazır mesajla bir toxunuşda yazışma — ödəniş saytda yoxdur</span>
            </li>
            <li>
              <strong>AZ / RU</strong>
              <span>qonaq dili dəyişir; başlıq və təsvir sənin yazdığındır</span>
            </li>
            <li>
              <strong>Sadə admin</strong>
              <span>özün mətn və foto yeniləyirsən; publish / draft</span>
            </li>
          </ol>
        </div>
      </section>

      <section className={styles.process} id="necə">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Necə işləyir</p>
          <h2 className={styles.sectionTitle}>3 addım</h2>
          <ol className={styles.steps}>
            <li>
              <span className={styles.stepNum}>01</span>
              <div>
                <strong>WhatsApp və ya qeydiyyat</strong>
                <p>
                  Yazırsan və ya hesab yaradırsan. Mənzil adı, zona, qiymət və
                  fotoları göndərirsən (və ya özün paneldən yükləyirsən).
                </p>
              </div>
            </li>
            <li>
              <span className={styles.stepNum}>02</span>
              <div>
                <strong>Səhifə hazırlanır</strong>
                <p>
                  Dizayn və qurulum bizdə. Subdomain açılır, məzmun yerləşir,
                  publish edirsən.
                </p>
              </div>
            </li>
            <li>
              <span className={styles.stepNum}>03</span>
              <div>
                <strong>Linki paylaş</strong>
                <p>
                  Instagram bio, bina.az elanı, WhatsApp statusu. Qonaq oxuyur —
                  sənə yazır. Aylıq 20 ₼ ilə səhifə canlı qalır.
                </p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section className={styles.pricing} id="qiymet">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Qiymət</p>
          <h2 className={styles.sectionTitle}>Sadə və aydın</h2>
          <p className={styles.sectionText}>
            Marketplace komissiyası yoxdur. Səhifə sənin brendindir — qurulum
            bir dəfə, sonra aylıq baxım.
          </p>

          <dl className={styles.priceList}>
            <div className={styles.priceItem}>
              <dt>
                Qurulum
                <span className={styles.priceHint}>
                  dizayn, subdomain, ilk məzmun, publish
                </span>
              </dt>
              <dd>100 ₼</dd>
            </div>
            <div className={styles.priceItem}>
              <dt>
                Aylıq
                <span className={styles.priceHint}>
                  hosting, SSL, admin panel, kiçik düzəlişlər
                </span>
              </dt>
              <dd>20 ₼</dd>
            </div>
          </dl>

          <p className={styles.sectionText}>
            Online bron və ödəniş yoxdur — qəsdən. Qonaq WhatsApp-la yazır, sən
            tarixi və şərtləri özün razılaşırsan.
          </p>

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

      <section className={styles.faq} id="sual">
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Suallar</p>
          <h2 className={styles.sectionTitle}>Tez-tez soruşulan</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>Bu Airbnb və ya bina.az əvəzidir?</dt>
              <dd>
                Xeyr. Onlar marketplace-dir. Solivya sənin öz səhifəndir —
                elan saytlarından gələn sorğuları daha peşəkar qarşılamaq
                üçündür.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>Ödənişi saytdan ala bilərəm?</dt>
              <dd>
                İndilik yox. Bron və ödəniş WhatsApp / nağd / köçürmə ilə —
                yerli bazar belə işləyir. Sonra əlavə oluna bilər.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>Özüm foto və qiyməti dəyişə bilərəm?</dt>
              <dd>
                Bəli. Admin paneldən mətn, qiymət, qaydalar və fotoları
                yeniləyirsən; publish edəndə canlı səhifə dəyişir.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>Neçə mənzil əlavə edə bilərəm?</dt>
              <dd>
                Başlanğıcda bir mənzil / bir səhifə. Bir neçə mənzilin varsa,
                əlavə səhifə ayrıca razılaşdırılır.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>Nə qədər vaxta hazır olur?</dt>
              <dd>
                Foto və mətn hazırdırsa, adətən 1–3 gün. Tələsik lazımdırsa
                WhatsApp-la yaz.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.wrap}>
          <p className={styles.sectionLabel}>Başla</p>
          <h2 className={styles.sectionTitleWide}>
            Linkini bu həftə paylaş
          </h2>
          <p className={styles.sectionText}>
            Demo-ya bax, sonra WhatsApp-la yaz və ya hesab yarat. Birinci
            qonağa peşəkar təəssürat buraxmaq üçün kifayət edir.
          </p>
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
