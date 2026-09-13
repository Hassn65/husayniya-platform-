export const locales = ["ar", "de", "en", "fa"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "ar";

export const rtlLocales: Locale[] = ["ar", "fa"];

export function isRtl(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return isRtl(locale) ? "rtl" : "ltr";
}

// Human-readable labels shown in the language selector, in required display order.
export const localeLabels: Record<Locale, { native: string; flag: string }> = {
  ar: { native: "العربية", flag: "🇸🇦" },
  de: { native: "Deutsch", flag: "🇩🇪" },
  en: { native: "English", flag: "🇬🇧" },
  fa: { native: "فارسی", flag: "🇮🇷" },
};

export const LOCALE_COOKIE = "NEXT_LOCALE";
