export default function StatCard({ value, label, description, icon }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm transition-all hover:shadow-md hover:border-brand-200">
      {icon && <span className="text-4xl">{icon}</span>}

      <p className="mt-4 text-4xl font-bold text-brand-700">{value}</p>
      <p className="mt-2 font-semibold text-stone-900">{label}</p>

      {description && (
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          {description}
        </p>
      )}
    </div>
  );
}
