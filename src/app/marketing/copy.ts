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
  monthlyLabel: string;
  monthlyHint: string;
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
    metaTitle: "Sahib brendli günlük kirayə səhifəsi",
    metaDescription:
      "Günlük kirayə mənzilin üçün öz brendli sayt. WhatsApp ilə sorğu, gözəl foto, aydın qiymət — marketplace komissiyası olmadan.",
    navAria: "Əsas",
    navHow: "Necə",
    navBrowse: "Mənzillər",
    navDemo: "Demo",
    navPrice: "Qiymət",
    navLogin: "Giriş",
    navPanel: "Panelim",
    langAria: "Dil",
    headline: "Günlük kirayə üçün öz brendli səhifən",
    lead: "Qonaq fotoları, qiyməti və qaydaları bir linkdə görür — sonra birbaşa sənin WhatsApp-ına yazır.",
    ctaWhatsApp: "WhatsApp ilə sifariş",
    ctaDemo: "Canlı demo",
    ctaBrowse: "Mənzillərə bax",
    waMessage:
      "Salam, Solivya ilə günlük kirayə səhifəsi yaratmaq istəyirəm",
    guestLabel: "Axtarırsan?",
    guestTitle: "Mənzil axtarırsan",
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
        text: "Bio, elan, status. Qonaq oxuyur — sənə yazır. Aylıq 20 ₼.",
      },
    ],
    priceLabel: "Qiymət",
    priceTitle: "Sadə və aydın",
    priceLead:
      "Komissiya yoxdur. Qurulum bir dəfə, sonra aylıq baxım. Bron WhatsApp-ladır — qəsdən.",
    setupLabel: "Qurulum",
    setupHint: "dizayn, subdomain, ilk məzmun",
    monthlyLabel: "Aylıq",
    monthlyHint: "hosting, SSL, admin",
    signupCta: "Hesab yarat",
    waShort: "WhatsApp",
    faqLabel: "Suallar",
    faqTitle: "Tez-tez",
    faqs: [
      {
        q: "Airbnb / bina.az əvəzi?",
        a: "Xeyr — sənin öz səhifən; marketplace deyil, vitrindir.",
      },
      {
        q: "Saytdan ödəniş?",
        a: "İndilik yox. WhatsApp / nağd / köçürmə.",
      },
      {
        q: "Özüm dəyişə bilərəm?",
        a: "Bəli — foto, qiymət, qaydalar admin paneldən.",
      },
      {
        q: "Neçə mənzil?",
        a: "Başlanğıcda bir səhifə; əlavə ayrıca razılaşdırılır.",
      },
      {
        q: "Nə qədər vaxt?",
        a: "Foto/mətn hazırdırsa adətən 1–3 gün.",
      },
    ],
    closeLabel: "Başla",
    closeTitle: "Linkini bu həftə paylaş",
    closeText: "Demo-ya bax, WhatsApp-la yaz və ya hesab yarat.",
    footerNote: "Sahib brendli günlük kirayə səhifələri · Bakı",
    footerCredit: "Dizayn edib hazırlayan",
  },
  ru: {
    metaTitle: "Брендовая страница для посуточной аренды",
    metaDescription:
      "Своя брендовая страница для вашей квартиры посуточно. Фото, цена, правила и WhatsApp — без комиссии маркетплейса.",
    navAria: "Основное",
    navHow: "Как",
    navBrowse: "Квартиры",
    navDemo: "Демо",
    navPrice: "Цена",
    navLogin: "Вход",
    navPanel: "Моя панель",
    langAria: "Язык",
    headline: "Своя брендовая страница для посуточной аренды",
    lead: "Гость видит фото, цену и правила в одной ссылке — и пишет вам прямо в WhatsApp.",
    ctaWhatsApp: "Заказать в WhatsApp",
    ctaDemo: "Живое демо",
    ctaBrowse: "Смотреть квартиры",
    waMessage:
      "Здравствуйте, хочу создать страницу для посуточной аренды через Solivya",
    guestLabel: "Ищете жильё?",
    guestTitle: "Нужна квартира",
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
        text: "Био, объявление, статус. Гость читает — пишет вам. 20 ₼ в месяц.",
      },
    ],
    priceLabel: "Цена",
    priceTitle: "Просто и понятно",
    priceLead:
      "Без комиссии. Разовая настройка, потом ежемесячная поддержка. Бронь через WhatsApp — намеренно.",
    setupLabel: "Настройка",
    setupHint: "дизайн, subdomain, первый контент",
    monthlyLabel: "В месяц",
    monthlyHint: "хостинг, SSL, админка",
    signupCta: "Создать аккаунт",
    waShort: "WhatsApp",
    faqLabel: "Вопросы",
    faqTitle: "Частые",
    faqs: [
      {
        q: "Это вместо Airbnb / bina.az?",
        a: "Нет — это ваша витрина, не маркетплейс.",
      },
      {
        q: "Оплата на сайте?",
        a: "Пока нет. WhatsApp / наличные / перевод.",
      },
      {
        q: "Сам могу менять?",
        a: "Да — фото, цену и правила в админке.",
      },
      {
        q: "Сколько квартир?",
        a: "Сначала одна страница; дополнительные — отдельно.",
      },
      {
        q: "Сколько ждать?",
        a: "Если фото и текст готовы — обычно 1–3 дня.",
      },
    ],
    closeLabel: "Начать",
    closeTitle: "Поделитесь ссылкой на этой неделе",
    closeText: "Смотрите демо, пишите в WhatsApp или создайте аккаунт.",
    footerNote: "Брендовые страницы для посуточной аренды · Баку",
    footerCredit: "Дизайн и разработка —",
  },
};
