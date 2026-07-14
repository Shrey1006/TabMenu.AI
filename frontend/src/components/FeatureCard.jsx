export default function FeatureCard({
  icon,
  badge,
  title,
  description,
  points,
  highlight,
}) {
  return (
    <div
      className={`rounded-2xl border p-8 transition-all hover:shadow-lg ${highlight ? "border-brand-300 bg-brand-50" : "border-stone-200 bg-white"}`}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <span
            className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${highlight ? "bg-brand-200 text-brand-800" : "bg-stone-100 text-stone-700"}`}
          >
            {badge}
          </span>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>

      <h3 className="mb-3 text-2xl font-bold text-stone-900">{title}</h3>
      <p className="mb-6 leading-relaxed text-stone-600">{description}</p>

      {points && points.length > 0 && (
        <div className="space-y-3">
          {points.map((point, idx) => (
            <div key={idx} className="flex gap-3">
              <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-brand-100">
                <svg
                  className="h-4 w-4 text-brand-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </span>
              <div>
                <p className="font-semibold text-stone-900">{point.label}</p>
                <p className="text-sm text-stone-600">{point.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
