import type { LocaleCode } from "@/types/database";

export type MarketingCopy = {
  metaTitle: string;
  metaDescription: string;
  navAria: string;
  navHow: string;
  navBrowse: string;
  navDemo: string;
  navPrice: string;
  navLogin: string;
  navPanel: string;
  langAria: string;
  headline: string;
  lead: string;
  ctaWhatsApp: string;
  ctaDemo: string;
  ctaBrowse: string;
  waMessage: string;
  guestLabel: string;
  guestTitle: string;
  guestText: string;
  guestCta: string;
  problemLabel: string;
  problemTitle: string;
  problemText: string;
  audienceLabel: string;
  audienceTitle: string;
  audienceItems: [string, string, string, string];
  proofLabel: string;
  proofTitle: string;
  proofText: string;
  proofCta: string;
  includesLabel: string;
  includesTitle: string;
  includesLead: string;
  includes: { title: string; text: string; accent?: string }[];
  processLabel: string;
  processTitle: string;
  steps: { title: string; text: string }[];
  priceLabel: string;
  priceTitle: string;
  priceLead: string;
  setupLabel: string;
  setupHint: string;
  setupPrice: string;
  monthlyLabel: string;
  monthlyHint: string;
  monthlyPrice: string;
  signupCta: string;
  waShort: string;
  faqLabel: string;
  faqTitle: string;
  faqs: { q: string; a: string }[];
  closeLabel: string;
  closeTitle: string;
  closeText: string;
  footerNote: string;
  /** Prefix before builder name in the marketing footer. */
  footerCredit: string;
};

export const MARKETING: Record<LocaleCode, MarketingCopy> = {
  az: {
    // Template appends " — Solivya" (see root layout).
    metaTitle: "Günlük kirayə səhifəsi | Bakı",
    metaDescription:
      "Bakıda günlük kirayə mənzilin üçün öz brendli səhifə. Foto, qiymət, qaydalar bir linkdə — qonaq birbaşa WhatsApp-a yazır. İndilik pulsuz, komissiya yoxdur.",
    navAria: "Əsas",
    navHow: "Necə",
    navBrowse: "Mənzillər",
    navDemo: "Demo",
    navPrice: "Qiymət",
    navLogin: "Giriş",
    navPanel: "Panelim",
    langAria: "Dil",
    headline: "Günlük kirayə üçün öz brendli səhifən",
    lead: "Qonaq fotoları, qiyməti və qaydaları bir linkdə görür — sonra birbaşa sənin WhatsApp-ına yazır. İndilik pulsuz.",
    ctaWhatsApp: "WhatsApp ilə sifariş",
    ctaDemo: "Canlı demo",
    ctaBrowse: "Mənzillərə bax",
    waMessage:
      "Salam, Solivya ilə günlük kirayə səhifəsi yaratmaq istəyirəm",
    guestLabel: "Axtarırsan?",
    guestTitle: "Bakıda günlük kirayə axtarırsan",
    guestText:
      "Sahibdən link gözləmədən günlük kirayə mənzillərə bax — foto, qiymət, qaydalar bir səhifədə.",
    guestCta: "Mənzillərə bax",
    problemLabel: "Problem",
    problemTitle: "Elan var. Brend yoxdur.",
    problemText:
      "bina.az, Instagram, WhatsApp — eyni suallar hər gün: qiymət, wifi, depozit, boş tarix. Foto 20 dəfə göndərilir. Solivya bir səhifədə toplayır; linki bio-ya qoyursan, qonaq oxuyub yazır.",
    audienceLabel: "Kim üçündür",
    audienceTitle: "1–5 mənzilli sahib",
    audienceItems: [
      "Günlük kirayə verən mənzil sahibləri",
      "Airbnb / Booking + birbaşa qonaq istəyənlər",
      "Instagram / WhatsApp-la işləyən, saytı olmayanlar",
      "Özün idarə edən “sahibindən” elanlar",
    ],
    proofLabel: "Nümunə",
    proofTitle: "Belə görünür",
    proofText:
      "Full-bleed foto, aydın qiymət, təchizat və qaydalar. Sticky WhatsApp — AZ / RU. Qonaq telefonda dəqiqə içində yazır.",
    proofCta: "Demo səhifəni aç",
    includesLabel: "Nə daxildir",
    includesTitle: "Səhifəndə nə olur",
    includesLead:
      "Hazır şablon + sənin məzmunun. Texniki başağrısı sənə qalmır.",
    includes: [
      {
        title: "Öz subdomain",
        text: "məs. ",
        accent: "sahil.solivya.homes",
      },
      { title: "Foto qalereya", text: "yüklə, sıra dəyiş, sil" },
      { title: "Qiymət və qaydalar", text: "gecəlik, depozit, təchizat" },
      { title: "WhatsApp CTA", text: "bir toxunuşda yazışma" },
      { title: "AZ / RU", text: "qonaq dili dəyişir" },
      { title: "Sadə admin", text: "özün yenilə · publish" },
    ],
    processLabel: "Necə işləyir",
    processTitle: "3 addım",
    steps: [
      {
        title: "WhatsApp və ya qeydiyyat",
        text: "Mənzil adı, zona, qiymət və fotolar — yaz və ya paneldən.",
      },
      {
        title: "Səhifə hazırlanır",
        text: "Dizayn və qurulum bizdə. Subdomain açılır, publish edirsən.",
      },
      {
        title: "Linki paylaş",
        text: "Bio, elan, status. Qonaq oxuyur — sənə yazır. İndilik pulsuz.",
      },
    ],
    priceLabel: "Qiymət",
    priceTitle: "İndilik pulsuz",
    priceLead:
      "Komissiya yoxdur. Qurulum və aylıq baxım hələlik ödənişsiz — sonra tariflər açıqlanacaq. Bron WhatsApp-ladır — qəsdən.",
    setupLabel: "Qurulum",
    setupHint: "dizayn, subdomain, ilk məzmun",
    setupPrice: "Pulsuz",
    monthlyLabel: "Aylıq",
    monthlyHint: "hosting, SSL, admin",
    monthlyPrice: "Pulsuz",
    signupCta: "Hesab yarat",
    waShort: "WhatsApp",
    faqLabel: "Suallar",
    faqTitle: "Tez-tez",
    faqs: [
      {
        q: "Solivya nədir?",
        a: "Bakıda günlük kirayə sahibləri üçün brendli bir səhifədir: foto, qiymət və qaydalar bir linkdə, qonaq WhatsApp-a yazır.",
      },
      {
        q: "Airbnb / bina.az əvəzi?",
        a: "Xeyr — sənin öz səhifən; marketplace deyil, vitrindir. Elan platformalarını əvəz etmir, birbaşa qonağı gücləndirir.",
      },
      {
        q: "Saytdan ödəniş?",
        a: "İndilik yox. WhatsApp / nağd / köçürmə.",
      },
      {
        q: "Solivya özü nə qədərdir?",
        a: "İndilik pulsuz — qurulum və aylıq. Sonra tariflər dəyişə bilər.",
      },
      {
        q: "Özüm dəyişə bilərəm?",
        a: "Bəli — foto, qiymət, qaydalar admin paneldən. Əsas fotonu seçəndə paylaşım preview da onu göstərir.",
      },
      {
        q: "Neçə mənzil?",
        a: "Başlanğıcda bir səhifə; əlavə ayrıca razılaşdırılır.",
      },
      {
        q: "Nə qədər vaxt?",
        a: "Foto/mətn hazırdırsa adətən 15 dəqiqə.",
      },
    ],
    closeLabel: "Başla",
    closeTitle: "Linkini bu həftə paylaş",
    closeText: "Demo-ya bax, WhatsApp-la yaz və ya hesab yarat — indilik pulsuz.",
    footerNote: "Sahib brendli günlük kirayə səhifələri · Bakı",
    footerCredit: "Dizayn edib hazırlayan",
  },
  ru: {
    // Template appends " — Solivya" (see root layout).
    metaTitle: "Страница для посуточной аренды | Баку",
    metaDescription:
      "Своя брендовая страница для квартиры посуточно в Баку. Фото, цена, правила в одной ссылке — гость пишет в WhatsApp. Пока бесплатно, без комиссии.",
    navAria: "Основное",
    navHow: "Как",
    navBrowse: "Квартиры",
    navDemo: "Демо",
    navPrice: "Цена",
    navLogin: "Вход",
    navPanel: "Моя панель",
    langAria: "Язык",
    headline: "Своя брендовая страница для посуточной аренды",
    lead: "Гость видит фото, цену и правила в одной ссылке — и пишет вам прямо в WhatsApp. Пока бесплатно.",
    ctaWhatsApp: "Заказать в WhatsApp",
    ctaDemo: "Живое демо",
    ctaBrowse: "Смотреть квартиры",
    waMessage:
      "Здравствуйте, хочу создать страницу для посуточной аренды через Solivya",
    guestLabel: "Ищете жильё?",
    guestTitle: "Нужна квартира посуточно в Баку",
    guestText:
      "Смотрите квартиры посуточно без личной ссылки — фото, цена и правила на одной странице.",
    guestCta: "Смотреть квартиры",
    problemLabel: "Проблема",
    problemTitle: "Объявление есть. Бренда нет.",
    problemText:
      "bina.az, Instagram, WhatsApp — одни и те же вопросы каждый день: цена, wifi, депозит, свободные даты. Фото шлёте по двадцать раз. Solivya собирает всё на одной странице: ставите ссылку в био — гость читает и пишет.",
    audienceLabel: "Для кого",
    audienceTitle: "Владелец 1–5 квартир",
    audienceItems: [
      "Хозяева квартир под посуточную аренду",
      "Кто на Airbnb / Booking и хочет прямых гостей",
      "Кто ведёт Instagram / WhatsApp без своего сайта",
      "«От хозяина» — без агентства, сами управляете",
    ],
    proofLabel: "Пример",
    proofTitle: "Как это выглядит",
    proofText:
      "Крупное фото, понятная цена, удобства и правила. Sticky WhatsApp — AZ / RU. Гость пишет с телефона за минуту.",
    proofCta: "Открыть демо",
    includesLabel: "Что входит",
    includesTitle: "Что будет на странице",
    includesLead:
      "Готовый шаблон + ваш контент. Техническая головная боль — не ваша.",
    includes: [
      {
        title: "Свой subdomain",
        text: "напр. ",
        accent: "sahil.solivya.homes",
      },
      { title: "Фотогалерея", text: "загрузка, порядок, удаление" },
      { title: "Цена и правила", text: "за ночь, депозит, удобства" },
      { title: "WhatsApp CTA", text: "переписка в один тап" },
      { title: "AZ / RU", text: "гость меняет язык" },
      { title: "Простая админка", text: "сами правите · publish" },
    ],
    processLabel: "Как работает",
    processTitle: "3 шага",
    steps: [
      {
        title: "WhatsApp или регистрация",
        text: "Название, район, цена и фото — пишете нам или загружаете в панели.",
      },
      {
        title: "Страница готова",
        text: "Дизайн и настройка у нас. Subdomain открывается — публикуете.",
      },
      {
        title: "Делитесь ссылкой",
        text: "Био, объявление, статус. Гость читает — пишет вам. Пока бесплатно.",
      },
    ],
    priceLabel: "Цена",
    priceTitle: "Пока бесплатно",
    priceLead:
      "Без комиссии. Настройка и ежемесячная поддержка пока бесплатны — тарифы объявим позже. Бронь через WhatsApp — намеренно.",
    setupLabel: "Настройка",
    setupHint: "дизайн, subdomain, первый контент",
    setupPrice: "Бесплатно",
    monthlyLabel: "В месяц",
    monthlyHint: "хостинг, SSL, админка",
    monthlyPrice: "Бесплатно",
    signupCta: "Создать аккаунт",
    waShort: "WhatsApp",
    faqLabel: "Вопросы",
    faqTitle: "Частые",
    faqs: [
      {
        q: "Что такое Solivya?",
        a: "Брендовая страница для хозяев посуточной аренды в Баку: фото, цена и правила в одной ссылке, гость пишет в WhatsApp.",
      },
      {
        q: "Это вместо Airbnb / bina.az?",
        a: "Нет — это ваша витрина, не маркетплейс. Не заменяет площадки, усиливает прямых гостей.",
      },
      {
        q: "Оплата на сайте?",
        a: "Пока нет. WhatsApp / наличные / перевод.",
      },
      {
        q: "Сколько стоит Solivya?",
        a: "Пока бесплатно — настройка и месяц. Тарифы могут измениться позже.",
      },
      {
        q: "Сам могу менять?",
        a: "Да — фото, цену и правила в админке. Главное фото станет превью при шаринге ссылки.",
      },
      {
        q: "Сколько квартир?",
        a: "Сначала одна страница; дополнительные — отдельно.",
      },
      {
        q: "Сколько ждать?",
        a: "Если фото и текст готовы — обычно 15 минут.",
      },
    ],
    closeLabel: "Начать",
    closeTitle: "Поделитесь ссылкой на этой неделе",
    closeText: "Смотрите демо, пишите в WhatsApp или создайте аккаунт — пока бесплатно.",
    footerNote: "Брендовые страницы для посуточной аренды · Баку",
    footerCredit: "Дизайн и разработка —",
  },
};
