import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext";
import { SocketProvider, useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

function WaiterBoard() {
  const socket = useSocket();
  const { isDark, toggleTheme } = useTheme();
  
  // Lists
  const [orders, setOrders] = useState([]);
  const [waiterRequests, setWaiterRequests] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  
  // Active Modals / Actions
  const [editingOrder, setEditingOrder] = useState(null); // Order object being edited
  const [cancellingOrder, setCancellingOrder] = useState(null); // Order object being cancelled
  const [cancelReason, setCancelReason] = useState("");
  const [selectedNewItem, setSelectedNewItem] = useState("");
  const [selectedNewItemQty, setSelectedNewItemQty] = useState(1);
  const [editingWaiterNotes, setEditingWaiterNotes] = useState("");
  
  // Filter tabs
  const [activeTab, setActiveTab] = useState("active_board"); // "active_board" | "cancelled"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "waiting_for_waiter" | "waiter_reviewing" | "sent_to_kitchen" | "ready_to_serve" | "served"
  const [searchQuery, setSearchQuery] = useState("");
  const [toastMsg, setToastMsg] = useState("");
  const [showServedHistory, setShowServedHistory] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const loadData = async () => {
    try {
      const [ordRes, reqRes, menuRes] = await Promise.all([
        api.get("/orders/active"),
        api.get("/waiter-requests/active"),
        api.get("/menu")
      ]);
      setOrders(ordRes.data);
      setWaiterRequests(reqRes.data);
      setMenuItems(menuRes.data.filter(item => item.available));
    } catch (error) {
      console.error("Error loading waiter data:", error);
      showToast("Error loading active tickets.");
    }
  };

  useEffect(() => {
    loadData();
    if (!socket) return;
    
    socket.emit("join", { role: "waiter" });
    
    socket.on("waiter:alert", (alert) => {
      loadData();
      showToast(`🔔 Table ${alert.tableNumber}: ${alert.message}`);
    });

    socket.on("order:new", () => {
      loadData();
      showToast("📋 New order waiting for confirmation!");
    });

    socket.on("order:update", loadData);
    socket.on("waiter:request_update", loadData);

    return () => {
      socket.off("waiter:alert");
      socket.off("order:new");
      socket.off("order:update");
      socket.off("waiter:request_update");
    };
  }, [socket]);

  // Order workflow updates
  const startReviewOrder = async (order) => {
    setEditingOrder(JSON.parse(JSON.stringify(order))); // Deep copy
    setEditingWaiterNotes(order.waiterNotes || "");
    setSelectedNewItem("");
    setSelectedNewItemQty(1);

    // Update status to reviewing in DB
    try {
      const { data } = await api.patch(`/orders/${order._id}/review`, { status: "waiter_reviewing" });
      setOrders(prev => prev.map(o => o._id === order._id ? data : o));
    } catch (err) {
      console.error(err);
    }
  };

  const cancelReviewOrder = async () => {
    if (editingOrder && editingOrder.status === "waiter_reviewing") {
      // Revert status to waiting for waiter
      try {
        await api.patch(`/orders/${editingOrder._id}/review`, { status: "waiting_for_waiter" });
      } catch (err) {
        console.error(err);
      }
    }
    setEditingOrder(null);
    loadData();
  };

  const handleEditItemQty = (menuItemId, delta) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items.map(item => {
      const mId = item.menuItem._id || item.menuItem;
      if (mId === menuItemId) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean);

    setEditingOrder({ ...editingOrder, items: updatedItems });
  };

  const handleRemoveItem = (menuItemId) => {
    if (!editingOrder) return;
    const updatedItems = editingOrder.items.filter(item => {
      const mId = item.menuItem._id || item.menuItem;
      return mId !== menuItemId;
    });
    setEditingOrder({ ...editingOrder, items: updatedItems });
  };

  const handleAddItem = () => {
    if (!selectedNewItem || !editingOrder) return;
    const item = menuItems.find(m => m._id === selectedNewItem);
    if (!item) return;

    // Check if item already exists
    const existing = editingOrder.items.find(i => (i.menuItem._id || i.menuItem) === item._id);
    let updatedItems;

    if (existing) {
      updatedItems = editingOrder.items.map(i => {
        const mId = i.menuItem._id || i.menuItem;
        if (mId === item._id) {
          return { ...i, quantity: i.quantity + Number(selectedNewItemQty) };
        }
        return i;
      });
    } else {
      updatedItems = [
        ...editingOrder.items,
        {
          menuItem: item,
          name: item.name,
          quantity: Number(selectedNewItemQty),
          price: item.price,
          notes: ""
        }
      ];
    }

    setEditingOrder({ ...editingOrder, items: updatedItems });
    setSelectedNewItem("");
    setSelectedNewItemQty(1);
    showToast(`Added ${item.name} to order.`);
  };

  const saveOrderEdits = async () => {
    if (!editingOrder) return;
    try {
      const payload = {
        items: editingOrder.items,
        waiterNotes: editingWaiterNotes,
        status: "waiting_for_waiter" // Return to queue, or they can confirm directly
      };
      await api.patch(`/orders/${editingOrder._id}/review`, payload);
      setEditingOrder(null);
      showToast("Order changes saved successfully!");
      loadData();
    } catch {
      showToast("Failed to save order changes.");
    }
  };

  const confirmOrderDirect = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/review`, { status: "sent_to_kitchen" });
      showToast("Order confirmed and sent to kitchen!");
      loadData();
    } catch {
      showToast("Failed to confirm order.");
    }
  };

  const confirmOrderEditing = async () => {
    if (!editingOrder) return;
    try {
      const payload = {
        items: editingOrder.items,
        waiterNotes: editingWaiterNotes,
        status: "sent_to_kitchen"
      };
      await api.patch(`/orders/${editingOrder._id}/review`, payload);
      setEditingOrder(null);
      showToast("Order saved and sent to kitchen!");
      loadData();
    } catch {
      showToast("Failed to save & confirm order.");
    }
  };

  const submitCancelOrder = async () => {
    if (!cancellingOrder || !cancelReason.trim()) return;
    try {
      await api.patch(`/orders/${cancellingOrder._id}/review`, {
        status: "cancelled",
        cancellationReason: cancelReason
      });
      setCancellingOrder(null);
      setCancelReason("");
      showToast("Order cancelled successfully.");
      loadData();
    } catch {
      showToast("Failed to cancel order.");
    }
  };

  const markOrderServed = async (orderId) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: "served" });
      showToast("Order marked as served.");
      loadData();
    } catch {
      showToast("Failed to update status.");
    }
  };

  // Waiter Request service handlers
  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      await api.patch(`/waiter-requests/${requestId}/status`, { status });
      showToast(`Call status updated to: ${status.replace("_", " ")}`);
      loadData();
    } catch {
      showToast("Failed to update request status.");
    }
  };

  // Status mappings
  // Status mappings
  const getOrderCountByStatus = (statusGroup) => {
    if (statusGroup === "pending") {
      return orders.filter(o => o.status === "waiting_for_waiter").length;
    }
    if (statusGroup === "reviewing") {
      return orders.filter(o => o.status === "waiter_reviewing").length;
    }
    if (statusGroup === "kitchen") {
      return orders.filter(o => ["sent_to_kitchen", "preparing", "pending", "in_progress"].includes(o.status)).length;
    }
    if (statusGroup === "ready") {
      return orders.filter(o => ["ready_to_serve", "ready"].includes(o.status)).length;
    }
    return 0;
  };

  // Filter & Search logic
  const searchFilter = (order) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTable = String(order.tableNumber).includes(q);
      const matchName = order.customerName?.toLowerCase().includes(q);
      const matchPhone = order.customerPhone?.includes(q);
      return matchTable || matchName || matchPhone;
    }
    return true;
  };

  const matchesStatusFilter = (order, filter) => {
    if (filter === "all") return true;
    if (filter === "waiting_for_waiter") return order.status === "waiting_for_waiter";
    if (filter === "waiter_reviewing") return order.status === "waiter_reviewing";
    if (filter === "sent_to_kitchen") return ["sent_to_kitchen", "preparing", "pending", "in_progress"].includes(order.status);
    if (filter === "ready_to_serve") return ["ready_to_serve", "ready"].includes(order.status);
    if (filter === "served") return order.status === "served";
    return true;
  };

  const orderedQueue = orders.filter(o => 
    ["waiting_for_waiter", "waiter_reviewing", "sent_to_kitchen", "preparing", "pending", "in_progress"].includes(o.status) && 
    searchFilter(o) &&
    matchesStatusFilter(o, statusFilter)
  );

  const servedQueue = orders.filter(o => 
    (showServedHistory || statusFilter === "served"
      ? ["ready_to_serve", "ready", "served"].includes(o.status)
      : ["ready_to_serve", "ready"].includes(o.status)) && 
    searchFilter(o) &&
    matchesStatusFilter(o, statusFilter)
  );

  const cancelledQueue = orders.filter(o => 
    o.status === "cancelled" && 
    searchFilter(o)
  );

  const sortedOrderedQueue = [...orderedQueue].sort((a, b) => {
    const priority = {
      waiting_for_waiter: 0,
      pending: 0,
      waiter_reviewing: 1,
      sent_to_kitchen: 2,
      preparing: 3,
      in_progress: 3,
    };
    return (priority[a.status] ?? 4) - (priority[b.status] ?? 4);
  });

  const sortedServedQueue = [...servedQueue].sort((a, b) => {
    const isReadyA = ["ready_to_serve", "ready"].includes(a.status);
    const isReadyB = ["ready_to_serve", "ready"].includes(b.status);
    if (isReadyA && !isReadyB) return -1;
    if (!isReadyA && isReadyB) return 1;
    return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
  });

  const sortedCancelledQueue = [...cancelledQueue].sort((a, b) => 
    new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt)
  );

  const getOrderStatusLabel = (status) => {
    const labels = {
      waiting_for_waiter: "Pending Waiter",
      waiter_reviewing: "Under Review",
      sent_to_kitchen: "Sent to Kitchen",
      preparing: "Preparing",
      ready_to_serve: "Ready to Serve",
      served: "Served",
      cancelled: "Cancelled",
      // legacy support
      pending: "Pending Waiter",
      in_progress: "Preparing",
      ready: "Ready to Serve"
    };
    return labels[status] || status;
  };

  const getOrderStatusColor = (status) => {
    const colors = {
      waiting_for_waiter: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      waiter_reviewing: "bg-blue-500/10 text-blue-500 border border-blue-500/20",
      sent_to_kitchen: "bg-purple-500/10 text-purple-500 border border-purple-500/20",
      preparing: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
      ready_to_serve: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 animate-pulse",
      served: "bg-stone-500/10 text-stone-500 border border-stone-500/20",
      cancelled: "bg-red-500/10 text-red-500 border border-red-500/20",
      // legacy
      pending: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
      in_progress: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
      ready: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    };
    return colors[status] || "bg-stone-500/10 text-stone-500 border border-stone-500/20";
  };

  const renderOrderCard = (order) => (
    <motion.div
      key={order._id}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900 p-5 shadow-xs flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Header row */}
        <div className="flex justify-between items-start border-b border-cream-100 dark:border-espresso-800 pb-2">
          <div>
            <h3 className="font-serif text-base font-bold">Table {order.tableNumber}</h3>
            <p className="text-[10px] text-stone-400 mt-0.5">
              Ref: #{order._id?.substring(18, 24).toUpperCase()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-[9px] uppercase tracking-wider font-bold ${getOrderStatusColor(order.status)}`}>
            {getOrderStatusLabel(order.status)}
          </span>
        </div>

        {/* Customer info */}
        <div className="text-[11px] space-y-0.5 bg-cream-50/50 dark:bg-espresso-950 p-2 rounded-xl border border-cream-100 dark:border-espresso-800">
          <p className="font-semibold text-chocolate-850 dark:text-espresso-50">
            👤 {order.customerName || "Table Guest"}
          </p>
          <p className="text-stone-400">
            📞 {order.customerPhone || "Muffled Phone"} 
            <span className="text-emerald-500 font-bold ml-1.5">✓ OTP Verified</span>
          </p>
          {order.customerNotes && (
            <p className="text-gold-600 italic mt-1 text-[10px] border-t border-cream-200 dark:border-espresso-800 pt-1">
              Note: {order.customerNotes}
            </p>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-1.5 text-xs">
          <p className="font-semibold uppercase tracking-wider text-[10px] text-stone-400">Items Ordered:</p>
          <ul className="divide-y divide-cream-100 dark:divide-espresso-800">
            {order.items?.map((item, idx) => (
              <li key={idx} className="py-1.5 flex justify-between text-xs">
                <div>
                  <span className="font-bold text-chocolate-850 dark:text-espresso-100">{item.quantity}x</span> {item.name}
                  {item.notes && <p className="text-[10px] text-gold-500 italic mt-0.5 ml-5">↳ {item.notes}</p>}
                </div>
                <span className="font-bold">₹{item.price * item.quantity}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Modifications timeline audit logs if exists */}
        {order.modificationHistory?.length > 0 && (
          <div className="text-[9px] bg-blue-500/5 text-blue-600 border border-blue-500/10 p-2 rounded-xl mt-2">
            <p className="font-bold uppercase tracking-wider mb-1">📝 Waiter History Log:</p>
            <ul className="space-y-0.5">
              {order.modificationHistory.map((hist, hIdx) => (
                <li key={hIdx}>
                  • {hist.changes} ({hist.waiterName})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Total billing amount & buttons */}
      <div className="border-t border-cream-100 dark:border-espresso-800 pt-3 space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-stone-400 font-semibold">Total Invoice Amount:</span>
          <span className="font-serif text-base font-bold text-gold-500">₹{order.totalAmount}</span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {order.status === "waiting_for_waiter" && (
            <>
              <button
                onClick={() => startReviewOrder(order)}
                className="flex-1 rounded-xl border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white py-2 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
              >
                Review & Edit
              </button>
              <button
                onClick={() => confirmOrderDirect(order._id)}
                className="flex-1 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-xs cursor-pointer"
              >
                Confirm
              </button>
            </>
          )}

          {order.status === "waiter_reviewing" && (
            <button
              onClick={() => startReviewOrder(order)}
              className="w-full rounded-xl bg-blue-600 py-2 text-xs font-bold uppercase tracking-wider text-white cursor-pointer"
            >
              Continue Review
            </button>
          )}

          {order.status === "ready_to_serve" && (
            <button
              onClick={() => markOrderServed(order._id)}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xs cursor-pointer animate-pulse"
            >
              🍽️ Mark Served
            </button>
          )}

          {["waiting_for_waiter", "waiter_reviewing"].includes(order.status) && (
            <button
              onClick={() => setCancellingOrder(order)}
              className="rounded-xl border border-red-500/30 hover:border-red-500 text-red-500 hover:bg-red-500/10 px-3 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-espresso-950 text-chocolate-900 dark:text-[#f7f3ec] transition-colors duration-150 pb-12 font-sans">
      
      {/* Toast notifications */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 z-50 rounded-xl bg-chocolate-900 text-white dark:bg-[#f7f3ec] dark:text-espresso-950 px-5 py-3.5 text-xs font-bold uppercase tracking-wider shadow-2xl flex items-center gap-2 border border-gold-500/20"
          >
            🔔 {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900/95 px-6 py-4 sticky top-0 z-30 shadow-xs backdrop-blur-md">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-500/40 bg-white"
            />
            <div>
              <h1 className="font-serif text-xl font-bold tracking-wide text-chocolate-900 dark:text-white">Ambika Waiter Dashboard</h1>
              <p className="text-[10px] uppercase tracking-widest text-gold-500 font-bold">Redesigned Dining Workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider bg-cream-100 dark:bg-espresso-800 border border-cream-200 dark:border-espresso-700 text-chocolate-850 dark:text-espresso-50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
            <Link to="/" className="rounded-lg border border-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-500 hover:bg-gold-500 hover:text-white transition-all cursor-pointer">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Body content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* COUNTER METRICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div 
            onClick={() => { setActiveTab("active_board"); setStatusFilter("waiting_for_waiter"); }}
            className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer hover:scale-[1.03] transition-all duration-200 ${
              activeTab === "active_board" && statusFilter === "waiting_for_waiter" ? "bg-amber-500/10 border-amber-500" : "bg-white dark:bg-espresso-900 border-cream-200 dark:border-espresso-800"
            }`}
          >
            <span className="text-2xl">⏳</span>
            <span className="text-xl font-bold text-amber-500 mt-1">{getOrderCountByStatus("pending")}</span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mt-0.5">Pending Orders</span>
          </div>

          <div 
            onClick={() => { setActiveTab("active_board"); setStatusFilter("waiter_reviewing"); }}
            className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer hover:scale-[1.03] transition-all duration-200 ${
              activeTab === "active_board" && statusFilter === "waiter_reviewing" ? "bg-blue-500/10 border-blue-500" : "bg-white dark:bg-espresso-900 border-cream-200 dark:border-espresso-800"
            }`}
          >
            <span className="text-2xl">📋</span>
            <span className="text-xl font-bold text-blue-500 mt-1">{getOrderCountByStatus("reviewing")}</span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mt-0.5">Under Review</span>
          </div>

          <div 
            onClick={() => { setActiveTab("active_board"); setStatusFilter("sent_to_kitchen"); }}
            className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer hover:scale-[1.03] transition-all duration-200 ${
              activeTab === "active_board" && statusFilter === "sent_to_kitchen" ? "bg-purple-500/10 border-purple-500" : "bg-white dark:bg-espresso-900 border-cream-200 dark:border-espresso-800"
            }`}
          >
            <span className="text-2xl">🍳</span>
            <span className="text-xl font-bold text-purple-500 mt-1">{getOrderCountByStatus("kitchen")}</span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mt-0.5">Kitchen Prep</span>
          </div>

          <div 
            onClick={() => { setActiveTab("active_board"); setStatusFilter("ready_to_serve"); }}
            className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer hover:scale-[1.03] transition-all duration-200 ${
              activeTab === "active_board" && statusFilter === "ready_to_serve" ? "bg-emerald-500/15 border-emerald-500 animate-pulse" : "bg-white dark:bg-espresso-900 border-cream-200 dark:border-espresso-800"
            }`}
          >
            <span className="text-2xl animate-bounce">🍽️</span>
            <span className="text-xl font-bold text-emerald-500 mt-1">{getOrderCountByStatus("ready")}</span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mt-0.5">Ready to Serve</span>
          </div>

          <div 
            onClick={() => { setActiveTab("active_board"); setStatusFilter("served"); }}
            className={`rounded-2xl border p-4 flex flex-col items-center justify-center text-center shadow-xs cursor-pointer hover:scale-[1.03] transition-all duration-200 ${
              activeTab === "active_board" && statusFilter === "served" ? "bg-stone-500/20 border-stone-400" : "bg-white dark:bg-espresso-900 border-cream-200 dark:border-espresso-800"
            }`}
          >
            <span className="text-2xl">✨</span>
            <span className="text-xl font-bold text-stone-500 mt-1">
              {orders.filter(o => o.status === "served").length}
            </span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mt-0.5">Served Today</span>
          </div>

          <div 
            className="bg-white dark:bg-espresso-900 rounded-2xl border border-gold-500/30 bg-gold-500/5 p-4 flex flex-col items-center justify-center text-center shadow-xs"
          >
            <span className="text-2xl">🛎️</span>
            <span className="text-xl font-bold text-gold-500 mt-1">{waiterRequests.length}</span>
            <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold mt-0.5">Guest Calls</span>
          </div>
        </div>
        {/* WORKSPACE AREA SPLIT SCREEN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LEFT/CENTER 2/3 COLUMN: ORDERS PIPELINE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Filter controls */}
            <div className="bg-white dark:bg-espresso-900 rounded-2xl border border-cream-200 dark:border-espresso-800 p-4 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
                  <button
                    onClick={() => { setActiveTab("active_board"); setStatusFilter("all"); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                      activeTab === "active_board" && statusFilter === "all" ? "bg-gold-500 text-white" : "bg-cream-100 dark:bg-espresso-855 text-stone-400"
                    }`}
                  >
                    All Active ({orders.filter(o => !["served", "cancelled"].includes(o.status)).length})
                  </button>
                  <button
                    onClick={() => { setActiveTab("active_board"); setStatusFilter("waiting_for_waiter"); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                      activeTab === "active_board" && statusFilter === "waiting_for_waiter" ? "bg-amber-500 text-white" : "bg-cream-100 dark:bg-espresso-855 text-stone-400"
                    }`}
                  >
                    Pending ({getOrderCountByStatus("pending")})
                  </button>
                  <button
                    onClick={() => { setActiveTab("active_board"); setStatusFilter("waiter_reviewing"); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                      activeTab === "active_board" && statusFilter === "waiter_reviewing" ? "bg-blue-500 text-white" : "bg-cream-100 dark:bg-espresso-855 text-stone-400"
                    }`}
                  >
                    Reviewing ({getOrderCountByStatus("reviewing")})
                  </button>
                  <button
                    onClick={() => { setActiveTab("active_board"); setStatusFilter("sent_to_kitchen"); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                      activeTab === "active_board" && statusFilter === "sent_to_kitchen" ? "bg-purple-500 text-white" : "bg-cream-100 dark:bg-espresso-855 text-stone-400"
                    }`}
                  >
                    Kitchen Prep ({getOrderCountByStatus("kitchen")})
                  </button>
                  <button
                    onClick={() => { setActiveTab("active_board"); setStatusFilter("ready_to_serve"); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                      activeTab === "active_board" && statusFilter === "ready_to_serve" ? "bg-emerald-500 text-white animate-pulse" : "bg-cream-100 dark:bg-espresso-855 text-stone-400"
                    }`}
                  >
                    Ready to Serve ({getOrderCountByStatus("ready")})
                  </button>
                  <button
                    onClick={() => { setActiveTab("active_board"); setStatusFilter("served"); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                      activeTab === "active_board" && statusFilter === "served" ? "bg-stone-500 text-white" : "bg-cream-100 dark:bg-espresso-855 text-stone-400"
                    }`}
                  >
                    Served ({orders.filter(o => o.status === "served").length})
                  </button>
                  <button
                    onClick={() => { setActiveTab("cancelled"); }}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer ${
                      activeTab === "cancelled" ? "bg-red-500 text-white" : "bg-cream-100 dark:bg-espresso-855 text-stone-400"
                    }`}
                  >
                    Cancelled ({orders.filter(o => o.status === "cancelled").length})
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64">
                  <span className="absolute inset-y-0 left-3 flex items-center text-stone-400">🔍</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search table, phone, name..."
                    className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 pl-8 pr-3 py-2 bg-cream-50/30 dark:bg-espresso-950 text-xs outline-none focus:border-gold-500"
                  />
                </div>

              </div>
            </div>

            {/* ORDERS GRID */}
            {activeTab === "active_board" ? (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Column 1: Ordered Queue */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-cream-200 dark:border-espresso-800 pb-2">
                    <h3 className="font-serif text-base font-bold text-chocolate-950 dark:text-white flex items-center gap-2">
                      <span>🍳</span> Ordered Queue
                    </h3>
                    <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-500 border border-amber-500/30">
                      {sortedOrderedQueue.length}
                    </span>
                  </div>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {sortedOrderedQueue.map((order) => renderOrderCard(order))}
                    </AnimatePresence>
                    {sortedOrderedQueue.length === 0 && (
                      <div className="bg-white dark:bg-espresso-900 border border-cream-200 dark:border-espresso-800 rounded-2xl p-8 text-center text-stone-400 text-xs">
                        No active cooking orders.
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Served Queue */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-cream-200 dark:border-espresso-800 pb-2">
                    <h3 className="font-serif text-base font-bold text-chocolate-955 dark:text-white flex items-center gap-2">
                      <span>🍽️</span> Ready & Served
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowServedHistory(!showServedHistory)}
                        className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                          showServedHistory
                            ? "bg-emerald-500 text-white border-emerald-600"
                            : "bg-cream-100 dark:bg-espresso-855 text-stone-400 border-cream-200 dark:border-espresso-800"
                        }`}
                      >
                        {showServedHistory ? "Hide Served" : "Show Served"}
                      </button>
                      <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-500 border border-emerald-500/30">
                        {sortedServedQueue.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <AnimatePresence>
                      {sortedServedQueue.map((order) => renderOrderCard(order))}
                    </AnimatePresence>
                    {sortedServedQueue.length === 0 && (
                      <div className="bg-white dark:bg-espresso-900 border border-cream-200 dark:border-espresso-800 rounded-2xl p-8 text-center text-stone-400 text-xs">
                        No ready or served orders.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Cancelled queue
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-cream-200 dark:border-espresso-800 pb-2">
                  <h3 className="font-serif text-base font-bold text-chocolate-955 dark:text-white flex items-center gap-2">
                    <span>❌</span> Cancelled Orders
                  </h3>
                  <span className="rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-bold text-red-500 border border-red-500/30">
                    {sortedCancelledQueue.length}
                  </span>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <AnimatePresence>
                    {sortedCancelledQueue.map((order) => renderOrderCard(order))}
                  </AnimatePresence>
                </div>
                {sortedCancelledQueue.length === 0 && (
                  <div className="bg-white dark:bg-espresso-900 border border-cream-200 dark:border-espresso-800 rounded-2xl p-12 text-center text-stone-400 text-xs">
                    No cancelled orders found.
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RIGHT 1/3 COLUMN: CALL WAITER ALERTS (ACTIVE GUEST CALLS) */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-espresso-900 rounded-2xl border border-cream-200 dark:border-espresso-800 p-5 shadow-xs space-y-4">
              <div className="flex justify-between items-center border-b border-cream-100 dark:border-espresso-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🛎️</span>
                  <h2 className="font-serif text-lg font-bold">Table Service Calls</h2>
                </div>
                <span className="rounded-full bg-gold-500/15 text-gold-500 px-2 py-0.5 text-xs font-bold border border-gold-500/25">
                  {waiterRequests.length} active
                </span>
              </div>

              {/* REQUESTS LIST */}
              <div className="space-y-4 overflow-y-auto max-h-[500px]">
                <AnimatePresence>
                  {waiterRequests.map((req) => (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                        req.status === "pending" ? "border-amber-400 bg-amber-500/5" :
                        req.status === "on_the_way" ? "border-blue-400 bg-blue-500/5 animate-pulse" :
                        "border-cream-200 dark:border-espresso-750 bg-cream-50/10"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-serif text-base font-bold">Table {req.tableNumber}</p>
                          <p className="text-[10px] text-stone-400">
                            Caller: {req.customerName || "Table Guest"} • {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          req.status === "pending" ? "bg-amber-500/20 text-amber-500" : "bg-blue-500/20 text-blue-500"
                        }`}>
                          {req.status === "on_the_way" ? "On The Way" : req.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {req.status === "pending" && (
                          <button
                            onClick={() => handleUpdateRequestStatus(req._id, "accepted")}
                            className="flex-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            Accept Call
                          </button>
                        )}
                        {req.status === "accepted" && (
                          <button
                            onClick={() => handleUpdateRequestStatus(req._id, "on_the_way")}
                            className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            On the Way
                          </button>
                        )}
                        <button
                          onClick={() => handleUpdateRequestStatus(req._id, "completed")}
                          className="flex-1 rounded-lg border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold py-1.5 text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          Complete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {waiterRequests.length === 0 && (
                  <p className="text-center text-xs text-stone-400 py-8 italic">
                    No active service calls. Tables are happy!
                  </p>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* EDIT MODAL / DRAWER PANEL */}
      <AnimatePresence>
        {editingOrder && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={cancelReviewOrder}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-cream-200 dark:border-espresso-750 bg-cream-50 dark:bg-espresso-900 p-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-4 overflow-y-auto pr-1">
                {/* Header */}
                <div className="flex justify-between items-center border-b border-cream-100 dark:border-espresso-800 pb-3">
                  <div>
                    <h2 className="font-serif text-lg font-bold">Review Order: Table {editingOrder.tableNumber}</h2>
                    <p className="text-xs text-stone-400">Order ID: #{editingOrder._id}</p>
                  </div>
                  <button onClick={cancelReviewOrder} className="text-stone-400 hover:text-stone-600 text-lg cursor-pointer">
                    ✕
                  </button>
                </div>

                {/* Edit Items Section */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs uppercase tracking-wider text-stone-400">Current Items in Basket</h4>
                  <ul className="divide-y divide-cream-100 dark:divide-espresso-800 bg-white dark:bg-espresso-950 p-4 rounded-2xl border border-cream-200 dark:border-espresso-750 max-h-48 overflow-y-auto space-y-1">
                    {editingOrder.items?.map((item) => {
                      const mId = item.menuItem._id || item.menuItem;
                      return (
                        <li key={mId} className="py-2.5 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-chocolate-850 dark:text-espresso-50">{item.name}</p>
                            <p className="text-[10px] text-stone-400">₹{item.price} each</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border border-cream-200 dark:border-espresso-800 rounded-lg overflow-hidden bg-cream-50 dark:bg-espresso-900">
                              <button
                                onClick={() => handleEditItemQty(mId, -1)}
                                className="px-2.5 py-1 hover:bg-cream-100 dark:hover:bg-espresso-800 font-bold cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-3 text-xs font-bold">{item.quantity}</span>
                              <button
                                onClick={() => handleEditItemQty(mId, 1)}
                                className="px-2.5 py-1 hover:bg-cream-100 dark:hover:bg-espresso-800 font-bold cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                            <span className="font-bold w-12 text-right">₹{item.price * item.quantity}</span>
                            <button
                              onClick={() => handleRemoveItem(mId)}
                              className="text-red-500 hover:text-red-700 ml-2 cursor-pointer text-sm"
                            >
                              🗑️
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* Add New Item Section */}
                <div className="bg-white dark:bg-espresso-950 p-4 rounded-2xl border border-cream-200 dark:border-espresso-750 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1">
                      Add Delicacy
                    </label>
                    <select
                      value={selectedNewItem}
                      onChange={(e) => setSelectedNewItem(e.target.value)}
                      className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/50 dark:bg-espresso-900 text-xs outline-none focus:border-gold-500 cursor-pointer"
                    >
                      <option value="">Select a menu item...</option>
                      {menuItems.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.name} (₹{item.price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="w-16">
                      <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1">
                        Qty
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={selectedNewItemQty}
                        onChange={(e) => setSelectedNewItemQty(e.target.value)}
                        className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/50 dark:bg-espresso-900 text-xs outline-none focus:border-gold-500 text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="rounded-xl bg-gold-500 hover:bg-gold-650 text-white font-bold px-4 py-2 text-xs uppercase cursor-pointer h-[38px] flex-1"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Waiter Notes Field */}
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1">
                    Waiter Notes & Special Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={editingWaiterNotes}
                    onChange={(e) => setEditingWaiterNotes(e.target.value)}
                    placeholder="E.g. Jain style request, less spices, paneer soft..."
                    className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 p-3 bg-white dark:bg-espresso-950 text-xs outline-none focus:border-gold-500"
                  />
                </div>
              </div>

              {/* Footer actions */}
              <div className="border-t border-cream-100 dark:border-espresso-800 pt-4 mt-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-stone-450 uppercase font-bold tracking-wider">New Total Amount</p>
                  <p className="font-serif text-xl font-bold text-gold-500">
                    ₹{editingOrder.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) || 0}
                  </p>
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={cancelReviewOrder}
                    className="rounded-xl border border-cream-300 dark:border-espresso-700 px-4 py-3 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-cream-100 dark:hover:bg-espresso-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveOrderEdits}
                    className="rounded-xl border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={confirmOrderEditing}
                    className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md cursor-pointer"
                  >
                    Confirm & Kitchen Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CANCELLATION MODAL */}
      <AnimatePresence>
        {cancellingOrder && (
          <div className="fixed inset-0 z-45 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setCancellingOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-cream-200 dark:border-espresso-750 bg-cream-50 dark:bg-espresso-900 p-6 shadow-2xl text-chocolate-900 dark:text-espresso-50 text-center space-y-4"
            >
              <span className="text-4xl block">⚠️</span>
              <h3 className="font-serif text-lg font-bold">Cancel Order for Table {cancellingOrder.tableNumber}?</h3>
              <p className="text-xs text-stone-500 dark:text-espresso-100">
                Please select or type a cancellation reason. The customer will be notified instantly.
              </p>

              <div className="space-y-2 text-left">
                <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-400 mb-1">
                  Cancellation Reason
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-white dark:bg-espresso-950 text-xs outline-none focus:border-gold-500 cursor-pointer"
                >
                  <option value="">Select a reason...</option>
                  <option value="Item unavailable in kitchen">Item unavailable in kitchen</option>
                  <option value="Customer cancelled request">Customer cancelled request</option>
                  <option value="Duplicate order submitted">Duplicate order submitted</option>
                  <option value="Kitchen is closing / unavailable">Kitchen is closing / unavailable</option>
                  <option value="Other / Special circumstance">Other / Special circumstance</option>
                </select>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Or write custom reason..."
                  className="w-full mt-2 rounded-xl border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-white dark:bg-espresso-950 text-xs outline-none focus:border-gold-500"
                />
              </div>

              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={() => {
                    setCancellingOrder(null);
                    setCancelReason("");
                  }}
                  className="rounded-xl border border-cream-300 dark:border-espresso-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-cream-100 dark:hover:bg-espresso-800 transition-all cursor-pointer"
                >
                  Keep Order
                </button>
                <button
                  onClick={submitCancelOrder}
                  disabled={!cancelReason.trim()}
                  className="rounded-xl bg-red-650 hover:bg-red-700 text-white font-bold px-5 py-2.5 text-xs font-bold uppercase tracking-wider shadow-md cursor-pointer disabled:opacity-50"
                >
                  Confirm Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
