import { motion } from "framer-motion";

export default function MenuCard({ item, quantity = 0, onAdd, onRemove }) {
  const { name, description, price, category, image, veg, nonVeg, jain, available, bestseller, spiceLevel, prepTimeMinutes } = item;

  const spiceLabels = {
    none: "",
    low: "🌶️ Mild",
    medium: "🌶️🌶️ Medium",
    high: "🌶️🌶️🌶️ Spicy",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      whileHover={available ? { y: -6 } : {}}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border transition-all ${
        available
          ? "border-cream-200 dark:border-espresso-750 bg-white dark:bg-espresso-900 shadow-sm hover:shadow-md"
          : "border-stone-200 dark:border-stone-800 bg-stone-100/50 dark:bg-espresso-950/40 opacity-70"
      }`}
    >
      {/* Bestseller Badge */}
      {bestseller && (
        <div className="absolute top-3 left-3 z-10 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
          ⭐ Bestseller
        </div>
      )}

      {/* Veg / Non-Veg Indicator */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        {veg && (
          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold text-green-600 border border-green-500/20">
            🟢 Veg
          </span>
        )}
        {nonVeg && (
          <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-semibold text-red-600 border border-red-500/20">
            🔴 Non-Veg
          </span>
        )}
        {jain && (
          <span className="rounded-full bg-gold-500/10 px-2 py-0.5 text-[10px] font-semibold text-gold-500 border border-gold-500/20">
            🌾 Jain
          </span>
        )}
      </div>

      {/* Food Image */}
      <div className="relative h-48 w-full overflow-hidden bg-cream-100 dark:bg-espresso-950">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-300 dark:text-stone-700">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
            <span className="rounded-lg bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-chocolate-900 dark:text-white line-clamp-1">
              {name}
            </h3>
            <p className="text-[10px] uppercase tracking-wider text-gold-500 font-semibold">
              {category}
            </p>
          </div>
          <span className="font-serif text-lg font-bold text-[#b69234]">
            ₹{price}
          </span>
        </div>

        <p className="text-xs text-chocolate-700 dark:text-espresso-100/70 line-clamp-2 min-h-[2rem]">
          {description}
        </p>

        {/* Footer info: Spice Level & Prep Time */}
        <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-espresso-100/50 pt-2 border-t border-cream-100 dark:border-espresso-800">
          <span>{spiceLabels[spiceLevel] || "✨ Mild"}</span>
          <span>⏱️ {prepTimeMinutes} mins prep</span>
        </div>

        {/* Action Button / Qty Selector */}
        <div className="pt-2">
          {!available ? (
            <button
              disabled
              className="w-full rounded-xl bg-stone-200 dark:bg-espresso-950 py-3 text-xs font-bold uppercase tracking-wider text-stone-400 dark:text-stone-600"
            >
              Unavailable
            </button>
          ) : quantity > 0 ? (
            <div className="flex items-center justify-between rounded-xl bg-cream-100 dark:bg-espresso-800 border border-cream-200 dark:border-espresso-700 overflow-hidden">
              <button
                onClick={onRemove}
                className="flex h-11 w-12 items-center justify-center text-lg font-bold text-chocolate-850 dark:text-espresso-50 hover:bg-cream-200 dark:hover:bg-espresso-700 transition-colors"
              >
                −
              </button>
              <span className="font-serif text-sm font-bold text-chocolate-900 dark:text-white">
                {quantity}
              </span>
              <button
                onClick={onAdd}
                className="flex h-11 w-12 items-center justify-center text-lg font-bold text-chocolate-850 dark:text-espresso-50 hover:bg-cream-200 dark:hover:bg-espresso-700 transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={onAdd}
              className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Add To Cart
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
