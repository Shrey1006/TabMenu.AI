import { motion } from "framer-motion";

export default function PaymentSuccess({ order, onClose }) {
  const { _id, tableNumber, items, totalAmount, status, prepStartedAt } = order;

  // Aggregate preparation time
  const prepTime = items?.reduce((max, item) => {
    // If menuItem details aren't populated, default to 15
    const itemPrep = item.menuItem?.prepTimeMinutes || 15;
    return itemPrep > max ? itemPrep : max;
  }, 15) || 15;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-xl mx-auto rounded-3xl border border-cream-200 dark:border-espresso-750 bg-white dark:bg-espresso-900 p-8 sm:p-10 shadow-2xl text-chocolate-900 dark:text-espresso-50 text-center space-y-6 transition-colors duration-150"
    >
      {/* Success Animated Mark */}
      <div className="flex justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="h-20 w-20 rounded-full bg-green-500/10 text-green-600 border-2 border-green-500 flex items-center justify-center text-4xl shadow-md"
        >
          ✓
        </motion.div>
      </div>

      <div className="space-y-2">
        <h2 className="font-serif text-3xl font-bold tracking-wide">Order Confirmed</h2>
        <p className="text-xs uppercase tracking-widest text-[#b69234] font-semibold">
          Thank you for dining with Ambika
        </p>
        <div className="h-[2px] w-12 bg-gold-500 mx-auto mt-2" />
      </div>

      <p className="text-sm text-stone-500 dark:text-espresso-100/75 leading-relaxed max-w-md mx-auto">
        Your payment has been successfully processed through Razorpay. Your order is dispatched directly to our heritage kitchen and clay oven tandoors!
      </p>

      {/* Order Summary Details Card */}
      <div className="rounded-2xl border border-cream-200 dark:border-espresso-800 bg-cream-50 dark:bg-espresso-950 p-6 space-y-4 text-left text-sm">
        <div className="flex justify-between border-b border-cream-100 dark:border-espresso-800 pb-3 text-xs uppercase tracking-wider text-stone-400 font-semibold">
          <span>Order Reference</span>
          <span className="font-bold text-chocolate-900 dark:text-white break-all">
            #{_id?.substring(18, 24).toUpperCase() || "AMB-ORDER"}
          </span>
        </div>

        {/* Ordered items list */}
        <div className="space-y-2.5 max-h-40 overflow-y-auto pr-2">
          {items?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs">
              <span className="text-[#70554b] dark:text-espresso-100">
                {item.quantity}x {item.name}
              </span>
              <span className="font-bold text-chocolate-900 dark:text-white">
                ₹{item.price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-cream-100 dark:border-espresso-800 pt-3 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-stone-400">Table Number</span>
            <span className="font-bold text-chocolate-900 dark:text-white">Table {tableNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Payment Status</span>
            <span className="rounded-full bg-green-500/10 px-2 py-0.5 font-bold text-green-600 border border-green-500/20">
              Paid via Razorpay
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-400">Est. Preparation Time</span>
            <span className="font-bold text-[#b69234]">⏱️ ~{prepTime} minutes</span>
          </div>
          <div className="flex justify-between border-t border-cream-100 dark:border-espresso-800 pt-3 text-sm font-bold">
            <span className="text-gold-500">Total Paid</span>
            <span className="text-[#b69234]">₹{totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <button
        onClick={onClose}
        className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        Continue Browsing specialties
      </button>
    </motion.div>
  );
}
