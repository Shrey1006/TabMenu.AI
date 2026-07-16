export default function AdminMenuTable({ menu, onEdit, onDelete, onToggleAvailability }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-cream-200 dark:border-espresso-750 bg-white dark:bg-espresso-900 shadow-sm text-chocolate-900 dark:text-espresso-50">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-cream-200 dark:border-espresso-800 bg-cream-50/50 dark:bg-espresso-950/45 text-chocolate-850 dark:text-espresso-100 font-serif">
            <th className="p-4 font-bold">Specialty Dish</th>
            <th className="p-4 font-bold">Category</th>
            <th className="p-4 font-bold">Price</th>
            <th className="p-4 font-bold">Attributes</th>
            <th className="p-4 font-bold">Status</th>
            <th className="p-4 font-bold text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {menu.length === 0 ? (
            <tr>
              <td colSpan="6" className="p-8 text-center text-stone-400">
                No specialty dishes loaded. Click "Add Food Specialty" to create one.
              </td>
            </tr>
          ) : (
            menu.map((item) => (
              <tr
                key={item._id}
                className="border-b border-cream-100 dark:border-espresso-800 last:border-none hover:bg-cream-50/30 dark:hover:bg-espresso-950/10 transition-colors"
              >
                {/* Name & description */}
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-10 w-10 rounded-lg object-cover bg-cream-50"
                      />
                    )}
                    <div>
                      <p className="font-serif font-bold text-chocolate-950 dark:text-white">
                        {item.name}
                      </p>
                      <p className="text-xs text-stone-450 line-clamp-1 max-w-[200px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="p-4 font-medium capitalize text-stone-500 dark:text-espresso-100">
                  {item.category?.name || "Uncategorized"}
                </td>

                <td className="p-4 font-bold text-[#b69234]">
                  ₹{item.price}
                </td>

                {/* Badges */}
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {item.veg && (
                      <span className="rounded bg-green-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-600 border border-green-500/20">
                        Veg
                      </span>
                    )}
                    {item.nonVeg && (
                      <span className="rounded bg-red-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-red-600 border border-red-500/20">
                        Non-Veg
                      </span>
                    )}
                    {item.jain && (
                      <span className="rounded bg-gold-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-gold-500 border border-gold-500/20">
                        Jain
                      </span>
                    )}
                    {item.bestseller && (
                      <span className="rounded bg-gradient-to-r from-gold-500 to-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Bestseller
                      </span>
                    )}
                  </div>
                </td>

                {/* Status Toggle Switch */}
                <td className="p-4">
                  <button
                    onClick={() => onToggleAvailability(item._id, item.available)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider cursor-pointer border ${
                      item.available
                        ? "bg-green-500/10 text-green-600 border-green-500/20"
                        : "bg-red-500/10 text-red-600 border-red-500/20"
                    }`}
                  >
                    {item.available ? "● Available" : "○ Sold Out"}
                  </button>
                </td>

                {/* Actions */}
                <td className="p-4">
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-xs font-bold uppercase tracking-wider text-gold-500 hover:text-gold-600 transition-colors cursor-pointer"
                      title="Edit Item"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                          onDelete(item._id);
                        }
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Item"
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
