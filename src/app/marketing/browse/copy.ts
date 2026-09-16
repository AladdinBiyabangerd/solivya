import type { LocaleCode } from "@/types/database";

export type BrowseCopy = {
  metaTitle: string;
  metaDescription: string;
  navAria: string;
  backHome: string;
  langAria: string;
  label: string;
  title: string;
  ownerTitle: string;
  lead: string;
  ownerLead: string;
  emptyTitle: string;
  emptyText: string;
  ownerEmptyTitle: string;
  ownerEmptyText: string;
  filterEmptyTitle: string;
  filterEmptyText: string;
  emptyDemo: string;
  priceNight: (n: number) => string;
  openListing: string;
  countLabel: (n: number) => string;
  footerNote: string;
  filtersAria: string;
  filtersToggle: string;
  filtersApply: string;
  filtersClear: string;
  filterAny: string;
  filterCity: string;
  filterRayon: string;
  filterNish: string;
  filterPriceMin: string;
  filterPriceMax: string;
  filterRooms: string;
  filterGuests: string;
  filterAmenities: string;
  filterAmenitySearch: string;
  filterAmenityEmpty: string;
  filterAmenityMore: string;
};

export const BROWSE: Record<LocaleCode, BrowseCopy> = {
  az: {
    // Template appends " — Solivya" (see root layout).
    metaTitle: "Günlük kirayə mənzillər | Azərbaycan",
    metaDescription:
      "Azərbaycan üzrə günlük kirayə mənzillər — Bakı, Gəncə, Sumqayıt və digər şəhər/rayonlar. Foto, qiymət və qaydalar bir səhifədə; birbaşa sahibə WhatsApp.",
    navAria: "Əsas",
    backHome: "Ana səhifə",
    langAria: "Dil",
    label: "Mənzillər",
    title: "Azərbaycanda günlük kirayə",
    ownerTitle: "Sahibin mənzilləri",
    lead: "Link gözləmədən bax. Hər mənzilin öz səhifəsi var — foto, qiymət, qaydalar; sonra birbaşa sahibə yazırsan.",
    ownerLead:
      "Eyni sahibin günlük kirayə mənzilləri — foto, qiymət və qaydalar birbaşa səhifədə.",
    emptyTitle: "Hələ canlı mənzil yoxdur",
    emptyText: "Tezliklə yeni səhifələr əlavə olunacaq. İndilik nümunəyə baxa bilərsən.",
    ownerEmptyTitle: "Bu sahibin başqa canlı mənzili yoxdur",
    ownerEmptyText: "İndilik digər mənzillərə baxa və ya demo səhifəni aça bilərsən.",
    filterEmptyTitle: "Bu filterə uyğun mənzil yoxdur",
    filterEmptyText:
      "Şərtləri yumşaldın və ya filterləri təmizləyib yenidən baxın.",
    emptyDemo: "Demo səhifəni aç",
    priceNight: (n) => `${n} ₼ / gecə`,
    openListing: "Səhifəni aç",
    countLabel: (n) => (n === 1 ? "1 mənzil" : `${n} mənzil`),
    footerNote: "Solivya · Azərbaycan",
    filtersAria: "Mənzil filterləri",
    filtersToggle: "Filter",
    filtersApply: "Göstər",
    filtersClear: "Təmizlə",
    filterAny: "Hamısı",
    filterCity: "Şəhər",
    filterRayon: "Rayon",
    filterNish: "Nişangah",
    filterPriceMin: "Min qiymət",
    filterPriceMax: "Max qiymət",
    filterRooms: "Min otaq",
    filterGuests: "Min qonaq",
    filterAmenities: "Təchizat",
    filterAmenitySearch: "Təchizat axtar…",
    filterAmenityEmpty: "Uyğun təchizat yoxdur",
    filterAmenityMore: "Daha {n} — axtarışla tap",
  },
  ru: {
    // Template appends " — Solivya" (see root layout).
    metaTitle: "Квартиры посуточно | Азербайджан",
    metaDescription:
      "Квартиры посуточно по Азербайджану — Баку, Гянджа, Сумгаит и другие города. Фото, цена и правила на одной странице; затем WhatsApp хозяину.",
    navAria: "Основное",
    backHome: "На главную",
    langAria: "Язык",
    label: "Квартиры",
    title: "Посуточно в Азербайджане",
    ownerTitle: "Квартиры хозяина",
    lead: "Без личной ссылки. У каждой квартиры своя страница — фото, цена, правила; потом пишете хозяину напрямую.",
    ownerLead:
      "Квартиры посуточно одного хозяина — фото, цена и правила на странице.",
    emptyTitle: "Пока нет живых объявлений",
    emptyText: "Скоро появятся новые страницы. Пока можно открыть демо.",
    ownerEmptyTitle: "У этого хозяина пока нет других объявлений",
    ownerEmptyText: "Можно посмотреть все квартиры или открыть демо.",
    filterEmptyTitle: "Нет квартир по этим фильтрам",
    filterEmptyText: "Ослабьте условия или сбросьте фильтры и посмотрите снова.",
    emptyDemo: "Открыть демо",
    priceNight: (n) => `${n} ₼ / ночь`,
    openListing: "Открыть",
    countLabel: (n) =>
      n === 1 ? "1 квартира" : n < 5 ? `${n} квартиры` : `${n} квартир`,
    footerNote: "Solivya · Азербайджан",
    filtersAria: "Фильтры квартир",
    filtersToggle: "Фильтр",
    filtersApply: "Показать",
    filtersClear: "Сбросить",
    filterAny: "Все",
    filterCity: "Город",
    filterRayon: "Район",
    filterNish: "Ориентир",
    filterPriceMin: "Цена от",
    filterPriceMax: "Цена до",
    filterRooms: "Комнат от",
    filterGuests: "Гостей от",
    filterAmenities: "Удобства",
    filterAmenitySearch: "Искать удобство…",
    filterAmenityEmpty: "Ничего не найдено",
    filterAmenityMore: "Ещё {n} — через поиск",
  },
};
