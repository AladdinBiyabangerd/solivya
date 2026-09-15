import type { LocaleCode } from "@/types/database";

export type SiteUiCopy = {
  contact: string;
  askWhatsApp: string;
  viewPhotos: string;
  amenitiesLabel: string;
  amenitiesTitle: string;
  rulesLabel: string;
  rulesTitle: string;
  writeWhatsApp: string;
  stickyText: string;
  stickyWhatsAppMessage: string;
  roomsGuests: (rooms: number, guests: number) => string;
  minNights: (n: number) => string;
  rentalKicker: string;
  mapAria: string;
  navigateHere: string;
  openMap: string;
  langAz: string;
  langRu: string;
  photoViewer: string;
  closeViewer: string;
  prevPhoto: string;
  nextPhoto: string;
};

export const SITE_UI: Record<LocaleCode, SiteUiCopy> = {
  az: {
    contact: "Əlaqə",
    askWhatsApp: "WhatsApp ilə soruş",
    viewPhotos: "Fotolara bax",
    amenitiesLabel: "Təchizat",
    amenitiesTitle: "Rahat qalış üçün hər şey",
    rulesLabel: "Qaydalar",
    rulesTitle: "Şəffaf və sadə",
    writeWhatsApp: "WhatsApp ilə yaz",
    stickyText: "Boş tarix üçün yazın — adətən tez cavab",
    stickyWhatsAppMessage: "Salam, tarix soruşmaq istəyirəm",
    roomsGuests: (rooms, guests) => `${rooms} otaq · ${guests} qonaq`,
    minNights: (n) => `Min. ${n} gecə`,
    rentalKicker: "Günlük kirayə",
    mapAria: "Yerləşmə vizualı",
    navigateHere: "Yol götür",
    openMap: "Xəritədə aç",
    langAz: "AZ",
    langRu: "RU",
    photoViewer: "Foto baxışı",
    closeViewer: "Bağla",
    prevPhoto: "Əvvəlki foto",
    nextPhoto: "Növbəti foto",
  },
  ru: {
    contact: "Контакты",
    askWhatsApp: "Спросить в WhatsApp",
    viewPhotos: "Смотреть фото",
    amenitiesLabel: "Удобства",
    amenitiesTitle: "Всё для комфортного проживания",
    rulesLabel: "Правила",
    rulesTitle: "Прозрачно и просто",
    writeWhatsApp: "Написать в WhatsApp",
    stickyText: "Напишите о датах — обычно отвечаем быстро",
    stickyWhatsAppMessage: "Здравствуйте, хочу уточнить даты",
    roomsGuests: (rooms, guests) => `${rooms} комн. · ${guests} гостя`,
    minNights: (n) => `Мин. ${n} ночи`,
    rentalKicker: "Посуточная аренда",
    mapAria: "Карта района",
    navigateHere: "Построить маршрут",
    openMap: "Открыть карту",
    langAz: "AZ",
    langRu: "RU",
    photoViewer: "Просмотр фото",
    closeViewer: "Закрыть",
    prevPhoto: "Предыдущее фото",
    nextPhoto: "Следующее фото",
  },
};

export function resolveLocale(
  requested: string | undefined,
  fallback: LocaleCode,
): LocaleCode {
  if (requested === "ru" || requested === "az") return requested;
  return fallback;
}
