import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext";
import { SocketProvider, useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

function WaiterBoard() {
  const socket = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const [alerts, setAlerts] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadOrders = () =>
    api.get("/orders/active").then((r) => setOrders(r.data));

  useEffect(() => {
    loadOrders();
    if (!socket) return;
    socket.emit("join", { role: "waiter" });
    socket.on("waiter:alert", (alert) => {
      setAlerts((prev) => [{ ...alert, id: Date.now() }, ...prev].slice(0, 20));
    });
    socket.on("order:update", loadOrders);
    socket.on("order:new", loadOrders);
    return () => {
      socket.off("waiter:alert");
      socket.off("order:update");
      socket.off("order:new");
    };
  }, [socket]);

  const dismiss = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const markServed = async (orderId) => {
    await api.patch(`/orders/${orderId}/status`, { status: "served" });
    loadOrders();
  };

  const alertIcon = { dish_ready: "🍽️", service_request: "🔔", payment: "💳" };
  const alertColor = {
    dish_ready: "border-green-400 bg-green-50 dark:bg-green-950/20 dark:border-green-800",
    service_request: "border-warm-500 bg-warm-50 dark:bg-warm-950/20 dark:border-warm-800",
    payment: "border-blue-400 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800",
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-espresso-950 text-chocolate-900 dark:text-[#f7f3ec] transition-colors duration-150">
      <header className="border-b border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900/90 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-500/40 bg-white"
            />
            <div>
              <h1 className="font-serif text-lg font-bold text-chocolate-900 dark:text-white tracking-wide">Waiter Portal</h1>
              <p className="text-xs uppercase tracking-wider text-gold-500 font-medium">
                Real-time table alerts & dispatch
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider bg-cream-100 dark:bg-espresso-800 border border-cream-200 dark:border-espresso-700 text-chocolate-850 dark:text-espresso-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <Link to="/" className="rounded-lg border border-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-500 hover:bg-gold-500 hover:text-white transition-all cursor-pointer">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-6">
        <h2 className="mb-4 text-lg font-bold text-stone-800 dark:text-stone-100">Live Alerts</h2>
        <div className="space-y-3">
          {alerts.map((a) => (
            <div
              key={a.id}
              className={`flex items-center justify-between rounded-xl border-l-4 p-4 ${alertColor[a.type] || "bg-white dark:bg-stone-900 border dark:border-stone-850"}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{alertIcon[a.type] || "🔔"}</span>
                <div>
                  <p className="font-bold dark:text-stone-100">{a.message}</p>
                  <p className="text-xs text-stone-500 dark:text-stone-400 capitalize">
                    {a.type?.replace("_", " ")}
                  </p>
                </div>
              </div>
              <button
                onClick={() => dismiss(a.id)}
                className="text-sm text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-300"
              >
                Dismiss
              </button>
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="rounded-xl bg-white dark:bg-stone-900 p-6 text-center text-stone-400 dark:text-stone-500 border border-transparent dark:border-stone-850">
              No alerts — all tables serviced
            </p>
          )}
        </div>

        <h2 className="mb-4 mt-8 text-lg font-bold text-stone-800 dark:text-stone-100">
          Ready for Dispatch
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {orders
            .filter((o) => o.status === "ready")
            .map((order) => (
              <div
                key={order._id}
                className="rounded-xl border border-green-200 dark:border-green-900/60 bg-white dark:bg-stone-900 p-4"
              >
                <h3 className="font-bold dark:text-stone-100">Table {order.tableNumber}</h3>
                <ul className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                  {order.items?.map((i, idx) => (
                    <li key={idx}>
                      {i.quantity}x {i.name}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => markServed(order._id)}
                  className="mt-3 w-full rounded-lg bg-green-600 py-2 text-sm font-bold text-white"
                >
                  Mark Served
                </button>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default function Waiter() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== "waiter") {
    return <Navigate to="/login" replace />;
  }

  return (
    <SocketProvider role="waiter">
      <WaiterBoard />
    </SocketProvider>
  );
}
