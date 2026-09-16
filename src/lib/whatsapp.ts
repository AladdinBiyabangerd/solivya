/**
 * Normalize a phone into digits for wa.me.
 * Accepts local AZ (0XXXXXXXXX / XXXXXXXXX) and international (994…).
 */
export function normalizeWhatsAppDigits(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }
  // Local Azerbaijan mobile: 0XX XXX XX XX → 994XX…
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `994${digits.slice(1)}`;
  } else if (!digits.startsWith("994") && digits.length === 9) {
    digits = `994${digits}`;
  }
  return digits;
}

export function whatsappHref(phoneRaw: string, message: string): string {
  const phone = normalizeWhatsAppDigits(phoneRaw);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/** Sales CTA on marketing — falls back to placeholder if env missing. */
export function salesWhatsAppHref(message: string): string {
  const raw =
    process.env.NEXT_PUBLIC_SALES_WHATSAPP?.trim() || "994501234567";
  return whatsappHref(raw, message);
}
