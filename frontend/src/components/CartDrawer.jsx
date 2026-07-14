import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  menu,
  onAdd,
  onRemove,
  onClear,
  onCheckout,
  tableNumber,
}) {
  const getCartItems = () => {
    return cart
      .map((entry) => {
        const item = menu.find((m) => m._id === entry.menuItemId);
        if (!item) return null;
        return { ...item, quantity: entry.quantity };
      })
      .filter(Boolean);
  };

  const cartItems = getCartItems();
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gstRate = 0.05; // 5% GST
  const serviceChargeRate = tableNumber ? 0.05 : 0; // 5% service charge for dine-in
  const deliveryCharge = tableNumber ? 0 : 40; // ₹40 for home delivery

  const gst = Math.round(subtotal * gstRate);
  const serviceCharge = Math.round(subtotal * serviceChargeRate);
  const grandTotal = subtotal + gst + serviceCharge + deliveryCharge;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />

          {/* Drawer Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed top-0 right-0 z-50 h-full w-full max-w-md bg-cream-50 dark:bg-espresso-950 shadow-2xl border-l border-cream-200 dark:border-espresso-800 flex flex-col text-chocolate-900 dark:text-espresso-50 transition-colors duration-150"
          >
            {/* Header */}
            <div className="p-6 border-b border-cream-200 dark:border-espresso-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛍️</span>
                <div>
                  <h2 className="font-serif text-xl font-bold">Your Basket</h2>
                  {tableNumber && (
                    <p className="text-xs uppercase tracking-wider text-gold-500 font-medium">
                      Table {tableNumber} Dine-In
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-stone-400 hover:text-chocolate-900 dark:hover:text-white text-xl cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                  <span className="text-5xl animate-bounce">🍲</span>
                  <p className="text-sm font-serif font-bold text-chocolate-850 dark:text-espresso-100">
                    Your basket is empty
                  </p>
                  <p className="text-xs text-stone-400 max-w-xs">
                    Browse our royal specialties and add savory vegetarian culinary creations to your order!
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    layout
                    key={item._id}
                    className="flex items-center gap-4 rounded-xl border border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900 p-3 shadow-xs"
                  >
                    <img
                      src={item.image || "/logo.png"}
                      alt={item.name}
                      className="h-16 w-16 rounded-lg object-cover bg-cream-50"
                    />
                    <div className="flex-1">
                      <h4 className="font-serif font-bold text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-[#b69234] font-semibold mt-0.5">₹{item.price}</p>
                      
                      {/* Quantity Toggles */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => onRemove(item)}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-cream-100 dark:bg-espresso-800 text-xs font-bold hover:bg-cream-200 dark:hover:bg-espresso-750 transition-colors cursor-pointer"
                        >
                          −
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => onAdd(item)}
                          className="flex h-6 w-6 items-center justify-center rounded-md bg-cream-100 dark:bg-espresso-800 text-xs font-bold hover:bg-cream-200 dark:hover:bg-espresso-750 transition-colors cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-sm text-chocolate-900 dark:text-white">
                      ₹{item.price * item.quantity}
                    </span>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900/60 space-y-4">
                <div className="flex justify-between text-xs font-bold text-stone-400 dark:text-espresso-100/50">
                  <button
                    onClick={onClear}
                    className="hover:text-red-500 transition-colors cursor-pointer"
                  >
                    🗑️ Clear Entire Basket
                  </button>
                  <span>{cartItems.length} Unique Dishes</span>
                </div>

                <div className="space-y-2 text-sm text-chocolate-850 dark:text-espresso-100 border-t border-dashed border-cream-200 dark:border-espresso-800 pt-4">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5%)</span>
                    <span>₹{gst}</span>
                  </div>
                  {tableNumber ? (
                    <div className="flex justify-between">
                      <span>Service Charge (5%)</span>
                      <span>₹{serviceCharge}</span>
                    </div>
                  ) : (
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span>₹{deliveryCharge}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-serif text-lg font-bold text-[#b69234] border-t border-cream-100 dark:border-espresso-800 pt-3">
                    <span>Grand Total</span>
                    <span>₹{grandTotal}</span>
                  </div>
                </div>

                <button
                  onClick={onCheckout}
                  className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer mt-2"
                >
                  Proceed to Checkout (₹{grandTotal})
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
