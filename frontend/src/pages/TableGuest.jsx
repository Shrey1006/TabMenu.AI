import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import api from "../lib/api.js";
import { useTheme } from "../context/ThemeContext";

const initialForm = {
  name: "",
  phone: "",
};

const PROFILE_STORAGE_KEY = "customer-profile";

export default function TableGuest() {
  const { tableNumber: tableParam } = useParams();
  const [tableNumber, setTableNumber] = useState(() => {
    return /^\d+$/.test(tableParam) ? tableParam : "";
  });
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const [guest, setGuest] = useState(initialForm);
  const [profile, setProfile] = useState(null);
  const [step, setStep] = useState("guest");
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);
  const [message, setMessage] = useState("");
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    api
      .get("/menu")
      .then((res) => setMenu(res.data))
      .catch(() => setMenu([]));
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setGuest(parsed);
      setProfile(parsed);
    }
  }, []);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, entry) => {
      const item = menu.find((m) => m._id === entry.menuItemId);
      return sum + (item?.price || 0) * entry.quantity;
    }, 0);
  }, [cart, menu]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setGuest((prev) => ({ ...prev, [name]: value }));
  };

  const startSession = (event) => {
    event.preventDefault();
    if (!guest.name.trim() || !guest.phone.trim()) {
      setMessage("Please enter your name and phone number.");
      return;
    }
    const profileData = {
      name: guest.name.trim(),
      phone: guest.phone.trim(),
    };
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));
    setProfile(profileData);
    setMessage(`Logged in as ${profileData.name} (${profileData.phone}).`);
    setStep("menu");
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.menuItemId === item._id);
      if (existing) {
        return prev.map((entry) =>
          entry.menuItemId === item._id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }
      return [...prev, { menuItemId: item._id, quantity: 1, notes: "" }];
    });
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    setLoading(true);
    try {
      const token = localStorage.getItem(`table-token-${tableNumber}`) || null;
      const { data } = await api.post("/orders", {
        qrToken: token,
        items: cart,
        customerName: guest.name,
        customerPhone: guest.phone,
        customerNotes: `Guest: ${guest.name} • ${guest.phone}`,
      });
      setOrder(data);
      setCart([]);
      setMessage("Order placed successfully.");
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Unable to place your order right now.",
      );
    } finally {
      setLoading(false);
    }
  };

  const payBill = () => {
    if (!order || order.status === "paid") return;
    setShowPayment(true);
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    if (!order) return;

    setLoading(true);
    try {
      const { data } = await api.post(`/orders/${order._id}/pay`);
      if (data.checkoutUrl) {
        setShowPayment(false);
        setMessage("Redirecting you to a secure payment page...");
        window.location.assign(data.checkoutUrl);
        return;
      }

      setOrder(data);
      setShowPayment(false);
      setMessage("Payment received. Thank you!");
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Payment could not be completed.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem(`table-token-${tableNumber}`);
    if (token && profile) {
      setStep("menu");
    }
  }, [tableNumber, profile]);

  const connectTable = async () => {
    setLoading(true);
    try {
      let responseData;
      if (/^\d+$/.test(tableParam)) {
        const { data } = await api.get(`/tables/connect/${tableParam}`);
        responseData = data;
      } else {
        const { data } = await api.get(`/tables/verify/${tableParam}`);
        responseData = data;
      }
      setTableNumber(String(responseData.tableNumber));
      localStorage.setItem(`table-token-${responseData.tableNumber}`, responseData.token);
      setMessage("Table connected. Please continue with your mobile profile.");
      if (profile) {
        setStep("menu");
      } else {
        setStep("guest");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to connect this table.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tableParam) return;
    connectTable();
  }, [tableParam]);

  useEffect(() => {
    const paymentState = new URLSearchParams(location.search).get("payment");
    if (paymentState === "success") {
      setMessage("Payment completed. We are confirming your order now.");
    } else if (paymentState === "cancelled") {
      setMessage("Payment was cancelled. You can try again anytime.");
    }
  }, [location.search]);

  return (
    <div
      className={`min-h-screen transition-colors ${isDark ? "bg-stone-950 text-stone-100" : "bg-stone-50 text-stone-800"}`}
    >
      <header
        className={`border-b ${isDark ? "border-stone-800 bg-stone-900/90" : "border-stone-200 bg-white/90"}`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src={isDark ? "/logo-night.svg" : "/logo.png"}
              alt="Ambika logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-lg font-bold">Ambika Pure Veg</p>
              <p
                className={`text-sm ${isDark ? "text-stone-400" : "text-stone-500"}`}
              >
                Table {tableNumber}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`rounded-full px-3 py-2 text-sm font-medium ${isDark ? "bg-stone-800 text-stone-100" : "bg-stone-100 text-stone-700"}`}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <Link
              to="/"
              className={`text-sm font-medium ${isDark ? "text-stone-300" : "text-stone-600"}`}
            >
              Back Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
        <section
          className={`rounded-3xl border p-6 shadow-sm ${isDark ? "border-stone-800 bg-stone-900" : "border-stone-200 bg-white"}`}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
                Guest experience
              </p>
              <h1 className="mt-1 text-2xl font-bold">
                Scan, identify, order, and pay
              </h1>
            </div>
            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? "bg-stone-800 text-stone-200" : "bg-stone-100 text-stone-700"}`}
            >
              {step === "guest" ? "Step 1" : "Step 2"}
            </div>
          </div>

          {message && (
            <div
              className={`mb-4 rounded-xl border px-3 py-2 text-sm ${isDark ? "border-stone-700 bg-stone-800 text-stone-100" : "border-brand-200 bg-brand-50 text-brand-800"}`}
            >
              {message}
            </div>
          )}

          {step === "guest" ? (
            <form onSubmit={startSession} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Full name
                </label>
                <input
                  name="name"
                  value={guest.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${isDark ? "border-stone-700 bg-stone-800 text-stone-100" : "border-stone-200 bg-stone-50 text-stone-800"}`}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Phone number
                </label>
                <input
                  name="phone"
                  value={guest.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone"
                  className={`w-full rounded-xl border px-4 py-3 outline-none ${isDark ? "border-stone-700 bg-stone-800 text-stone-100" : "border-stone-200 bg-stone-50 text-stone-800"}`}
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white"
              >
                Login with mobile profile
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div
                className={`rounded-2xl border p-4 ${isDark ? "border-stone-800 bg-stone-800/70" : "border-stone-200 bg-stone-50"}`}
              >
                <div
                  className={`mb-4 rounded-2xl border px-4 py-4 ${isDark ? "border-stone-700 bg-stone-900" : "border-stone-100 bg-stone-50"}`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-500">
                    Customer Profile
                  </p>
                  <p className="mt-2 text-sm text-stone-600">
                    {profile?.name} · {profile?.phone}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.removeItem(PROFILE_STORAGE_KEY);
                      setProfile(null);
                      setGuest(initialForm);
                      setStep("guest");
                      setMessage("Profile cleared. Please login again.");
                    }}
                    className="mt-3 rounded-xl bg-stone-200 px-4 py-2 text-sm font-semibold text-stone-700"
                  >
                    Change mobile profile
                  </button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {menu.map((item) => (
                    <div
                      key={item._id}
                      className={`rounded-2xl border p-4 ${isDark ? "border-stone-800 bg-stone-800/70" : "border-stone-200 bg-stone-50"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          <p
                            className={`mt-1 text-sm ${isDark ? "text-stone-400" : "text-stone-500"}`}
                          >
                            {item.description}
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-brand-500">
                          ₹{item.price}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(item)}
                        className="mt-3 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
                      >
                        Add to cart
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <aside
          className={`rounded-3xl border p-6 shadow-sm ${isDark ? "border-stone-800 bg-stone-900" : "border-stone-200 bg-white"}`}
        >
          <h2 className="text-xl font-bold">Your order</h2>
          <p
            className={`mt-2 text-sm ${isDark ? "text-stone-400" : "text-stone-500"}`}
          >
            Guest details are stored with your order for service and payment.
          </p>

          {cart.length === 0 ? (
            <div
              className={`mt-6 rounded-2xl border border-dashed p-6 text-sm ${isDark ? "border-stone-700 text-stone-400" : "border-stone-300 text-stone-500"}`}
            >
              Your selected dishes will appear here.
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {cart.map((entry) => {
                const item = menu.find((m) => m._id === entry.menuItemId);
                return (
                  <div
                    key={entry.menuItemId}
                    className={`flex items-center justify-between rounded-xl border px-3 py-3 ${isDark ? "border-stone-800 bg-stone-800/70" : "border-stone-200 bg-stone-50"}`}
                  >
                    <div>
                      <p className="font-semibold">{item?.name || "Item"}</p>
                      <p
                        className={`text-sm ${isDark ? "text-stone-400" : "text-stone-500"}`}
                      >
                        Qty {entry.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-brand-500">
                      ₹{(item?.price || 0) * entry.quantity}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-4 dark:border-brand-800 dark:bg-brand-950/40">
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              Estimated total
            </p>
            <p className="mt-1 text-3xl font-bold">₹{cartTotal}</p>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              onClick={placeOrder}
              disabled={loading || cart.length === 0}
              className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Placing order..." : "Place order"}
            </button>
            {order && (
              <button
                onClick={payBill}
                disabled={loading}
                className="rounded-xl border border-brand-500 px-4 py-3 font-semibold text-brand-600 dark:text-brand-300"
              >
                {order.status === "paid" ? "Paid" : "Pay now"}
              </button>
            )}
            {showPayment && (
              <form
                onSubmit={submitPayment}
                className={`rounded-2xl border p-4 ${isDark ? "border-stone-800 bg-stone-800/70" : "border-stone-200 bg-stone-50"}`}
              >
                <p className="text-sm font-semibold">Secure checkout</p>
                <p
                  className={`mt-2 text-sm ${isDark ? "text-stone-400" : "text-stone-500"}`}
                >
                  You will be redirected to Stripe Checkout to complete payment
                  safely.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white disabled:opacity-50"
                  >
                    {loading ? "Preparing..." : "Continue to secure payment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPayment(false)}
                    className="rounded-lg border border-stone-300 px-4 py-2 font-semibold text-stone-600 dark:border-stone-700 dark:text-stone-300"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </aside>
      </main>
    </div>
  );
}
