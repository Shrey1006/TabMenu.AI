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
import PaymentSuccess from "../components/PaymentSuccess";

function TableGuestApp({ qrToken, tableNumber }) {
  const socket = useSocket();
  const { isDark, toggleTheme } = useTheme();

  // State variables
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState(null);

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
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [paymentCompletedOrder, setPaymentCompletedOrder] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  // Category Accordion open states
  const [openCategories, setOpenCategories] = useState({
    "Starters": true,
    "Main Course": true,
    "Breads": true,
    "Desserts": true,
    "Beverages": true,
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
    if (tableNumber) {
      api.get("/orders/active")
        .then((res) => {
          const tableOrder = res.data.find((o) => String(o.tableNumber) === String(tableNumber));
          if (tableOrder) setOrder(tableOrder);
        })
        .catch(() => {});
    }
  }, [tableNumber]);

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
    if (!order) return;
    try {
      await api.post(`/orders/${order._id}/call-waiter`);
      showToast("🛎️ Waiter notified! Assistance is on the way.");
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
          m.category.toLowerCase().includes(q) ||
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
      // Default to display order
      result.sort((a, b) => a.displayOrder - b.displayOrder);
    }

    return result;
  }, [menu, searchQuery, activeFilters]);

  // Group items by category
  const groupedMenu = useMemo(() => {
    const groups = {};
    filteredMenu.forEach((item) => {
      const cat = item.category || "Other";
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
      };

      const { data: newOrder } = await api.post("/orders", orderPayload);
      setOrder(newOrder);
      setCart([]);
      showToast("🍳 Dine-in order sent to kitchen!");
    } catch (err) {
      showToast(err.response?.data?.message || "Order placement failed.");
    } finally {
      setLoading(false);
    }
  };

  // Dine-in pay flow
  const handlePaymentSuccess = async (paymentId, customerDetails) => {
    if (!order) return;
    setLoading(true);
    setIsPaymentOpen(false);
    try {
      const { data: paidOrder } = await api.post(`/orders/${order._id}/pay`);
      setPaymentCompletedOrder(paidOrder);
      setOrder(null); // Clear active order
      showToast("💳 Bill settled via Razorpay!");
    } catch {
      showToast("Failed to process payment settlement.");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentFailure = (errorMsg) => {
    showToast(`❌ Payment Failed: ${errorMsg}. Please try again.`);
  };

  const statusColor = {
    pending: "bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/60",
    in_progress: "bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60",
    ready: "bg-green-100 dark:bg-green-950/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-900/60",
    served: "bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-800",
    paid: "bg-gold-500/10 text-gold-500 border border-gold-500/20",
  };

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
      <AnimatePresence>
        {paymentCompletedOrder ? (
          <div className="mx-auto max-w-4xl px-4 py-12 flex justify-center">
            <PaymentSuccess
              order={paymentCompletedOrder}
              onClose={() => setPaymentCompletedOrder(null)}
            />
          </div>
        ) : (
          <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
            
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
                <div className="flex items-center justify-between border-t border-cream-100 dark:border-espresso-800 pt-3">
                  <p className="font-bold">Total Bill: ₹{order.totalAmount}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={callWaiter}
                      className="rounded-xl border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                    >
                      🛎️ Call Waiter
                    </button>
                    {order.status !== "paid" && (
                      <button
                        onClick={() => setIsPaymentOpen(true)}
                        className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 text-white font-bold px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shadow-md"
                      >
                        💳 Pay Bill (Razorpay)
                      </button>
                    )}
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
        )}
      </AnimatePresence>

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

      {/* 2. Checkout Payment Modal */}
      <CheckoutModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        amount={
          order
            ? order.totalAmount +
              Math.round(order.totalAmount * 0.05) + // GST
              Math.round(order.totalAmount * 0.05) // Dine-in Service Charge
            : 0
        }
        mode="payment"
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentFailure={handlePaymentFailure}
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
      let responseData;
      if (/^\d+$/.test(tableParam)) {
        const { data } = await api.get(`/tables/connect/${tableParam}`);
        responseData = data;
      } else {
        const { data } = await api.get(`/tables/verify/${tableParam}`);
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
