export default function BenefitCard({ number, title, description, metric }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-stone-850 dark:bg-stone-900">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950/60">
          <span className="font-bold text-brand-700 dark:text-brand-300">{number}</span>
        </div>
        {metric && (
          <div className="rounded-lg bg-brand-50 px-3 py-1 dark:bg-brand-900/40">
            <span className="font-bold text-brand-700 dark:text-brand-300">{metric}</span>
          </div>
        )}
      </div>

      <h3 className="mb-2 text-lg font-bold text-stone-900 dark:text-stone-100">{title}</h3>
      <p className="leading-relaxed text-stone-600 dark:text-stone-300">{description}</p>
    </div>
  );
}
