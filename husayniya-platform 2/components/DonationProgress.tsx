import type { Locale } from "@/lib/i18n/config";
import { formatCurrency, formatPercent } from "@/lib/i18n/format";
import { t } from "@/lib/i18n/getDictionary";

type Props = {
  dict: Record<string, any>;
  locale: Locale;
  goalCents: number; // store money as integer cents in the DB — never floats
  raisedCents: number;
};

export function DonationProgress({ dict, locale, goalCents, raisedCents }: Props) {
  const goal = goalCents / 100;
  const raised = raisedCents / 100;
  const remaining = Math.max(goal - raised, 0);
  const fraction = goal > 0 ? Math.min(raised / goal, 1) : 0;

  return (
    <section className="rounded-2xl border border-slate-200 p-6 shadow-sm" dir="auto">
      <h2 className="text-xl font-semibold">{t(dict, "donation.title")}</h2>

      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-sm text-slate-500">{t(dict, "donation.goal")}</dt>
          <dd className="text-lg font-bold">{formatCurrency(goal, locale)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">{t(dict, "donation.raised")}</dt>
          <dd className="text-lg font-bold text-emerald-600">{formatCurrency(raised, locale)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">{t(dict, "donation.remaining")}</dt>
          <dd className="text-lg font-bold">{formatCurrency(remaining, locale)}</dd>
        </div>
        <div>
          <dt className="text-sm text-slate-500">{t(dict, "donation.progress")}</dt>
          <dd className="text-lg font-bold">{formatPercent(fraction, locale)}</dd>
        </div>
      </dl>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-emerald-500"
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
    </section>
  );
}
