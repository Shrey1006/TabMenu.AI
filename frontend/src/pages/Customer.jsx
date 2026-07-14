import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";
import { SocketProvider, useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

function CustomerApp({ qrToken, tableNumber }) {
  const socket = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/menu").then((r) => setMenu(r.data));
  }, []);

  useEffect(() => {
    if (!socket || !tableNumber) return;
    socket.emit("join", { table: String(tableNumber) });
    socket.on(`table:${tableNumber}:order`, setOrder);
    socket.on("order:update", (o) => {
      if (o.tableNumber === tableNumber) setOrder(o);
    });
    return () => {
      socket.off(`table:${tableNumber}:order`);
      socket.off("order:update");
    };
  }, [socket, tableNumber]);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c,
        );
      }
      return [...prev, { menuItemId: item._id, quantity: 1, notes: "" }];
    });
  };

  const placeOrder = async () => {
    if (!cart.length) return;
    setLoading(true);
    try {
      const { data } = await api.post("/orders", { qrToken, items: cart });
      setOrder(data);
      setCart([]);
    } catch (err) {
      alert(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  const callWaiter = async () => {
    if (!order) return;
    await api.post(`/orders/${order._id}/call-waiter`);
    alert("Waiter has been notified!");
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) return;
    await api.post("/feedback", {
      qrToken,
      text: feedback,
      orderId: order?._id,
    });
    setFeedbackSent(true);
    setFeedback("");
  };

  const filtered = menu.filter((m) => {
    if (filter === "all") return true;
    return m.dietary?.includes(filter);
  });

  const cartTotal = cart.reduce((sum, c) => {
    const item = menu.find((m) => m._id === c.menuItemId);
    return sum + (item?.price || 0) * c.quantity;
  }, 0);

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    in_progress: "bg-blue-100 text-blue-800",
    ready: "bg-green-100 text-green-800",
    served: "bg-stone-100 text-stone-800",
    paid: "bg-brand-100 text-brand-800",
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 transition-colors duration-150">
      <header className="border-b border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 px-4 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full"
            />
            <div>
              <h1 className="font-bold text-brand-800 dark:text-brand-400">Ambika Pure Veg</h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">Table {tableNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`rounded-full px-3 py-2 text-sm font-medium ${isDark ? "bg-stone-800 text-stone-100" : "bg-stone-100 text-stone-700"}`}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <Link to="/" className="text-sm text-stone-500 dark:text-stone-450 hover:text-brand-700 dark:hover:text-brand-400">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {order && (
          <div className="mb-6 rounded-xl border border-brand-200 dark:border-brand-900/60 bg-white dark:bg-stone-900 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold dark:text-stone-100">Your Order</h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[order.status] || ""}`}
              >
                {order.status?.replace("_", " ")}
              </span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-stone-600 dark:text-stone-300">
              {order.items?.map((i, idx) => (
                <li key={idx}>
                  {i.quantity}x {i.name} — ₹{i.price * i.quantity}
                </li>
              ))}
            </ul>
            <p className="mt-2 font-bold dark:text-stone-100">Total: ₹{order.totalAmount}</p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={callWaiter}
                className="rounded-lg bg-warm-500 px-4 py-2 text-sm font-semibold text-white"
              >
                Call Waiter
              </button>
              {order.status === "served" && (
                <button
                  onClick={() => api.post(`/orders/${order._id}/pay`)}
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Pay Bill
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {["all", "jain", "vegan", "gluten-free", "spicy"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${filter === f ? "bg-brand-600 text-white" : "bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border dark:border-stone-800"}`}
            >
              {f === "all" ? "All Items" : f}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((item) => (
            <div key={item._id} className="rounded-xl border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 p-4">
              <div className="flex justify-between">
                <h3 className="font-bold dark:text-stone-100">{item.name}</h3>
                <span className="font-semibold text-brand-700 dark:text-brand-400">
                  ₹{item.price}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">{item.description}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-stone-400 dark:text-stone-450">
                  {item.prepTimeMinutes} min · {item.category}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="rounded-lg bg-brand-600 px-3 py-1 text-xs font-semibold text-white"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 border-t border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 p-4 shadow-lg">
            <div className="mx-auto flex max-w-4xl items-center justify-between">
              <div>
                <p className="font-bold">
                  {cart.reduce((s, c) => s + c.quantity, 0)} items · ₹
                  {cartTotal}
                </p>
              </div>
              <button
                onClick={placeOrder}
                disabled={loading}
                className="rounded-xl bg-brand-600 px-6 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? "Placing..." : "Place Order"}
              </button>
            </div>
          </div>
        )}

        {order && (
          <div className="mt-8 rounded-xl border border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-900 p-4">
            <h3 className="font-bold dark:text-stone-100">Leave Feedback</h3>
            {feedbackSent ? (
              <p className="mt-2 text-sm text-brand-600 dark:text-brand-400">
                Thank you! Your feedback has been analyzed by our AI engine.
              </p>
            ) : (
              <>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="How was your dining experience?"
                  className="mt-2 w-full rounded-lg border border-stone-200 dark:border-stone-800 p-3 text-sm bg-white dark:bg-stone-850 dark:text-stone-100"
                  rows={3}
                />
                <button
                  onClick={submitFeedback}
                  className="mt-2 rounded-lg bg-stone-800 px-4 py-2 text-sm font-semibold text-white"
                >
                  Submit Feedback
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Customer() {
  const { isDark, toggleTheme } = useTheme();
  const [tableNumber, setTableNumber] = useState(null);
  const [qrToken, setQrToken] = useState(null);
  const [tableInput, setTableInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scanTable = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tables/connect/${tableInput}`);
      setQrToken(data.token);
      setTableNumber(data.tableNumber);
    } catch {
      alert(
        "Could not connect to table. Ensure the table exists and backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!qrToken) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-brand-50 dark:bg-stone-950 px-4 relative transition-colors duration-150">
        <button
          onClick={toggleTheme}
          className={`absolute top-4 right-4 rounded-full px-3 py-2 text-sm font-medium ${isDark ? "bg-stone-800 text-stone-100" : "bg-stone-100 text-stone-700"}`}
        >
          {isDark ? "☀️ Light" : "🌙 Dark"}
        </button>
        <img
          src="/logo.png"
          alt="Logo"
          className="h-20 w-20 rounded-full shadow-lg"
        />
        <h1 className="mt-6 text-2xl font-bold dark:text-stone-100">Connect to Your Table</h1>
        <p className="mt-2 text-center text-stone-600 dark:text-stone-400">
          Enter the table number from the QR code generated by your restaurant.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <input
            type="number"
            min="1"
            value={tableInput}
            onChange={(e) => setTableInput(e.target.value)}
            placeholder="Enter table number"
            className="rounded-lg border border-stone-200 dark:border-stone-850 px-4 py-3 bg-white dark:bg-stone-900 dark:text-stone-100"
          />
          <button
            onClick={scanTable}
            disabled={loading || !tableInput}
            className="rounded-lg bg-brand-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Connecting..." : "Connect Table"}
          </button>
        </div>
        <Link
          to="/"
          className="mt-6 text-sm text-stone-500 dark:text-stone-450 hover:text-brand-700 dark:hover:text-brand-400"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  return (
    <SocketProvider table={String(tableNumber)}>
      <CustomerApp qrToken={qrToken} tableNumber={tableNumber} />
    </SocketProvider>
  );
}
