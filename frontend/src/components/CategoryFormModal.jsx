import { useState, useEffect } from "react";

export default function CategoryFormModal({ category, onSubmit, onCancel }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (category) {
      setName(category.name || "");
      setDescription(category.description || "");
      setDisplayOrder(category.displayOrder || 0);
      setActive(category.active !== undefined ? category.active : true);
      setErrorMsg("");
    } else {
      setName("");
      setDescription("");
      setDisplayOrder(1);
      setActive(true);
      setErrorMsg("");
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Category name is required.");
      return;
    }
    onSubmit({
      name: name.trim(),
      description,
      displayOrder: Number(displayOrder),
      active,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-w-xl mx-auto rounded-2xl bg-white dark:bg-espresso-900 p-6 border border-cream-250 dark:border-espresso-750 text-chocolate-900 dark:text-espresso-50 shadow-2xl relative"
    >
      <h3 className="font-serif text-xl font-bold tracking-wide border-b border-cream-200 dark:border-espresso-800 pb-2 flex items-center justify-between">
        <span>{category ? "Edit Food Category" : "Add Food Category"}</span>
        <button
          type="button"
          onClick={onCancel}
          className="text-stone-400 hover:text-red-500 font-sans text-lg font-bold"
        >
          ✕
        </button>
      </h3>

      {errorMsg && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/40 p-3 text-xs font-semibold text-red-600 dark:text-red-400">
          ⚠️ {errorMsg}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
            Category Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2.5 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500 text-sm font-semibold"
            placeholder="e.g. Punjabi Specialties"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
            Display Order
          </label>
          <input
            type="number"
            required
            min="0"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2.5 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500 text-sm font-semibold"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium mb-1">
          Description (Optional)
        </label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none focus:border-gold-500 text-xs"
          placeholder="Brief description of this menu section..."
        />
      </div>

      <div className="flex items-center justify-between bg-cream-50/50 dark:bg-espresso-950/40 p-4 rounded-xl border border-cream-200/65 dark:border-espresso-800">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-espresso-100">
            Active / Visible Status
          </h4>
          <p className="text-[10px] text-stone-400 mt-0.5 leading-tight">
            If hidden, this category and its dishes will not display on the customer menu.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-stone-200 peer-focus:outline-hidden rounded-full peer dark:bg-espresso-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-espresso-600 peer-checked:bg-gold-500"></div>
        </label>
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
          {category ? "Save Changes" : "Create Category"}
        </button>
      </div>
    </form>
  );
}
