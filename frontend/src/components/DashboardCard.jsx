import { Link } from "react-router-dom";

export default function DashboardCard({
  title,
  icon,
  description,
  features,
  path,
  color,
  textColor,
}) {
  return (
    <Link to={path}>
      <div
        className={`group rounded-2xl border-2 p-8 transition-all hover:shadow-xl ${color}`}
      >
        <div className="mb-4">
          <span
            className={`text-5xl transition-transform group-hover:scale-110`}
          >
            {icon}
          </span>
        </div>

        <h3 className={`mb-2 text-2xl font-bold ${textColor}`}>{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-stone-600">
          {description}
        </p>

        <div className="space-y-2 border-t border-opacity-30 pt-4">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-current opacity-60"></span>
              <span className="text-sm font-medium text-stone-700">
                {feature}
              </span>
            </div>
          ))}
        </div>

        <div
          className={`mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${textColor} transition-all group-hover:translate-x-1`}
        >
          Open Dashboard →
        </div>
      </div>
    </Link>
  );
}
