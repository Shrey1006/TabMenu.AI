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

  // Verify OTP handler
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setErrorMsg("Please enter a valid 6-digit verification code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data } = await api.post("/otp/verify", { phone, otp: otpCode });
      setOtpToken(data.otpToken);
      setSuccessMsg("✓ Mobile number verified!");
      
      // Save profile details locally
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({ name, phone, email })
      );

      // Show success animation for 1.5s, then advance
      setTimeout(() => {
        if (mode === "order") {
          setStep("confirm");
        } else {
          setIsRzpOpen(true);
        }
      }, 1500);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
                  {step === "details" ? "🍳" : step === "otp" ? "🔑" : "📋"}
                </span>
                <h3 className="font-serif text-2xl font-bold tracking-wide mt-2">
                  {step === "details" && "Guest Information"}
                  {step === "otp" && "Mobile Verification"}
                  {step === "confirm" && "Order Summary"}
                </h3>
                <p className="text-xs uppercase tracking-wider text-gold-500 font-semibold mt-1">
                  {step === "details" && "Contact details for notification"}
                  {step === "otp" && "SMS OTP validation check"}
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
                      "Send Verification OTP"
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2: OTP Verification */}
              {step === "otp" && (
                <form onSubmit={handleVerifyOtp} className="space-y-4 text-sm text-center">
                  <p className="text-xs text-stone-500 dark:text-stone-300">
                    We sent a verification code to <span className="font-bold">{phone}</span>
                  </p>

                  {mockOtp && (
                    <div className="bg-gold-500/10 border border-gold-500/20 text-gold-600 rounded-xl p-3 text-xs inline-block mx-auto font-bold uppercase tracking-wider">
                      🔑 Demo Mode Code: {mockOtp}
                    </div>
                  )}

                  <div className="flex justify-center my-4">
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="Enter 6-digit OTP"
                      className="text-center tracking-widest text-lg font-bold w-48 rounded-xl border border-cream-200 dark:border-espresso-750 px-4 py-3.5 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 dark:text-stone-100"
                    />
                  </div>

                  <div className="text-xs text-stone-400">
                    {countdown > 0 ? (
                      <p>Code expires in <span className="text-gold-500 font-mono font-bold">{formatTime(countdown)}</span></p>
                    ) : (
                      <p className="text-red-500 font-bold">Code has expired.</p>
                    )}
                  </div>

                  <div className="flex gap-3 justify-center items-center mt-6">
                    <button
                      type="button"
                      onClick={() => setStep("details")}
                      className="rounded-xl border border-cream-300 dark:border-espresso-700 px-4 py-3 text-xs font-bold uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 hover:bg-cream-100 dark:hover:bg-espresso-800 transition-all cursor-pointer"
                    >
                      ← Edit Phone
                    </button>
                    <button
                      type="button"
                      disabled={countdown > 240 || resendAttempts >= 3}
                      onClick={handleSendOtp}
                      className="rounded-xl border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gold-500"
                    >
                      Resend Code {resendAttempts > 1 && `(${resendAttempts}/3)`}
                    </button>
                    <button
                      type="submit"
                      disabled={loading || countdown === 0}
                      className="rounded-xl bg-gold-500 hover:bg-gold-600 text-white font-bold px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                      ) : (
                        "Verify Code"
                      )}
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
