"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { locales, localeLabels, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

// Required display order: Arabic first, always.
const ORDERED_LOCALES: Locale[] = ["ar", "de", "en", "fa"];

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  function switchTo(locale: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${locale}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`;

    // Swap the leading locale segment, keep the rest of the path (and query).
    const segments = pathname.split("/");
    segments[1] = locale;
    router.push(segments.join("/") || `/${locale}`);
    setOpen(false);
  }

  return (
    <div className="relative inline-block text-start">
      {/* Mobile/desktop trigger — compact, thumb-reachable */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
      >
        <span aria-hidden>🌐</span>
        <span>{localeLabels[currentLocale].native}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 min-w-[9rem] rounded-xl border border-slate-200 bg-white p-1 shadow-lg
                     rtl:right-0 ltr:left-0"
        >
          {ORDERED_LOCALES.map((locale) => (
            <li key={locale}>
              <button
                type="button"
                role="option"
                aria-selected={locale === currentLocale}
                onClick={() => switchTo(locale)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50 ${
                  locale === currentLocale ? "font-semibold text-blue-700" : "text-slate-700"
                }`}
              >
                <span aria-hidden>{localeLabels[locale].flag}</span>
                <span>{localeLabels[locale].native}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
