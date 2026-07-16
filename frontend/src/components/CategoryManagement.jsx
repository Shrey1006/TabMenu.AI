import { useMemo } from "react";
import api from "../lib/api.js";

export default function CategoryManagement({
  categories,
  menu,
  onEdit,
  onDelete,
  onReload,
}) {
  // Compute item counts by category ID
  const itemCounts = useMemo(() => {
    const counts = {};
    menu.forEach((item) => {
      const catId = item.category?._id || item.category;
      if (catId) {
        counts[catId] = (counts[catId] || 0) + 1;
      }
    });
    return counts;
  }, [menu]);

  // Toggle active status
  const handleToggleActive = async (cat) => {
    try {
      await api.put(`/categories/${cat._id}`, { active: !cat.active });
      onReload();
    } catch {
      alert("Failed to toggle category status.");
    }
  };

  // Move up/down (swap orders)
  const handleMove = async (index, direction) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const cat1 = categories[index];
    const cat2 = categories[targetIndex];

    // Ensure they have different orders to swap. If same, assign displayOrder based on index
    let order1 = cat1.displayOrder;
    let order2 = cat2.displayOrder;

    if (order1 === order2) {
      order1 = index + 1;
      order2 = targetIndex + 1;
    }

    try {
      await Promise.all([
        api.put(`/categories/${cat1._id}`, { displayOrder: order2 }),
        api.put(`/categories/${cat2._id}`, { displayOrder: order1 }),
      ]);
      onReload();
    } catch {
      alert("Failed to change order.");
    }
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-cream-200 dark:border-espresso-750 bg-white dark:bg-espresso-900 shadow-sm text-chocolate-900 dark:text-espresso-50">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-cream-200 dark:border-espresso-800 bg-cream-50/50 dark:bg-espresso-955 text-chocolate-850 dark:text-espresso-100 font-serif">
            <th className="p-4 font-bold">Category Name</th>
            <th className="p-4 font-bold text-center">Food Items</th>
            <th className="p-4 font-bold text-center">Display Order</th>
            <th className="p-4 font-bold text-center">Reorder</th>
            <th className="p-4 font-bold text-center">Status</th>
            <th className="p-4 font-bold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-stone-400">
                No categories configured. Click "+ Add Category" to create one.
              </td>
            </tr>
          ) : (
            categories.map((cat, idx) => (
              <tr
                key={cat._id}
                className="border-b border-cream-100 dark:border-espresso-800 last:border-none hover:bg-cream-50/30 dark:hover:bg-espresso-950/10 transition-colors"
              >
                {/* Name & description */}
                <td className="p-4">
                  <div>
                    <p className="font-serif font-bold text-chocolate-950 dark:text-white">
                      {cat.name}
                    </p>
                    {cat.description && (
                      <p className="text-xs text-stone-450 line-clamp-1 max-w-[300px]">
                        {cat.description}
                      </p>
                    )}
                    <p className="text-[10px] text-stone-400 mt-1">
                      Created: {new Date(cat.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </td>

                {/* Item counts */}
                <td className="p-4 text-center font-bold text-[#b69234]">
                  {itemCounts[cat._id] || 0}
                </td>

                {/* Display Order */}
                <td className="p-4 text-center font-semibold">
                  {cat.displayOrder}
                </td>

                {/* Reorder buttons */}
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleMove(idx, "up")}
                      disabled={idx === 0}
                      className="px-2 py-1 rounded bg-cream-100 dark:bg-espresso-800 text-gold-500 hover:bg-gold-500 hover:text-white disabled:opacity-30 disabled:hover:bg-cream-100 disabled:hover:text-gold-500 transition-colors cursor-pointer text-xs"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMove(idx, "down")}
                      disabled={idx === categories.length - 1}
                      className="px-2 py-1 rounded bg-cream-100 dark:bg-espresso-800 text-gold-500 hover:bg-gold-500 hover:text-white disabled:opacity-30 disabled:hover:bg-cream-100 disabled:hover:text-gold-500 transition-colors cursor-pointer text-xs"
                      title="Move Down"
                    >
                      ▼
                    </button>
                  </div>
                </td>

                {/* Active Toggle */}
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer border ${
                      cat.active
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-red-500/10 text-red-650 border-red-500/20"
                    }`}
                  >
                    {cat.active ? "● Active" : "○ Hidden"}
                  </button>
                </td>

                {/* Actions */}
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onEdit(cat)}
                      className="text-xs font-bold uppercase tracking-wider text-gold-500 hover:text-gold-600 transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to delete category "${cat.name}"? WARNING: This will also delete all menu items in this category.`
                          )
                        ) {
                          onDelete(cat._id);
                        }
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
