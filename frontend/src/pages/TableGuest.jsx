import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";
import { SocketProvider, useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

// Component imports
import MenuCard from "../components/MenuCard";
import CategoryAccordion from "../components/CategoryAccordion";
import CartDrawer from "../components/CartDrawer";
import CheckoutModal from "../components/CheckoutModal";

function TableGuestApp({ qrToken, tableNumber }) {
  const socket = useSocket();
  const { isDark, toggleTheme } = useTheme();

  // State variables
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);
  
  // Waiter request state (synced with localStorage for persistence)
  const [waiterRequest, setWaiterRequest] = useState(() => {
    const saved = localStorage.getItem(`active-waiter-request-${tableNumber}`);
    return saved ? JSON.parse(saved) : null;
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    veg: false,
    nonVeg: false,
    jain: false,
    bestseller: false,
    spicy: false,
    availableOnly: false,
    priceSort: "", // "asc" | "desc" | ""
  });

  // UI state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isOrderConfirmOpen, setIsOrderConfirmOpen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Category Accordion open states
  const [openCategories, setOpenCategories] = useState({
    "Soup": true,
    "Starters": true,
    "Tanduri Starters": true,
    "Chinese": true,
    "Fried rice and Noodles": true,
    "South Indian": true,
    "Dosa and Uttapam": true,
    "Breakfast Combo": true,
    "Pav Bhaji": true,
    "Burger and Sandwich": true,
    "Pizza": true,
    "Main Course": true,
    "Breads": true,
    "Rice & Biryani": true,
    "Accompaniments": true,
    "Beverages": true,
    "Lassi": true,
    "Milkshakes": true,
    "Falooda": true,
    "Desserts": true,
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  const loadMenu = () => {
    api.get("/menu")
      .then((r) => setMenu(r.data))
      .catch(() => showToast("Failed to retrieve menu specialties."));
  };

  useEffect(() => {
    loadMenu();
  }, []);

  // Fetch active order for this table on load
  useEffect(() => {
    if (tableNumber && qrToken) {
      api.get(`/orders/active/table/${tableNumber}?token=${qrToken}`)
        .then((res) => {
          const tableOrder = res.data.find((o) => String(o.tableNumber) === String(tableNumber));
          if (tableOrder) setOrder(tableOrder);
        })
        .catch(() => {});
    }
  }, [tableNumber, qrToken]);

  const updateWaiterRequestState = (req) => {
    setWaiterRequest(req);
    if (req) {
      localStorage.setItem(`active-waiter-request-${tableNumber}`, JSON.stringify(req));
    } else {
      localStorage.removeItem(`active-waiter-request-${tableNumber}`);
    }
  };

  useEffect(() => {
    if (!socket || !tableNumber) return;
    socket.emit("join", { table: String(tableNumber) });
    
    socket.on(`table:${tableNumber}:order`, (o) => {
      setOrder(o);
    });

    socket.on("order:update", (o) => {
      if (Number(o.tableNumber) === Number(tableNumber)) {
        setOrder((prevOrder) => {
          if (prevOrder) {
            // Check status transitions
            if (o.status !== prevOrder.status) {
              if (o.status === "waiter_reviewing") {
                showToast("📋 Waiter is reviewing your order...");
              } else if (o.status === "sent_to_kitchen") {
                showToast("🍳 Order confirmed! Sent to kitchen.");
              } else if (o.status === "preparing") {
                showToast("🔥 Chef has started preparing your food.");
              } else if (o.status === "ready_to_serve") {
                showToast("🍽️ Food is ready! Waiter is serving it shortly.");
              } else if (o.status === "served") {
                showToast("✨ Food served! Enjoy your meal.");
              } else if (o.status === "cancelled") {
                showToast(`❌ Order cancelled: ${o.cancellationReason || "No reason specified"}`);
              }
            }

            // Check modification history changes
            if (o.modificationHistory && o.modificationHistory.length > (prevOrder.modificationHistory?.length || 0)) {
              const latest = o.modificationHistory[o.modificationHistory.length - 1];
              showToast(`📝 Order updated by waiter: ${latest.changes}`);
            }
          }
          return o;
        });
      }
    });

    socket.on("waiter:request_update", (req) => {
      if (Number(req.tableNumber) === Number(tableNumber)) {
        if (req.status === "completed") {
          updateWaiterRequestState(null);
          showToast("🛎️ Waiter request completed!");
        } else {
          updateWaiterRequestState(req);
          if (req.status === "accepted") {
            showToast("🛎️ Waiter accepted your request!");
          } else if (req.status === "on_the_way") {
            showToast("🚶 Waiter is on the way!");
          }
        }
      }
    });

    return () => {
      socket.off(`table:${tableNumber}:order`);
      socket.off("order:update");
      socket.off("waiter:request_update");
    };
  }, [socket, tableNumber]);

  // Cart operations
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id);
      if (existing) {
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { menuItemId: item._id, quantity: 1, name: item.name, price: item.price, notes: "" }];
    });
    showToast(`Added ${item.name} to basket.`);
  };

  const removeFromCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item._id);
      if (existing && existing.quantity > 1) {
        return prev.map((c) =>
          c.menuItemId === item._id ? { ...c, quantity: c.quantity - 1 } : c
        );
      }
      return prev.filter((c) => c.menuItemId !== item._id);
    });
    showToast(`Removed ${item.name} from basket.`);
  };

  const clearCart = () => {
    setCart([]);
    showToast("Basket cleared.");
  };

  const callWaiter = async () => {
    try {
      const { data } = await api.post("/waiter-requests", {
        tableNumber: Number(tableNumber),
        customerName: order?.customerName || "Table Guest",
      });
      updateWaiterRequestState(data);
      showToast("🛎️ Your request has been sent. A waiter will be with you shortly.");
    } catch {
      showToast("Unable to notify waiter. Please request help directly.");
    }
  };

  const submitFeedback = async () => {
    if (!feedback.trim()) return;
    try {
      await api.post("/feedback", {
        qrToken,
        text: feedback,
        orderId: order?._id,
      });
      setFeedbackSent(true);
      setFeedback("");
      showToast("Thank you for your valuable feedback!");
    } catch {
      showToast("Failed to submit feedback.");
    }
  };

  // Filter and search logic
  const filteredMenu = useMemo(() => {
    let result = [...menu];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.category?.name?.toLowerCase().includes(q) ||
          m.description.toLowerCase().includes(q)
      );
    }

    // Filter Badges
    if (activeFilters.veg) result = result.filter((m) => m.veg);
    if (activeFilters.nonVeg) result = result.filter((m) => m.nonVeg);
    if (activeFilters.jain) result = result.filter((m) => m.jain);
    if (activeFilters.bestseller) result = result.filter((m) => m.bestseller);
    if (activeFilters.spicy) result = result.filter((m) => m.spiceLevel === "high");
    if (activeFilters.availableOnly) result = result.filter((m) => m.available);

    // Price Sorting
    if (activeFilters.priceSort === "asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (activeFilters.priceSort === "desc") {
      result.sort((a, b) => b.price - a.price);
    } else {
      // Default to category displayOrder and then item displayOrder
      result.sort((a, b) => {
        const catA = a.category?.displayOrder ?? 0;
        const catB = b.category?.displayOrder ?? 0;
        if (catA !== catB) return catA - catB;
        return a.displayOrder - b.displayOrder;
      });
    }

    return result;
  }, [menu, searchQuery, activeFilters]);

  // Group items by category
  const groupedMenu = useMemo(() => {
    const groups = {};
    filteredMenu.forEach((item) => {
      const cat = item.category?.name || "Other";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(item);
    });
    return groups;
  }, [filteredMenu]);

  const cartTotal = useMemo(() => {
    return cart.reduce((sum, c) => {
      const item = menu.find((m) => m._id === c.menuItemId);
      return sum + (item?.price || 0) * c.quantity;
    }, 0);
  }, [cart, menu]);

  const toggleCategory = (cat) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Dine-in order placing flow
  const handleConfirmOrder = async (customerDetails) => {
    setLoading(true);
    setIsOrderConfirmOpen(false);
    try {
      const orderPayload = {
        qrToken,
        items: cart,
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        customerNotes: `Guest: ${customerDetails.name} • Dine-In`,
        otpToken: customerDetails.otpToken, // Send verified OTP token!
      };

      const { data: newOrder } = await api.post("/orders", orderPayload);
      setOrder(newOrder);
      setCart([]);
      showToast("🛎️ Order submitted! Waiting for waiter review.");
    } catch (err) {
      showToast(err.response?.data?.message || "Order placement failed.");
    } finally {
      setLoading(false);
    }
  };



  const statusColor = {
    waiting_for_waiter: "bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/60",
    waiter_reviewing: "bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60",
    sent_to_kitchen: "bg-purple-100 dark:bg-purple-950/20 text-purple-800 dark:text-purple-400 border border-purple-200 dark:border-purple-900/60",
    preparing: "bg-orange-100 dark:bg-orange-950/20 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60",
    ready_to_serve: "bg-green-100 dark:bg-green-950/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/60",
    served: "bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-850",
    cancelled: "bg-red-100 dark:bg-red-950/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-900/60",
    paid: "bg-gold-500/10 text-gold-500 border border-gold-500/20",
    // Compatibility fallbacks
    pending: "bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/60",
    in_progress: "bg-orange-100 dark:bg-orange-950/20 text-orange-800 dark:text-orange-400 border border-orange-200 dark:border-orange-900/60",
    ready: "bg-green-100 dark:bg-green-950/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/60",
  };

  const getStepIndex = (status) => {
    const statusIndices = {
      waiting_for_waiter: 1,
      waiter_reviewing: 1,
      sent_to_kitchen: 2,
      preparing: 3,
      ready_to_serve: 4,
      served: 5,
      paid: 5,
      // Compatibility fallbacks
      pending: 1,
      in_progress: 3,
      ready: 4,
    };
    return statusIndices[status] !== undefined ? statusIndices[status] : 0;
  };

  const steps = [
    { label: "Verified Mobile", icon: "📱" },
    { label: "Waiter Confirmed", icon: "🛎️" },
    { label: "Sent to Kitchen", icon: "🍳" },
    { label: "Cooking", icon: "🔥" },
    { label: "Ready to Serve", icon: "🍽️" },
    { label: "Served", icon: "✨" },
  ];

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-espresso-950 text-chocolate-900 dark:text-[#f7f3ec] transition-colors duration-200 pb-28">
      
      {/* Toast Alert Banner */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-6 z-50 rounded-xl bg-stone-900 text-white px-5 py-3 text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 border border-stone-850"
          >
            🔔 {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="border-b border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900/90 px-4 py-4 sticky top-0 z-35 backdrop-blur-md transition-colors">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-500/40 bg-white"
            />
            <div>
              <h1 className="font-serif text-lg font-bold tracking-wide">Ambika Pure Veg</h1>
              <p className="text-xs uppercase tracking-wider text-gold-500 font-medium">Table {tableNumber}</p>
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

      {/* Success Page Container */}
      <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
            
            {/* Waiter Request Alert */}
            {waiterRequest && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-gold-500/30 bg-white dark:bg-espresso-900 p-5 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl animate-bounce">🛎️</span>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-gold-500">Service Call Status</h4>
                    <p className="text-xs text-stone-500 dark:text-espresso-100 font-semibold mt-0.5">
                      {waiterRequest.status === "pending" && "🛎️ Request Sent (Waiter Notified)"}
                      {waiterRequest.status === "accepted" && "🤝 Waiter Accepted Request"}
                      {waiterRequest.status === "on_the_way" && "🚶 Waiter is on the way!"}
                      {waiterRequest.status === "completed" && "👋 Waiter Arrived"}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-gold-500/10 text-gold-500 border border-gold-500/20 animate-pulse">
                  {waiterRequest.status === "pending" ? "Notified" : waiterRequest.status === "on_the_way" ? "On The Way" : waiterRequest.status}
                </span>
              </motion.div>
            )}

            {/* Active Order Card */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: -15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-cream-200 dark:border-espresso-750 bg-white dark:bg-espresso-900 p-6 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold">Active Table Order</h2>
                    <p className="text-xs text-stone-400">Order Ref: #{order._id?.substring(18, 24).toUpperCase()}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColor[order.status] || ""}`}>
                    {order.status?.replace("_", " ")}
                  </span>
                </div>
                <ul className="divide-y divide-cream-100 dark:divide-espresso-800 text-xs">
                  {order.items?.map((i, idx) => (
                    <li key={idx} className="py-2 flex justify-between">
                      <span>{i.quantity}x {i.name}</span>
                      <span className="font-bold">₹{i.price * i.quantity}</span>
                    </li>
                  ))}
                </ul>

                {/* Progress Timeline Stepper */}
                {order.status !== "cancelled" ? (
                  <div className="py-4 border-t border-cream-100 dark:border-espresso-800">
                    <div className="relative flex justify-between items-center w-full">
                      {/* Connector Line */}
                      <div className="absolute top-4 left-0 right-0 h-1 bg-cream-200 dark:bg-espresso-800 -z-10 rounded-full" />
                      <div 
                        className="absolute top-4 left-0 h-1 bg-gold-500 transition-all duration-500 rounded-full -z-10" 
                        style={{ width: `${(getStepIndex(order.status) / 5) * 100}%` }}
                      />

                      {steps.map((st, idx) => {
                        const currentIdx = getStepIndex(order.status);
                        const isCompleted = idx < currentIdx;
                        const isActive = idx === currentIdx;
                        return (
                          <div key={idx} className="flex flex-col items-center flex-1">
                            <motion.div
                              animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ repeat: Infinity, duration: 2 }}
                              className={`h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all border shadow-sm ${
                                isCompleted ? "bg-gold-500 text-white border-gold-600" :
                                isActive ? "bg-cream-50 dark:bg-espresso-950 text-gold-500 border-gold-500 font-bold ring-4 ring-gold-500/20" :
                                "bg-cream-100 dark:bg-espresso-800 text-stone-400 border-cream-200 dark:border-espresso-750"
                              }`}
                            >
                              {isCompleted ? "✓" : st.icon}
                            </motion.div>
                            <span className={`text-[9px] uppercase tracking-wider font-bold mt-1.5 text-center block ${
                              isActive ? "text-gold-500" :
                              isCompleted ? "text-chocolate-850 dark:text-espresso-100" :
                              "text-stone-400"
                            }`}>
                              {st.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-650 text-xs space-y-1.5">
                    <p className="font-bold">❌ Order Cancelled</p>
                    <p className="opacity-90">Reason: {order.cancellationReason || "Not specified"}</p>
                    {order.modificationHistory?.length > 0 && (
                      <p className="text-[10px] text-stone-400 pt-1 border-t border-red-500/10">
                        History: {order.modificationHistory.map(h => h.changes).join(" | ")}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between border-t border-cream-100 dark:border-espresso-800 pt-3">
                  <p className="font-bold">Total Bill: ₹{order.totalAmount}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={callWaiter}
                      className="rounded-xl border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      🛎️ Call Waiter
                    </button>

                  </div>
                </div>
              </motion.div>
            )}

            {/* Live Search & Filter Bar */}
            <div className="space-y-4">
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-stone-400">🔍</span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search our heritage menu (e.g. Paneer, Tandoori...)"
                  className="w-full rounded-2xl border border-cream-200 dark:border-espresso-750 pl-10 pr-4 py-4 bg-white dark:bg-espresso-900 outline-none focus:border-gold-500 text-sm shadow-xs transition-colors"
                />
              </div>

              {/* Filter Badges Grid */}
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, veg: !prev.veg }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                    activeFilters.veg
                      ? "bg-green-500/10 text-green-600 border-green-500/30 font-bold"
                      : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
                  }`}
                >
                  🟢 Veg Only
                </button>
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, jain: !prev.jain }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                    activeFilters.jain
                      ? "bg-gold-500/10 text-gold-500 border-gold-500/30 font-bold"
                      : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
                  }`}
                >
                  🌾 Jain Options
                </button>
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, bestseller: !prev.bestseller }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                    activeFilters.bestseller
                      ? "bg-gold-500 text-white border-transparent font-bold shadow-xs"
                      : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
                  }`}
                >
                  ⭐ Bestsellers
                </button>
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, spicy: !prev.spicy }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                    activeFilters.spicy
                      ? "bg-red-500/10 text-red-600 border-red-500/30 font-bold"
                      : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
                  }`}
                >
                  🌶️ Spicy Only
                </button>
                <button
                  onClick={() => setActiveFilters(prev => ({ ...prev, availableOnly: !prev.availableOnly }))}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border transition-all cursor-pointer ${
                    activeFilters.availableOnly
                      ? "bg-stone-900 text-white border-transparent font-bold"
                      : "bg-white dark:bg-espresso-900 text-stone-500 dark:text-espresso-100 border-cream-200 dark:border-espresso-750"
                  }`}
                >
                  ● In Stock
                </button>

                {/* Price Sort Dropdown */}
                <select
                  value={activeFilters.priceSort}
                  onChange={(e) => setActiveFilters(prev => ({ ...prev, priceSort: e.target.value }))}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold bg-white dark:bg-espresso-900 border border-cream-200 dark:border-espresso-750 text-stone-500 dark:text-espresso-100 outline-none cursor-pointer"
                >
                  <option value="">Sort by Price</option>
                  <option value="asc">Price: Low → High</option>
                  <option value="desc">Price: High → Low</option>
                </select>
              </div>
            </div>

            {/* Accordion List */}
            <div className="rounded-2xl border border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900 shadow-sm overflow-hidden">
              {Object.keys(groupedMenu).length === 0 ? (
                <div className="p-12 text-center text-stone-400">
                  No delicacies match your filter settings.
                </div>
              ) : (
                Object.keys(groupedMenu).map((cat) => (
                  <CategoryAccordion
                    key={cat}
                    category={cat}
                    itemCount={groupedMenu[cat].length}
                    isOpen={!!openCategories[cat]}
                    onToggle={() => toggleCategory(cat)}
                  >
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-2">
                      {groupedMenu[cat].map((item) => {
                        const inCart = cart.find((c) => c.menuItemId === item._id);
                        return (
                          <MenuCard
                            key={item._id}
                            item={item}
                            quantity={inCart ? inCart.quantity : 0}
                            onAdd={() => addToCart(item)}
                            onRemove={() => removeFromCart(item)}
                          />
                        );
                      })}
                    </div>
                  </CategoryAccordion>
                ))
              )}
            </div>

            {/* Guest Feedback Section */}
            <div className="rounded-2xl border border-cream-200 dark:border-espresso-750 bg-white dark:bg-espresso-900 p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold">Feedback & Service Review</h3>
              {feedbackSent ? (
                <p className="text-sm text-green-600">✓ Your feedback has been sent to our hosts. Thank you!</p>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Tell us about your culinary experience..."
                    className="w-full rounded-xl border border-cream-200 dark:border-espresso-750 p-4 bg-cream-50/20 dark:bg-espresso-950 outline-none focus:border-gold-500 text-xs"
                  />
                  <button
                    onClick={submitFeedback}
                    className="rounded-lg bg-gold-500 hover:bg-gold-600 text-white font-bold px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}
            </div>

          </div>

      {/* Floating View Basket Sticky Bar */}
      {cart.length > 0 && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 inset-x-0 bg-white dark:bg-espresso-900 border-t border-cream-200 dark:border-espresso-800 p-4 flex items-center justify-between max-w-4xl mx-auto shadow-2xl z-38 rounded-t-3xl"
        >
          <div>
            <p className="text-xs text-stone-400">Items in basket</p>
            <p className="font-serif text-base font-bold text-gold-500">₹{cartTotal}</p>
          </div>
          <button
            onClick={() => setIsCartOpen(true)}
            className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-white font-bold px-6 py-3.5 text-xs uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md"
          >
            View Basket ({cart.reduce((sum, c) => sum + c.quantity, 0)})
          </button>
        </motion.div>
      )}

      {/* Cart Slider Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        menu={menu}
        onAdd={addToCart}
        onRemove={removeFromCart}
        onClear={clearCart}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsOrderConfirmOpen(true);
        }}
        tableNumber={tableNumber}
      />

      {/* 1. Checkout Confirmation Modal */}
      <CheckoutModal
        isOpen={isOrderConfirmOpen}
        onClose={() => setIsOrderConfirmOpen(false)}
        amount={cartTotal}
        mode="order"
        onConfirmOrder={handleConfirmOrder}
      />



    </div>
  );
}

export default function TableGuest() {
  const { tableNumber: tableParam } = useParams();
  const [tableNumber, setTableNumber] = useState(() => {
    return /^\d+$/.test(tableParam) ? tableParam : "";
  });
  const [qrToken, setQrToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const { isDark, toggleTheme } = useTheme();

  const connectTable = async () => {
    setLoading(true);
    try {
      const cleanParam = String(tableParam).split('?')[0].split('#')[0].replace(/\/+$/, "").trim();
      let responseData;
      if (/^\d+$/.test(cleanParam)) {
        const { data } = await api.get(`/tables/connect/${cleanParam}`);
        responseData = data;
      } else {
        const { data } = await api.get(`/tables/verify/${cleanParam}`);
        responseData = data;
      }
      setTableNumber(String(responseData.tableNumber));
      setQrToken(responseData.token);
      localStorage.setItem(`table-token-${responseData.tableNumber}`, responseData.token);
      localStorage.setItem("last-table-token", responseData.token);
      localStorage.setItem("last-table-number", String(responseData.tableNumber));
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Unable to connect to this table."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!tableParam) return;
    connectTable();
  }, [tableParam]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 dark:bg-espresso-950 text-chocolate-900 dark:text-espresso-50">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif text-lg font-bold tracking-wide">Connecting to Table {tableParam}...</p>
        </div>
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-cream-50 dark:bg-espresso-950 p-6 text-center text-chocolate-900 dark:text-espresso-50">
        <span className="text-5xl">⚠️</span>
        <h2 className="font-serif text-2xl font-bold mt-4">Connection Failed</h2>
        <p className="text-sm text-stone-500 dark:text-espresso-100 max-w-sm mt-2">{message}</p>
        <Link to="/" className="mt-6 rounded-lg bg-gold-500 text-white font-bold px-6 py-3 text-xs uppercase tracking-wider shadow-md">
          Return to home page
        </Link>
      </div>
    );
  }

  if (!qrToken) return null;

  return (
    <SocketProvider table={String(tableNumber)}>
      <TableGuestApp qrToken={qrToken} tableNumber={tableNumber} />
    </SocketProvider>
  );
}
