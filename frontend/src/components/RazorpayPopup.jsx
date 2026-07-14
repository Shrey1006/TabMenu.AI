import { motion, AnimatePresence } from "framer-motion";

export default function RazorpayPopup({
  isOpen,
  onClose,
  amount,
  customerName,
  customerEmail,
  customerPhone,
  onSuccess,
  onFailure,
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#070b19]/90"
            onClick={onClose}
          />

          {/* Razorpay Frame Simulator */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-xl bg-white shadow-2xl text-stone-850 flex flex-col font-sans"
          >
            {/* Header */}
            <div className="bg-[#0f172a] text-white p-5 flex items-center justify-between border-b border-[#1e293b]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-[#2563eb] flex items-center justify-center font-bold text-base italic text-white shadow-inner">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide">Razorpay Checkout</h3>
                  <p className="text-[10px] text-stone-400">Test Mode (Demo Checkout)</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase text-stone-400 font-semibold tracking-wider">Amount to Pay</p>
                <p className="font-bold text-base text-[#38bdf8]">₹{amount}</p>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              
              {/* Order Info */}
              <div className="rounded-lg bg-stone-50 border border-stone-200/60 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Merchant</span>
                  <span className="font-semibold text-stone-800">Ambika Pure Veg (Jaipur)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Name</span>
                  <span className="font-semibold text-stone-800">{customerName || "Guest"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Email</span>
                  <span className="font-semibold text-stone-800">{customerEmail || "customer@example.com"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Phone</span>
                  <span className="font-semibold text-stone-800">{customerPhone || "+91 99999 99999"}</span>
                </div>
              </div>

              {/* Simulation Note */}
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-stone-600 uppercase tracking-widest">
                  Simulate Payment Outcome
                </p>
                <p className="text-[11px] text-stone-400">
                  Select one of the options below to test the ordering workflow integration.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => {
                    const paymentId = "pay_" + Math.random().toString(36).substring(2, 11).toUpperCase();
                    onSuccess(paymentId);
                  }}
                  className="w-full rounded-lg bg-green-600 hover:bg-green-700 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  🟢 Simulate Successful Payment
                </button>
                
                <button
                  onClick={() => {
                    onFailure("Payment rejected by issuer / Insufficient funds");
                  }}
                  className="w-full rounded-lg bg-red-600 hover:bg-red-700 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  🔴 Simulate Failed Payment
                </button>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-stone-50 p-4 text-center border-t border-stone-100 flex items-center justify-center gap-1.5 text-[9px] text-stone-400 font-semibold tracking-wider">
              🛡️ SECURE 256-BIT SSL ENCRYPTION · POWERED BY RAZORPAY
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
