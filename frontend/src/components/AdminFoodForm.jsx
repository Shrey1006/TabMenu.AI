import { useState, useEffect } from "react";

export default function AdminFoodForm({ item, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [category, setCategory] = useState("Starters");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [veg, setVeg] = useState(true);
  const [nonVeg, setNonVeg] = useState(false);
  const [jain, setJain] = useState(false);
  const [available, setAvailable] = useState(true);
  const [bestseller, setBestseller] = useState(false);
  const [prepTimeMinutes, setPrepTimeMinutes] = useState(15);
  const [spiceLevel, setSpiceLevel] = useState("none");
  const [displayOrder, setDisplayOrder] = useState(0);

  const categoriesList = [
    "Starters",
    "Main Course",
    "Breads",
    "Desserts",
    "Beverages",
  ];

  useEffect(() => {
    if (item) {
      setName(item.name || "");
      setPrice(item.price || 0);
      setCategory(item.category || "Starters");
      setDescription(item.description || "");
      setImage(item.image || "");
      setVeg(item.veg !== undefined ? item.veg : true);
      setNonVeg(item.nonVeg !== undefined ? item.nonVeg : false);
      setJain(item.jain !== undefined ? item.jain : false);
      setAvailable(item.available !== undefined ? item.available : true);
      setBestseller(item.bestseller !== undefined ? item.bestseller : false);
      setPrepTimeMinutes(item.prepTimeMinutes || 15);
      setSpiceLevel(item.spiceLevel || "none");
      setDisplayOrder(item.displayOrder || 0);
    } else {
      // Defaults
      setName("");
      setPrice(0);
      setCategory("Starters");
      setDescription("");
      setImage("");
      setVeg(true);
      setNonVeg(false);
      setJain(false);
      setAvailable(true);
      setBestseller(false);
      setPrepTimeMinutes(15);
      setSpiceLevel("none");
      setDisplayOrder(0);
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name,
      price: Number(price),
      category,
      description,
      image,
      veg,
      nonVeg,
      jain,
      available,
      bestseller,
      prepTimeMinutes: Number(prepTimeMinutes),
      spiceLevel,
      displayOrder: Number(displayOrder),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl mx-auto rounded-2xl bg-white dark:bg-espresso-900 p-6 border border-cream-250 dark:border-espresso-750 text-chocolate-900 dark:text-espresso-50">
      <h3 className="font-serif text-xl font-bold tracking-wide border-b border-cream-200 dark:border-espresso-800 pb-2">
        {item ? "Edit Culinary Specialty" : "Add New Specialty"}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
            Food Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500"
            placeholder="e.g. Kashmiri Dum Aloo"
          />
        </div>
        
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
            Price (₹)
          </label>
          <input
            type="number"
            required
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500"
          >
            {categoriesList.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
            Food Image URL
          </label>
          <input
            type="text"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500"
            placeholder="e.g. /ambika-pure-veg-img4.avif"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
          Description
        </label>
        <textarea
          required
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500"
          placeholder="Brief description of the dish..."
        />
      </div>

      {/* Toggles section */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 bg-cream-50/50 dark:bg-espresso-950/40 p-4 rounded-xl border border-cream-200/65 dark:border-espresso-800">
        <label className="flex items-center gap-2 text-xs font-semibold select-none cursor-pointer">
          <input
            type="checkbox"
            checked={veg}
            onChange={(e) => setVeg(e.target.checked)}
            className="rounded border-cream-200 dark:border-espresso-750 text-gold-500 focus:ring-0"
          />
          🟢 Veg
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold select-none cursor-pointer">
          <input
            type="checkbox"
            checked={nonVeg}
            onChange={(e) => setNonVeg(e.target.checked)}
            className="rounded border-cream-200 dark:border-espresso-750 text-gold-500 focus:ring-0"
          />
          🔴 Non-Veg
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold select-none cursor-pointer">
          <input
            type="checkbox"
            checked={jain}
            onChange={(e) => setJain(e.target.checked)}
            className="rounded border-cream-200 dark:border-espresso-750 text-gold-500 focus:ring-0"
          />
          🌾 Jain
        </label>

        <label className="flex items-center gap-2 text-xs font-semibold select-none cursor-pointer">
          <input
            type="checkbox"
            checked={bestseller}
            onChange={(e) => setBestseller(e.target.checked)}
            className="rounded border-cream-200 dark:border-espresso-750 text-gold-500 focus:ring-0"
          />
          ⭐ Bestseller
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
            Spice Level
          </label>
          <select
            value={spiceLevel}
            onChange={(e) => setSpiceLevel(e.target.value)}
            className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500 text-xs"
          >
            <option value="none">✨ None / Mild</option>
            <option value="low">🌶️ Low</option>
            <option value="medium">🌶️🌶️ Medium</option>
            <option value="high">🌶️🌶️🌶️ Spicy</option>
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
            Prep Time (mins)
          </label>
          <input
            type="number"
            required
            min="1"
            value={prepTimeMinutes}
            onChange={(e) => setPrepTimeMinutes(e.target.value)}
            className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
            Display Order
          </label>
          <input
            type="number"
            required
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-cream-100 dark:border-espresso-800">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-cream-200 dark:border-espresso-750 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-chocolate-850 dark:text-espresso-100 hover:bg-cream-100 dark:hover:bg-espresso-850 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          {item ? "Save Changes" : "Create Item"}
        </button>
      </div>
    </form>
  );
}
