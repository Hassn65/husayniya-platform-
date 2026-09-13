# Husayniya & Community Center Land Donation Platform — Starter Scaffold

This is a minimal, working slice of the full spec — enough to see the
architecture decisions in place, not a finished site. Drop it into (or use it
to guide) your Next.js App Router project.

## What's here

- **`lib/i18n/config.ts`** — locales, default (`ar`), RTL set, cookie name,
  and the fixed language-selector display order.
- **`middleware.ts`** — redirects `/` and unprefixed paths to `/ar` (or the
  cookie's saved locale) and keeps the cookie in sync on direct locale links.
  Deliberately ignores `Accept-Language` on first visit, per spec: Arabic is
  the default until the user picks something else.
- **`lib/i18n/getDictionary.ts`** — loads `/locales/<locale>/<namespace>.json`
  with automatic fallback to Arabic if a namespace/key is missing, plus a
  `t()` helper that renders `⚠️ [missing.key]` instead of crashing.
- **`app/[locale]/layout.tsx`** — sets `<html lang dir>`, generates per-locale
  `<title>`, meta description, canonical URL, and hreflang alternates for all
  four locales.
- **`components/LanguageSwitcher.tsx`** — the 🌐 selector, Arabic always
  first, sets the cookie and swaps the locale segment in the current path
  (so switching language doesn't lose your place).
- **`lib/i18n/format.ts`** — `Intl.NumberFormat`/`Intl.DateTimeFormat`
  wrappers so currency, percentages, and dates render in each locale's native
  digits/format automatically — no manual string building.
- **`components/DonationProgress.tsx`** + **`app/[locale]/page.tsx`** — shows
  the goal/raised/remaining/progress numbers coming from data (mocked here)
  while only the language and formatting change, per the spec's example.
- **`prisma/schema.prisma`** — `Content`/`ContentTranslation` pattern for
  news/services/activities/FAQ (one shared row + one row per locale, so nothing
  is duplicated and a missing translation is just a missing row), plus
  `DonationCampaign`/`DonationCampaignTranslation`, a minimal `Donation` model
  (money stored as integer cents), and a `Quote` model that requires a
  `source`/`isVerified` flag rather than ever inventing hadith text.
- **`tailwind.config.ts`** — notes on using Tailwind's built-in `rtl:`/`ltr:`
  variants (driven by the `dir` attribute) and logical utilities.

## What's intentionally left for you to fill in

- Real Arabic/German/English/Persian copy beyond the strings you already
  supplied (these are wired in as-is).
- The actual PayPal/bank-transfer donation flow and admin dashboard.
- `/locales/<lang>/{about,services,activities,news,faq,contact,legal}.json` —
  only `common.json` is scaffolded per locale; follow the same pattern.
- Legal pages (Impressum/Datenschutz/Cookie Policy) — use bracketed
  placeholders (`[VERANTWORTLICHE PERSON]`, etc.) until real details are
  provided; nothing legal should ship with invented content.
- Swapping the mocked campaign numbers in `page.tsx` for a real Prisma query.
- A production font with solid Arabic + Persian + Latin coverage (e.g. IBM
  Plex Sans Arabic, self-hosted for performance and offline reliability).

## Running it

This scaffold assumes it's dropped into an existing (or new) Next.js 14+ App
Router project with Tailwind and Prisma already installed:

```bash
npm install
npx prisma generate
npm run dev
```
