import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

// Paths that should never be locale-prefixed (static assets, API routes, etc.)
const PUBLIC_FILE = /\.(.*)$/;

function getLocaleFromPath(pathname: string): Locale | null {
  const seg = pathname.split("/")[1];
  return (locales as readonly string[]).includes(seg) ? (seg as Locale) : null;
}

function pickLocale(req: NextRequest): Locale {
  // 1. Explicit cookie from a previous visit wins.
  const cookieLocale = req.cookies.get(LOCALE_COOKIE)?.value;
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale;
  }

  // 2. No stored preference yet -> Arabic is the fixed default.
  // (We deliberately do NOT infer from Accept-Language here, per spec:
  //  "Wenn noch keine Sprache gespeichert wurde, ist Arabisch die Standardsprache.")
  return defaultLocale;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const pathLocale = getLocaleFromPath(pathname);

  if (pathLocale) {
    // Locale already in URL — just make sure the cookie matches the user's
    // explicit navigation, so a direct link to /de "sticks" for next visit.
    const res = NextResponse.next();
    res.cookies.set(LOCALE_COOKIE, pathLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
    });
    return res;
  }

  // No locale in the URL: redirect to the resolved locale, preserving path/query.
  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;

  const res = NextResponse.redirect(url);
  res.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
  });
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
