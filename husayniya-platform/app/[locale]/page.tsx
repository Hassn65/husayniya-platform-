import { locales, defaultLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary, t } from "@/lib/i18n/getDictionary";
import { DonationProgress } from "@/components/DonationProgress";

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const locale = locales.includes(params.locale) ? params.locale : defaultLocale;
  const dict = await getDictionary(locale);

  // TODO: replace with a real query, e.g.
  // const campaign = await prisma.donationCampaign.findUnique({ where: { slug: "land-purchase" } });
  const campaign = { goalCents: 20_000_000, raisedCents: 2_000_000 };

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-10">
      <section className="text-center space-y-3">
        <h1 className="text-3xl font-bold">{t(dict, "hero.title")}</h1>
        <p className="text-slate-600">{t(dict, "hero.subtitle")}</p>
      </section>

      <DonationProgress
        dict={dict}
        locale={locale}
        goalCents={campaign.goalCents}
        raisedCents={campaign.raisedCents}
      />

      <section>
        <h2 className="text-xl font-semibold mb-4">{t(dict, "services.title")}</h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li className="rounded-xl border border-slate-200 p-4">{t(dict, "services.school")}</li>
          <li className="rounded-xl border border-slate-200 p-4">{t(dict, "services.quran")}</li>
          <li className="rounded-xl border border-slate-200 p-4">{t(dict, "services.majalis")}</li>
          <li className="rounded-xl border border-slate-200 p-4">{t(dict, "services.social")}</li>
        </ul>
      </section>
    </main>
  );
}
