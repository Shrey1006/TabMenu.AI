import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext";
import { SocketProvider, useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

const STATUS_FLOW = ["pending", "in_progress", "ready", "served"];

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
    const idx = STATUS_FLOW.indexOf(current);
    return STATUS_FLOW[idx + 1] || null;
  };

  const sorted = [...orders].sort((a, b) => {
    const priority = { pending: 0, in_progress: 1, ready: 2 };
    return (priority[a.status] ?? 3) - (priority[b.status] ?? 3);
  });

  return (
    <div className="min-h-screen bg-stone-900 text-white">
      <header className="border-b border-stone-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🍳</span>
            <div>
              <h1 className="text-xl font-bold">Kitchen Dashboard</h1>
              <p className="text-sm text-stone-400">
                Live order pipeline · Socket.io
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className={`rounded-full px-3 py-2 text-sm font-medium ${isDark ? "bg-stone-800 text-stone-100" : "bg-stone-100 text-stone-750"}`}
            >
              {isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
            <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">
              {orders.length} active
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((order) => {
          const next = nextStatus(order.status);
          const statusColors = {
            pending: "border-yellow-500",
            in_progress: "border-blue-500",
            ready: "border-green-500",
          };
          return (
            <div
              key={order._id}
              className={`rounded-xl border-l-4 bg-stone-800 p-4 ${statusColors[order.status] || "border-stone-600"}`}
            >
              <div className="flex justify-between">
                <h2 className="text-lg font-bold">Table {order.tableNumber}</h2>
                <span className="text-xs uppercase text-stone-400">
                  {order.status?.replace("_", " ")}
                </span>
              </div>
              <ul className="mt-3 space-y-1 text-sm">
                {order.items?.map((i, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>
                      {i.quantity}x {i.name}
                    </span>
                    <span className="text-stone-500">{i.notes || ""}</span>
                  </li>
                ))}
              </ul>
              {order.customerNotes && (
                <p className="mt-2 text-xs text-yellow-400">
                  Note: {order.customerNotes}
                </p>
              )}
              {next && (
                <button
                  onClick={() => updateStatus(order._id, next)}
                  className="mt-4 w-full rounded-lg bg-brand-600 py-2 text-sm font-bold hover:bg-brand-500"
                >
                  Mark {next.replace("_", " ")}
                </button>
              )}
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="col-span-full text-center text-stone-500">
            No active orders — waiting for tickets...
          </p>
        )}
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
