import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RazorpayPopup from "./RazorpayPopup";

const PROFILE_STORAGE_KEY = "customer-profile";

export default function CheckoutModal({
  isOpen,
  onClose,
  amount,
  mode = "payment", // "order" | "payment"
  onConfirmOrder,   // callback for mode === "order"
  onPaymentSuccess, // callback for mode === "payment"
  onPaymentFailure, // callback for mode === "payment"
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isRzpOpen, setIsRzpOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setName(parsed.name || "");
      setPhone(parsed.phone || "");
      setEmail(parsed.email || "");
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !phone || !email) return;

    // Save profile details locally
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ name, phone, email })
    );

    if (mode === "order") {
      onConfirmOrder({ name, phone, email });
    } else {
      // Open Razorpay Popup for payment
      setIsRzpOpen(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isRzpOpen && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-cream-200 dark:border-espresso-750 bg-cream-50 dark:bg-espresso-900 p-8 shadow-2xl text-chocolate-900 dark:text-espresso-50 transition-colors duration-150"
            >
              <div className="text-center mb-6">
                <span className="text-3xl">{mode === "order" ? "🍳" : "🛎️"}</span>
                <h3 className="font-serif text-2xl font-bold tracking-wide mt-2">
                  {mode === "order" ? "Confirm Dining Order" : "Dine-in Bill Payment"}
                </h3>
                <p className="text-xs uppercase tracking-wider text-gold-500 font-semibold mt-1">
                  {mode === "order" ? "Send details to kitchen" : "Settle table account"}
                </p>
                <div className="h-[2px] w-12 bg-gold-500 mx-auto mt-2" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-sm">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 mb-1.5 font-medium">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 px-4 py-3 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 mb-1.5 font-medium">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter 10-digit mobile number"
                    className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 px-4 py-3 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 mb-1.5 font-medium">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-4 py-3 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 dark:text-stone-100"
                  />
                </div>

                <div className="bg-white dark:bg-espresso-950 rounded-xl p-4 border border-cream-200 dark:border-espresso-750 flex items-center justify-between mt-6">
                  <div>
                    <p className="text-xs text-stone-400">
                      {mode === "order" ? "Estimated Total" : "Total Payable"}
                    </p>
                    <p className="font-serif text-lg font-bold text-gold-500">₹{amount}</p>
                  </div>
                  <button
                    type="submit"
                    className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md cursor-pointer"
                  >
                    {mode === "order" ? "Confirm Order" : "Pay with Razorpay"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Simulated Razorpay Overlay */}
      {mode === "payment" && (
        <RazorpayPopup
          isOpen={isRzpOpen}
          onClose={() => setIsRzpOpen(false)}
          amount={amount}
          customerName={name}
          customerEmail={email}
          customerPhone={phone}
          onSuccess={(paymentId) => {
            setIsRzpOpen(false);
            onPaymentSuccess(paymentId, { name, phone, email });
          }}
          onFailure={(errorMsg) => {
            setIsRzpOpen(false);
            onPaymentFailure(errorMsg);
          }}
        />
      )}
    </>
  );
}
