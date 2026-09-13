import "server-only";
import { defaultLocale, type Locale } from "./config";

// One loader entry per locale/namespace. Add a namespace here once its
// /locales/<locale>/<namespace>.json file exists.
const loaders: Record<Locale, Record<string, () => Promise<any>>> = {
  ar: { common: () => import("../../locales/ar/common.json").then((m) => m.default) },
  de: { common: () => import("../../locales/de/common.json").then((m) => m.default) },
  en: { common: () => import("../../locales/en/common.json").then((m) => m.default) },
  fa: { common: () => import("../../locales/fa/common.json").then((m) => m.default) },
};

/**
 * Loads a translation namespace for a locale. Falls back to Arabic if the
 * locale is missing the namespace or a request fails, per spec priority:
 * 1) selected locale  2) Arabic  3) throws only if Arabic is also missing.
 */
export async function getDictionary(locale: Locale, namespace: string = "common") {
  try {
    const loader = loaders[locale]?.[namespace];
    if (!loader) throw new Error(`Missing namespace "${namespace}" for locale "${locale}"`);
    return await loader();
  } catch (err) {
    if (locale !== defaultLocale) {
      console.warn(
        `[i18n] Falling back to "${defaultLocale}" for namespace "${namespace}" (locale "${locale}" failed):`,
        err
      );
      return getDictionary(defaultLocale, namespace);
    }
    // Arabic itself is missing/broken — surface a safe, visible fallback
    // instead of crashing the page.
    console.error(`[i18n] Arabic fallback also failed for namespace "${namespace}"`, err);
    return {};
  }
}

/**
 * Safe getter for a dot-path key inside a loaded dictionary, e.g. "donation.goal".
 * Returns a visibly-marked placeholder instead of throwing when a key is absent,
 * so admins/testers can spot missing strings without the page crashing.
 */
export function t(dict: Record<string, any>, path: string): string {
  const value = path.split(".").reduce<any>((acc, key) => (acc == null ? acc : acc[key]), dict);
  return typeof value === "string" ? value : `⚠️ [${path}]`;
}
