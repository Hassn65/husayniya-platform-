import type { Config } from "tailwindcss";

// Tailwind v3.3+ ships `rtl:`/`ltr:` variants out of the box, driven off
// the `dir` attribute we set on <html> in app/[locale]/layout.tsx — no
// plugin or manual variant config needed. Prefer logical utilities
// (ms-, me-, ps-, pe-, start-, end-, text-start, text-end) over
// directional ones (ml-, mr-, left-, right-) everywhere in this project
// so components flip automatically instead of needing rtl: overrides.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // A single family with solid Arabic/Persian/Latin coverage,
        // e.g. "IBM Plex Sans Arabic" or "Noto Sans Arabic" paired with
        // a Latin fallback. Swap in the real font once licensed/self-hosted.
        sans: ["IBM Plex Sans Arabic", "IBM Plex Sans", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#1d4ed8",
          green: "#059669",
          rose: "#fda4af",
          violet: "#a78bfa",
        },
      },
    },
  },
  plugins: [],
};

export default config;
