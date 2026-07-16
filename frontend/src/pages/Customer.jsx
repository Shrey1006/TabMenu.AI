import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";
import { useTheme } from "../context/ThemeContext";

// Reusable components
import MenuCard from "../components/MenuCard";
import CategoryAccordion from "../components/CategoryAccordion";

export default function Customer() {
  const { isDark, toggleTheme } = useTheme();
  
  // State variables
  const [menu, setMenu] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    veg: false,
    nonVeg: false,
    jain: false,
    bestseller: false,
    spicy: false,
    availableOnly: false,
    priceSort: "", // "asc" | "desc" | ""
  });
  const [toastMsg, setToastMsg] = useState("");

  // Category Accordion open states
  const [openCategories, setOpenCategories] = useState({});

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const loadMenu = () => {
    api.get("/menu")
      .then((r) => {
        setMenu(r.data);
        // Open all categories by default
        const cats = {};
        r.data.forEach(item => {
          if (item.category?.name) {
            cats[item.category.name] = true;
          }
        });
        setOpenCategories(cats);
      })
      .catch(() => showToast("Failed to retrieve menu specialties."));
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Filter and search logic
  const filteredMenu = useMemo(() => {
    let result = [...menu];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category?.name?.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    // Filter Badges
    if (activeFilters.veg) result = result.filter((m) => m.veg);
    if (activeFilters.nonVeg) result = result.filter((m) => m.nonVeg);
    if (activeFilters.jain) result = result.filter((m) => m.jain);
    if (activeFilters.bestseller) result = result.filter((m) => m.bestseller);
    if (activeFilters.spicy) result = result.filter((m) => m.spiceLevel === "high");
    if (activeFilters.availableOnly) result = result.filter((m) => m.available);

    // Price Sorting
    if (activeFilters.priceSort === "asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (activeFilters.priceSort === "desc") {
      result.sort((a, b) => b.price - a.price);
    } else {
      // Default to category displayOrder and then item displayOrder
      result.sort((a, b) => {
        const catA = a.category?.displayOrder ?? 0;
        const catB = b.category?.displayOrder ?? 0;
        if (catA !== catB) return catA - catB;
        return a.displayOrder - b.displayOrder;
      });
    }

    return result;
  }, [menu, searchQuery, activeFilters]);

  // Group items by category
  const groupedMenu = useMemo(() => {
    const groups = {};
    filteredMenu.forEach((item) => {
      const cat = item.category?.name || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredMenu]);

  const toggleCategory = (cat) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-espresso-950 text-chocolate-900 dark:text-[#f7f3ec] transition-colors duration-200 pb-16">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 z-50 rounded-xl bg-stone-900 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 border border-stone-850"
          >
            🔔 {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Royal Header */}
      <header className="border-b border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900/90 px-4 py-4 sticky top-0 z-30 backdrop-blur-md transition-colors shadow-xs">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Ambika Logo"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-500/40 bg-white"
            />
            <div>
              <h1 className="font-serif text-lg font-bold tracking-wide">Ambika Pure Veg</h1>
              <p className="text-[10px] uppercase tracking-wider text-gold-500 font-bold">Explore Our Delicacies</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider bg-cream-100 dark:bg-espresso-800 border border-cream-200 dark:border-espresso-775 text-chocolate-850 dark:text-espresso-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <Link to="/" className="rounded-lg border border-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-500 hover:bg-gold-500 hover:text-white transition-all cursor-pointer">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
        
        {/* QR Code ordering notice card */}
        <div className="rounded-2xl border border-gold-500/30 bg-gold-500/5 p-5 shadow-xs flex flex-col sm:flex-row items-center gap-4 transition-colors">
          <div className="text-3xl shrink-0">📱</div>
          <div className="space-y-1">
            <h4 className="font-serif text-sm font-bold text-gold-500 uppercase tracking-wider">Dining with us?</h4>
            <p className="text-xs text-stone-500 dark:text-espresso-100/90 font-semibold leading-relaxed">
              Simply scan the QR code placed on your table to place your order. Browse the menu here anytime before you arrive.
            </p>
          </div>
        </div>

        {/* Live Search & Filter Bar */}
        <div className="space-y-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-4 flex items-center text-stone-400">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search our heritage menu (e.g. Paneer, Tandoori...)"
              className="w-full rounded-2xl border border-cream-200 dark:border-espresso-750 pl-10 pr-4 py-4 bg-white dark:bg-espresso-900 outline-none focus:border-gold-500 text-sm shadow-xs transition-colors"
            />
          </div>

          {/* Filter Badges Grid */}
          <div className="flex flex-wrap gap-2 items-center">
            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, veg: !prev.veg }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                activeFilters.veg
                  ? "bg-green-500/10 text-green-600 border-green-500/30 font-bold"
                  : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
              }`}
            >
              🟢 Veg Only
            </button>
            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, jain: !prev.jain }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                activeFilters.jain
                  ? "bg-gold-500/10 text-gold-500 border-gold-500/30 font-bold"
                  : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
              }`}
            >
              🌾 Jain Options
            </button>
            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, bestseller: !prev.bestseller }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                activeFilters.bestseller
                  ? "bg-gold-500 text-white border-transparent font-bold shadow-xs"
                  : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
              }`}
            >
              ⭐ Bestsellers
            </button>
            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, spicy: !prev.spicy }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                activeFilters.spicy
                  ? "bg-red-500/10 text-red-650 border-red-500/30 font-bold"
                  : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
              }`}
            >
              🌶️ Spicy Only
            </button>
            <button
              onClick={() => setActiveFilters(prev => ({ ...prev, availableOnly: !prev.availableOnly }))}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                activeFilters.availableOnly
                  ? "bg-stone-900 text-white border-transparent font-bold"
                  : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
              }`}
            >
              ● In Stock
            </button>

            {/* Price Sort Dropdown */}
            <select
              value={activeFilters.priceSort}
              onChange={(e) => setActiveFilters(prev => ({ ...prev, priceSort: e.target.value }))}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-white dark:bg-espresso-900 border border-cream-200 dark:border-espresso-750 text-stone-500 dark:text-espresso-100 outline-none cursor-pointer"
            >
              <option value="">Sort by Price</option>
              <option value="asc">Price: Low → High</option>
              <option value="desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Accordion List */}
        <div className="rounded-2xl border border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900 shadow-sm overflow-hidden">
          {Object.keys(groupedMenu).length === 0 ? (
            <div className="p-12 text-center text-stone-400">
              No delicacies match your filter settings.
            </div>
          ) : (
            Object.keys(groupedMenu).map((cat) => (
              <CategoryAccordion
                key={cat}
                category={cat}
                itemCount={groupedMenu[cat].length}
                isOpen={!!openCategories[cat]}
                onToggle={() => toggleCategory(cat)}
              >
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2">
                  {groupedMenu[cat].map((item) => (
                    <MenuCard
                      key={item._id}
                      item={item}
                      readOnly={true}
                    />
                  ))}
                </div>
              </CategoryAccordion>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
