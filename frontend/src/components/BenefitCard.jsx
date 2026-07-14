export default function BenefitCard({ number, title, description, metric }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="mb-4 flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100">
          <span className="font-bold text-brand-700">{number}</span>
        </div>
        {metric && (
          <div className="rounded-lg bg-brand-50 px-3 py-1">
            <span className="font-bold text-brand-700">{metric}</span>
          </div>
        )}
      </div>

      <h3 className="mb-2 text-lg font-bold text-stone-900">{title}</h3>
      <p className="leading-relaxed text-stone-600">{description}</p>
    </div>
  );
}
