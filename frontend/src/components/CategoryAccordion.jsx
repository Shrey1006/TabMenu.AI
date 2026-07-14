import { motion, AnimatePresence } from "framer-motion";

export default function CategoryAccordion({ category, itemCount, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-cream-200 dark:border-espresso-800 last:border-none">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 px-4 font-serif text-lg font-bold text-chocolate-900 dark:text-white hover:bg-cream-100/30 dark:hover:bg-espresso-900/30 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-[#b69234]">✦</span>
          <span>{category}</span>
          <span className="rounded-full bg-cream-200 dark:bg-espresso-800 px-2.5 py-0.5 text-xs font-sans font-bold text-[#b69234]">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </span>
        </div>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gold-500 font-sans text-sm font-semibold"
        >
          ▼
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-cream-50/20 dark:bg-[#120b08]/10">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
