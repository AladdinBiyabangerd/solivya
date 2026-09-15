import type { LocaleCode } from "@/types/database";

export type BrowseCopy = {
  metaTitle: string;
  metaDescription: string;
  navAria: string;
  backHome: string;
  langAria: string;
  label: string;
  title: string;
  lead: string;
  emptyTitle: string;
  emptyText: string;
  emptyDemo: string;
  priceNight: (n: number) => string;
  openListing: string;
  countLabel: (n: number) => string;
  footerNote: string;
};

export const BROWSE: Record<LocaleCode, BrowseCopy> = {
  az: {
    metaTitle: "Günlük kirayə mənzillər — Solivya",
    metaDescription:
      "Solivya-da nəşr olunmuş günlük kirayə mənzillərə bax. Foto, qiymət və qaydalar — birbaşa sahibə WhatsApp.",
    navAria: "Əsas",
    backHome: "Ana səhifə",
    langAria: "Dil",
    label: "Mənzillər",
    title: "Nəşr olunmuş mənzillər",
    lead: "Link gözləmədən bax. Hər mənzilin öz səhifəsi var — foto, qiymət, qaydalar; sonra birbaşa sahibə yazırsan.",
    emptyTitle: "Hələ canlı mənzil yoxdur",
    emptyText: "Tezliklə yeni səhifələr əlavə olunacaq. İndilik nümunəyə baxa bilərsən.",
    emptyDemo: "Demo səhifəni aç",
    priceNight: (n) => `${n} ₼ / gecə`,
    openListing: "Səhifəni aç",
    countLabel: (n) => (n === 1 ? "1 mənzil" : `${n} mənzil`),
    footerNote: "Solivya · Bakı",
  },
  ru: {
    metaTitle: "Квартиры посуточно — Solivya",
    metaDescription:
      "Смотрите опубликованные квартиры посуточно на Solivya. Фото, цена и правила — затем WhatsApp хозяину.",
    navAria: "Основное",
    backHome: "На главную",
    langAria: "Язык",
    label: "Квартиры",
    title: "Опубликованные квартиры",
    lead: "Без личной ссылки. У каждой квартиры своя страница — фото, цена, правила; потом пишете хозяину напрямую.",
    emptyTitle: "Пока нет живых объявлений",
    emptyText: "Скоро появятся новые страницы. Пока можно открыть демо.",
    emptyDemo: "Открыть демо",
    priceNight: (n) => `${n} ₼ / ночь`,
    openListing: "Открыть",
    countLabel: (n) =>
      n === 1 ? "1 квартира" : n < 5 ? `${n} квартиры` : `${n} квартир`,
    footerNote: "Solivya · Баку",
  },
};
