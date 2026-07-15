import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import RazorpayPopup from "./RazorpayPopup";
import api from "../lib/api.js";

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
  const [step, setStep] = useState("details"); // "details" | "otp" | "confirm"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  // OTP Verification states
  const [otpCode, setOtpCode] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [mockOtp, setMockOtp] = useState(""); // For easy testing in dev
  const [isRzpOpen, setIsRzpOpen] = useState(false);
  
  // Robot check verification states
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [verifyingRobot, setVerifyingRobot] = useState(false);
  
  const timerRef = useRef(null);

  // Load profile on modal open
  useEffect(() => {
    if (isOpen) {
      setStep("details");
      setOtpCode("");
      setOtpToken("");
      setCountdown(0);
      setErrorMsg("");
      setSuccessMsg("");
      setMockOtp("");
      setIsRobotChecked(false);
      setVerifyingRobot(false);
      
      const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setName(parsed.name || "");
        setPhone(parsed.phone || "");
        setEmail(parsed.email || "");
      }
    }
  }, [isOpen]);

  // Countdown timer effect
  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0 && timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  // Format timer (MM:SS)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Send OTP handler
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!phone) {
      setErrorMsg("Mobile number is required.");
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data } = await api.post("/otp/send", { phone });
      setResendAttempts((prev) => prev + 1);
      setCountdown(300); // 5 minutes
      setStep("otp");
      
      if (data.mockOtp) {
        setMockOtp(data.mockOtp);
      }
      setSuccessMsg("Verification code sent successfully.");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Verify Robot check handler
  const handleRobotVerify = async () => {
    if (isRobotChecked || verifyingRobot) return;

    setVerifyingRobot(true);
    setErrorMsg("");
    setSuccessMsg("");

    // Simulate verification delay (1.2 seconds)
    setTimeout(async () => {
      try {
        const { data } = await api.post("/otp/verify", { phone, otp: "not human" });
        setOtpToken(data.otpToken);
        setSuccessMsg("✓ Verification successful!");
        setIsRobotChecked(true);
        setVerifyingRobot(false);

        // Save profile details locally
        localStorage.setItem(
          PROFILE_STORAGE_KEY,
          JSON.stringify({ name, phone, email })
        );

        // Advance to next step after short delay
        setTimeout(() => {
          if (mode === "order") {
            setStep("confirm");
          } else {
            setIsRzpOpen(true);
          }
        }, 1200);

      } catch (err) {
        setErrorMsg(err.response?.data?.message || "Verification failed. Please try again.");
        setVerifyingRobot(false);
      }
    }, 1200);
  };

  // Final Order confirmation
  const handleOrderSubmit = () => {
    if (!phone || !otpToken) return;
    onConfirmOrder({ name: name || "Guest", phone, email, otpToken });
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
              {/* Progress Steps Header */}
              <div className="flex justify-between items-center mb-6 px-4">
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === "details" ? "bg-gold-500 text-white" : "bg-gold-500/20 text-gold-500"
                  }`}>
                    1
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase mt-1">Details</span>
                </div>
                <div className="h-[2px] flex-1 bg-cream-200 dark:bg-espresso-800 mx-2 -mt-4" />
                <div className="flex flex-col items-center">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === "otp" ? "bg-gold-500 text-white" : otpToken ? "bg-gold-500/20 text-gold-500" : "bg-cream-200 dark:bg-espresso-800 text-stone-400"
                  }`}>
                    2
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase mt-1">Verify</span>
                </div>
                {mode === "order" && (
                  <>
                    <div className="h-[2px] flex-1 bg-cream-200 dark:bg-espresso-800 mx-2 -mt-4" />
                    <div className="flex flex-col items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        step === "confirm" ? "bg-gold-500 text-white" : "bg-cream-200 dark:bg-espresso-800 text-stone-400"
                      }`}>
                        3
                      </div>
                      <span className="text-[10px] font-semibold tracking-wider uppercase mt-1">Order</span>
                    </div>
                  </>
                )}
              </div>

              {/* Title Header */}
              <div className="text-center mb-6">
                <span className="text-3xl">
                  {step === "details" ? "🍳" : step === "otp" ? "👤" : "📋"}
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-wide mt-2">
                  {step === "details" && "Guest Information"}
                  {step === "otp" && "Human Verification"}
                  {step === "confirm" && "Order Summary"}
                </h3>
                <p className="text-xs uppercase tracking-wider text-gold-500 font-semibold mt-1">
                  {step === "details" && "Contact details for notification"}
                  {step === "otp" && "Verify that you are human"}
                  {step === "confirm" && "Verify items and submit"}
                </p>
                <div className="h-[2px] w-12 bg-gold-500 mx-auto mt-2" />
              </div>

              {errorMsg && (
                <div className="mb-4 text-center text-xs text-red-500 bg-red-500/10 border border-red-500/20 py-2 rounded-xl">
                  ⚠️ {errorMsg}
                </div>
              )}

              {successMsg && (
                <div className="mb-4 text-center text-xs text-green-600 bg-green-500/10 border border-green-500/20 py-2 rounded-xl font-medium">
                  {successMsg}
                </div>
              )}

              {/* STEP 1: Details */}
              {step === "details" && (
                <form onSubmit={handleSendOtp} className="space-y-4 text-sm">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 mb-1.5 font-medium">
                      Full Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 px-4 py-3 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 mb-1.5 font-medium">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      pattern="\d{10}"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 px-4 py-3 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 dark:text-stone-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 mb-1.5 font-medium">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 px-4 py-3 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 dark:text-stone-100"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Verify & Continue"
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: Robot Verification Checkbox */}
              {step === "otp" && (
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-sm text-center">
                  <p className="text-xs text-stone-500 dark:text-stone-300">
                    To complete checkout, please check the box below:
                  </p>

                  <div className="flex items-center justify-between bg-white dark:bg-espresso-955 border border-cream-200 dark:border-espresso-750 p-4 rounded-xl shadow-xs max-w-sm mx-auto my-6 transition-colors">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleRobotVerify}
                        disabled={isRobotChecked || verifyingRobot}
                        className={`h-7 w-7 rounded-lg border flex items-center justify-center cursor-pointer transition-all duration-150 outline-none ${
                          isRobotChecked
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-stone-300 dark:border-espresso-700 bg-cream-50 dark:bg-espresso-900 hover:border-gold-500"
                        }`}
                      >
                        {verifyingRobot && (
                          <span className="h-4 w-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                        )}
                        {isRobotChecked && (
                          <svg className="h-4.5 w-4.5 stroke-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <span className="text-sm font-semibold text-chocolate-850 dark:text-espresso-100 select-none">
                        I'm not a robot
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center opacity-70">
                      <svg className="h-6 w-6 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span className="text-[8px] uppercase tracking-wider text-stone-400 font-bold mt-1">Verify</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-center items-center mt-6">
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="rounded-xl border border-cream-300 dark:border-espresso-700 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 hover:bg-cream-100 dark:hover:bg-espresso-800 transition-all cursor-pointer"
                    >
                      ← Back
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Confirm Details & Checkout Summary */}
              {step === "confirm" && (
                <div className="space-y-4 text-sm text-center">
                  <div className="bg-white dark:bg-espresso-950 rounded-2xl border border-cream-200 dark:border-espresso-750 p-5 text-left space-y-3">
                    <h4 className="font-serif text-sm font-bold border-b border-cream-100 dark:border-espresso-800 pb-2">Seated Guest Details</h4>
                    <p className="text-xs text-stone-500 dark:text-espresso-100">
                      Name: <span className="font-bold text-chocolate-900 dark:text-white">{name}</span>
                    </p>
                    <p className="text-xs text-stone-500 dark:text-espresso-100">
                      Phone: <span className="font-bold text-chocolate-900 dark:text-white">{phone}</span>
                    </p>
                    <p className="text-xs text-stone-500 dark:text-espresso-100">
                      Status: <span className="font-bold text-green-600">✓ OTP Mobile Verified</span>
                    </p>
                  </div>

                  <div className="bg-white dark:bg-espresso-950 rounded-2xl border border-cream-200 dark:border-espresso-750 p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-stone-400">Total Order Amount</p>
                      <p className="font-serif text-2xl font-bold text-gold-500">₹{amount}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setStep("otp")}
                        className="rounded-xl border border-cream-300 dark:border-espresso-700 px-4 py-3 text-xs font-bold uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 hover:bg-cream-100 dark:hover:bg-espresso-800 transition-all cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleOrderSubmit}
                        className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md cursor-pointer"
                      >
                        Confirm Order
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
