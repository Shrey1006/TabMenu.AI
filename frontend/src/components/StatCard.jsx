export default function StatCard({ value, label, description, icon }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md hover:border-brand-200 dark:border-stone-850 dark:bg-stone-900 dark:hover:border-brand-800">
      {icon && <span className="text-4xl">{icon}</span>}

      <p className="mt-4 text-4xl font-bold text-brand-700 dark:text-brand-400">{value}</p>
      <p className="mt-2 font-semibold text-stone-900 dark:text-stone-100">{label}</p>

      {description && (
        <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
          {description}
        </p>
      )}
    </div>
  );
}
