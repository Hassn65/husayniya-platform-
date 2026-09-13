import type { Metadata } from "next";
import { locales, dirFor, defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, t } from "@/lib/i18n/getDictionary";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import "./globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Per-locale SEO: title/description/OG/hreflang/canonical.
export async function generateMetadata({
  params,
}: {
  params: { locale: Locale };
}): Promise<Metadata> {
  const locale = locales.includes(params.locale) ? params.locale : defaultLocale;
  const dict = await getDictionary(locale);
  const title = t(dict, "hero.title");
  const description = t(dict, "hero.subtitle");
  const base = "https://example.org"; // TODO: replace with the real production domain

  return {
    title,
    description,
    alternates: {
      canonical: `${base}/${locale}`,
      languages: Object.fromEntries(locales.map((l) => [l, `${base}/${l}`])),
    },
    openGraph: {
      title,
      description,
      locale,
      url: `${base}/${locale}`,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: Locale };
}) {
  const locale = locales.includes(params.locale) ? params.locale : defaultLocale;
  const dir = dirFor(locale);

  return (
    <html lang={locale} dir={dir}>
      <body className="min-h-screen bg-white text-slate-900 antialiased">
        <LanguageSwitcher currentLocale={locale} />
        {children}
      </body>
    </html>
  );
}
