import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext";
import { SocketProvider, useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

const STATUS_FLOW = ["sent_to_kitchen", "preparing", "ready_to_serve", "served"];

function KitchenBoard() {
  const socket = useSocket();
  const { isDark, toggleTheme } = useTheme();
  const [orders, setOrders] = useState([]);

  const load = () => api.get("/orders/active").then((r) => setOrders(r.data));

  useEffect(() => {
    load();
    if (!socket) return;
    socket.emit("join", { role: "kitchen" });
    socket.on("order:new", load);
    socket.on("order:update", load);
    return () => {
      socket.off("order:new");
      socket.off("order:update");
    };
  }, [socket]);

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    load();
  };

  const nextStatus = (current) => {
    // Map legacy status if present
    let normalized = current;
    if (current === "pending") normalized = "sent_to_kitchen";
    if (current === "in_progress") normalized = "preparing";
    if (current === "ready") normalized = "ready_to_serve";

    const idx = STATUS_FLOW.indexOf(normalized);
    return STATUS_FLOW[idx + 1] || null;
  };

  const orderedOrders = orders.filter(o => 
    ["sent_to_kitchen", "pending", "preparing", "in_progress"].includes(o.status)
  );
  
  const servedOrders = orders.filter(o => 
    ["ready_to_serve", "ready", "served"].includes(o.status)
  );

  const sortedOrdered = [...orderedOrders].sort((a, b) => {
    const priority = { 
      sent_to_kitchen: 0, 
      pending: 0,
      preparing: 1, 
      in_progress: 1 
    };
    return (priority[a.status] ?? 2) - (priority[b.status] ?? 2);
  });

  const sortedServed = [...servedOrders].sort((a, b) => {
    const isReadyA = ["ready_to_serve", "ready"].includes(a.status);
    const isReadyB = ["ready_to_serve", "ready"].includes(b.status);
    if (isReadyA && !isReadyB) return -1;
    if (!isReadyA && isReadyB) return 1;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  const renderOrderCard = (order) => {
    const next = nextStatus(order.status);
    const statusColors = {
      sent_to_kitchen: "border-yellow-500",
      pending: "border-yellow-500",
      preparing: "border-orange-500",
      in_progress: "border-orange-500",
      ready_to_serve: "border-green-500",
      ready: "border-green-500",
      served: "border-stone-500",
    };
    const statusLabels = {
      sent_to_kitchen: "Accepted",
      pending: "Accepted",
      preparing: "Cooking",
      in_progress: "Cooking",
      ready_to_serve: "Ready",
      ready: "Ready",
      served: "Served",
    };
    const buttonLabels = {
      preparing: "Start Cooking",
      ready_to_serve: "Mark Ready",
      served: "Mark Served"
    };
    
    return (
      <div
        key={order._id}
        className={`rounded-2xl border-l-4 p-5 bg-white dark:bg-espresso-900 text-chocolate-900 dark:text-espresso-50 border-y border-r border-cream-200 dark:border-espresso-750 shadow-sm ${statusColors[order.status] || "border-stone-600"}`}
      >
        <div className="flex justify-between items-center border-b border-cream-100 dark:border-espresso-800 pb-2">
          <h2 className="font-serif text-base font-bold">Table {order.tableNumber}</h2>
          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
            ["sent_to_kitchen", "pending"].includes(order.status) ? "bg-yellow-500/10 text-yellow-600" :
            ["preparing", "in_progress"].includes(order.status) ? "bg-orange-500/10 text-orange-600" :
            ["ready_to_serve", "ready"].includes(order.status) ? "bg-green-500/10 text-green-600" :
            "bg-stone-500/10 text-stone-650"
          }`}>
            {statusLabels[order.status] || order.status?.replace("_", " ")}
          </span>
        </div>
        <ul className="mt-3 space-y-2 text-xs">
          {order.items?.map((i, idx) => (
            <li key={idx} className="flex justify-between">
              <span className="font-semibold text-chocolate-850 dark:text-espresso-100">
                {i.quantity}x {i.name}
              </span>
              <span className="text-gold-600 italic font-medium">{i.notes || ""}</span>
            </li>
          ))}
        </ul>
        {order.customerNotes && (
          <p className="mt-3 text-[11px] text-gold-600 bg-gold-500/5 p-2 rounded-lg border border-gold-500/10">
            Note: {order.customerNotes}
          </p>
        )}
        {order.waiterNotes && (
          <p className="mt-2 text-[11px] text-blue-600 bg-blue-550/5 p-2 rounded-lg border border-blue-500/10">
            Waiter Notes: {order.waiterNotes}
          </p>
        )}
        {next && (
          <button
            onClick={() => updateStatus(order._id, next)}
            className="mt-5 w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-xs cursor-pointer"
          >
            {buttonLabels[next] || `Mark ${next.replace("_", " ")}`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-espresso-950 text-espresso-50 transition-colors duration-150">
      <header className="border-b border-espresso-800 bg-espresso-900/90 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-500/40 bg-white"
            />
            <div>
              <h1 className="font-serif text-lg font-bold tracking-wide text-white">Kitchen Dashboard</h1>
              <p className="text-xs uppercase tracking-wider text-gold-400 font-medium">
                Live order pipeline · Socket.io
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider bg-espresso-800 border border-espresso-700 text-espresso-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <span className="rounded-full bg-gold-500/20 px-3 py-1 text-xs font-bold text-gold-400 border border-gold-500/30">
              {orders.length} active
            </span>
            <Link to="/" className="rounded-lg border border-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-500 hover:bg-gold-500 hover:text-white transition-all cursor-pointer">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <div className="grid gap-8 p-6 lg:grid-cols-2">
        {/* Ordered / Cooking Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-espresso-800 pb-3">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span>🍳</span> Ordered & Cooking
            </h2>
            <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-500/30">
              {sortedOrdered.length} tickets
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {sortedOrdered.map((order) => renderOrderCard(order))}
            {sortedOrdered.length === 0 && (
              <p className="col-span-full text-center text-sm font-serif font-bold text-stone-400 py-12">
                No orders cooking.
              </p>
            )}
          </div>
        </div>

        {/* Ready / Served Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-espresso-800 pb-3">
            <h2 className="font-serif text-lg font-bold text-white flex items-center gap-2">
              <span>🍽️</span> Ready & Served
            </h2>
            <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              {sortedServed.length} tickets
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
            {sortedServed.map((order) => renderOrderCard(order))}
            {sortedServed.length === 0 && (
              <p className="col-span-full text-center text-sm font-serif font-bold text-stone-400 py-12">
                No ready or served orders.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Kitchen() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== "kitchen") {
    return <Navigate to="/login" replace />;
  }

  return (
    <SocketProvider role="kitchen">
      <KitchenBoard />
    </SocketProvider>
  );
}
