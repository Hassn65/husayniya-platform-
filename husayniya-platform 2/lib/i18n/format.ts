import type { Locale } from "./config";

// Maps our app locales to full BCP-47 tags Intl expects for correct
// digit systems / currency placement (e.g. Arabic-Indic digits for `ar`).
const INTL_TAG: Record<Locale, string> = {
  ar: "ar-DE", // Arabic formatting conventions, Germany as the operating country
  de: "de-DE",
  en: "en-GB",
  fa: "fa-IR",
};

export function formatCurrency(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_TAG[locale], {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercent(fraction: number, locale: Locale): string {
  return new Intl.NumberFormat(INTL_TAG[locale], {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(fraction);
}

export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_TAG[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
