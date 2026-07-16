import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext";
import { SocketProvider, useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

// Components
import AdminMenuTable from "../components/AdminMenuTable";
import AdminFoodForm from "../components/AdminFoodForm";
import CategoryManagement from "../components/CategoryManagement";
import CategoryFormModal from "../components/CategoryFormModal";

function AdminBoard() {
  const socket = useSocket();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // State
  const [data, setData] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [createLoading, setCreateLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const qrCanvasRef = useRef(null);

  // Tab State
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "specialties" | "categories" | "tables"

  // Food Item Management States
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");
  const [foodCatFilter, setFoodCatFilter] = useState("");
  const [foodAvailabilityFilter, setFoodAvailabilityFilter] = useState("");
  const [foodDietaryFilter, setFoodDietaryFilter] = useState("");
  const [foodBestsellerFilter, setFoodBestsellerFilter] = useState("");
  const [foodSort, setFoodSort] = useState("displayOrder"); // name | price | date | displayOrder

  // Category Management States
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");
  const [catActiveFilter, setCatActiveFilter] = useState("");
  const [catSort, setCatSort] = useState("displayOrder"); // name | date | displayOrder

  const load = () => {
    api.get("/admin/dashboard").then((r) => setData(r.data));
    api.get("/menu/all").then((r) => setMenu(r.data));
    loadCategories();
  };

  const loadCategories = () => {
    api.get("/categories/all").then((r) => setCategories(r.data));
  };

  useEffect(() => {
    load();
    if (!socket) return;
    socket.emit("join", { role: "admin" });
    socket.on("admin:alert", (a) => {
      setAlerts((prev) => [a, ...prev].slice(0, 10));
      load();
    });
    socket.on("feedback:new", load);
    socket.on("order:new", load);
    socket.on("order:update", load);
    return () => {
      socket.off("admin:alert");
      socket.off("feedback:new");
      socket.off("order:new");
      socket.off("order:update");
    };
  }, [socket]);

  useEffect(() => {
    if (!data?.tables?.length || selectedTable) return;
    setSelectedTable(String(data.tables[0].tableNumber));
  }, [data, selectedTable]);

  const selectedTableObj = useMemo(() => {
    if (!selectedTable) return null;
    return data?.tables?.find(
      (t) => String(t.tableNumber) === String(selectedTable)
    );
  }, [data?.tables, selectedTable]);

  const shareUrl = useMemo(() => {
    if (!selectedTableObj) return "";
    return qrUrl || `${window.location.origin}/table/${selectedTableObj.qrToken}`;
  }, [qrUrl, selectedTableObj]);

  const createQr = () => {
    if (!selectedTableObj) return;
    setQrLoading(true);
    setQrUrl(`${window.location.origin}/table/${selectedTableObj.qrToken}`);
    setQrLoading(false);
  };

  useEffect(() => {
    setQrUrl("");
  }, [selectedTable]);

  // Table Management Actions
  const deleteTable = async (id) => {
    if (!window.confirm("Are you sure you want to delete this table?")) return;
    try {
      await api.delete(`/tables/${id}`);
      setAdminMessage("Table deleted successfully.");
      setSelectedTable("");
      load();
    } catch (error) {
      setAdminMessage(
        error.response?.data?.message || "Unable to delete table."
      );
    }
  };

  const createTable = async () => {
    if (!newTableNumber) return;

    setCreateLoading(true);
    setAdminMessage("");
    try {
      const { data: table } = await api.post("/tables", {
        tableNumber: Number(newTableNumber),
        capacity: Number(newTableCapacity),
      });

      setAdminMessage(`Table ${table.tableNumber} created successfully.`);
      setNewTableNumber("");
      setNewTableCapacity(4);
      setSelectedTable(String(table.tableNumber));
      setQrUrl(`${window.location.origin}/table/${table.qrToken}`);
      load();
    } catch (error) {
      setAdminMessage(
        error.response?.data?.message ||
          "Unable to create table. Please check the values."
      );
    } finally {
      setCreateLoading(false);
    }
  };

  const exportQr = () => {
    if (!qrCanvasRef.current) return;
    const canvas = qrCanvasRef.current;
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `table-${selectedTable}-qr.png`;
    link.click();
  };

  // Menu CRUD actions
  const handleToggleAvailability = async (id, available) => {
    try {
      await api.put(`/menu/${id}`, { available: !available });
      setAdminMessage("Dish availability toggled.");
      load();
    } catch {
      setAdminMessage("Failed to toggle availability.");
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/menu/${id}`);
      setAdminMessage("Specialty dish deleted successfully.");
      load();
    } catch {
      setAdminMessage("Failed to delete specialty dish.");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem._id}`, formData);
        setAdminMessage("Specialty dish updated successfully.");
      } else {
        await api.post("/menu", formData);
        setAdminMessage("Specialty dish created successfully.");
      }
      setIsFormOpen(false);
      setEditingItem(null);
      load();
    } catch (error) {
      setAdminMessage(
        error.response?.data?.message || "Failed to save culinary specialty."
      );
    }
  };

  // Category CRUD Actions
  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setIsCategoryFormOpen(true);
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      setAdminMessage("Category and associated dishes deleted successfully.");
      load();
    } catch {
      setAdminMessage("Failed to delete category.");
    }
  };

  const handleCategorySubmit = async (formData) => {
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        setAdminMessage("Category updated successfully.");
      } else {
        await api.post("/categories", formData);
        setAdminMessage("Category created successfully.");
      }
      setIsCategoryFormOpen(false);
      setEditingCategory(null);
      load();
    } catch (error) {
      setAdminMessage(
        error.response?.data?.message || "Failed to save category."
      );
    }
  };

  // Filtered lists
  const filteredMenu = useMemo(() => {
    let items = [...menu];

    // Search by name
    if (foodSearch.trim()) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(foodSearch.toLowerCase())
      );
    }

    // Filter by Category
    if (foodCatFilter) {
      items = items.filter(
        (item) => (item.category?._id || item.category) === foodCatFilter
      );
    }

    // Filter by Availability
    if (foodAvailabilityFilter === "available") {
      items = items.filter((item) => item.available);
    } else if (foodAvailabilityFilter === "sold_out") {
      items = items.filter((item) => !item.available);
    }

    // Filter by Veg / Non-Veg / Jain
    if (foodDietaryFilter === "veg") {
      items = items.filter((item) => item.veg);
    } else if (foodDietaryFilter === "non_veg") {
      items = items.filter((item) => item.nonVeg);
    } else if (foodDietaryFilter === "jain") {
      items = items.filter((item) => item.jain);
    }

    // Filter by Bestseller
    if (foodBestsellerFilter === "bestseller") {
      items = items.filter((item) => item.bestseller);
    }

    // Sorting
    items.sort((a, b) => {
      if (foodSort === "name") {
        return a.name.localeCompare(b.name);
      } else if (foodSort === "price") {
        return a.price - b.price;
      } else if (foodSort === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return a.displayOrder - b.displayOrder;
      }
    });

    return items;
  }, [
    menu,
    foodSearch,
    foodCatFilter,
    foodAvailabilityFilter,
    foodDietaryFilter,
    foodBestsellerFilter,
    foodSort,
  ]);

  const filteredCategories = useMemo(() => {
    let cats = [...categories];

    // Search by name
    if (catSearch.trim()) {
      cats = cats.filter((cat) =>
        cat.name.toLowerCase().includes(catSearch.toLowerCase())
      );
    }

    // Filter by Active status
    if (catActiveFilter === "active") {
      cats = cats.filter((cat) => cat.active);
    } else if (catActiveFilter === "hidden") {
      cats = cats.filter((cat) => !cat.active);
    }

    // Sorting
    cats.sort((a, b) => {
      if (catSort === "name") {
        return a.name.localeCompare(b.name);
      } else if (catSort === "date") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return a.displayOrder - b.displayOrder;
      }
    });

    return cats;
  }, [categories, catSearch, catActiveFilter, catSort]);

  if (!data)
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream-50 dark:bg-espresso-950 text-chocolate-900 dark:text-espresso-50 font-serif font-bold text-lg">
        <div className="text-center space-y-4">
          <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="tracking-wide">Summoning admin console...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-espresso-950 text-chocolate-900 dark:text-[#f7f3ec] transition-colors duration-150">
      {/* Header */}
      <header className="border-b border-cream-200 dark:border-espresso-850 bg-white dark:bg-espresso-900/90 px-6 py-4 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-500/60 bg-white shadow-md"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[#b69234] text-xs">👑</span>
                <h1 className="font-serif text-lg font-bold text-chocolate-900 dark:text-white tracking-wide">
                  Ambika Admin Center
                </h1>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-gold-500 font-semibold">
                Heritage Dynamic Table & Menu Custody
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
            <button
              onClick={logout}
              className="rounded-lg bg-red-500/10 hover:bg-red-500/25 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-650 dark:text-red-400 transition-all cursor-pointer"
            >
              Logout
            </button>
            <Link
              to="/"
              className="rounded-lg border border-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-500 hover:bg-gold-500 hover:text-white transition-all cursor-pointer"
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Wrapper */}
      <div className="mx-auto max-w-7xl p-6 space-y-8">
        {/* Banner Title */}
        <div className="text-center space-y-2 py-4">
          <p className="font-serif text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
            Ambika Pure Veg Dombivli
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-wide text-chocolate-950 dark:text-white">
            The Royal Custodian Console
          </h2>
          <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto mt-2" />
        </div>

        {/* Feedback / Alert notifications */}
        <AnimatePresence>
          {adminMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-xl border border-gold-500/35 bg-gold-500/10 p-4 text-xs font-semibold uppercase tracking-wider text-[#b69234] text-center"
            >
              ✦ {adminMessage} ✦
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Alert Banner */}
        {alerts.length > 0 && (
          <div className="rounded-xl border border-red-200 dark:border-red-950/60 bg-red-50/50 dark:bg-red-950/10 p-4 space-y-2 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-red-650">🛎️</span>
              <h3 className="font-bold text-red-800 dark:text-red-400 text-xs uppercase tracking-wider">
                Live Dining Room Service Calls
              </h3>
            </div>
            <div className="space-y-1.5">
              {alerts.map((a, i) => (
                <p
                  key={i}
                  className="text-xs text-red-700 dark:text-red-400/80 pl-4 border-l border-red-550"
                >
                  {a.message}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="border-b border-cream-200 dark:border-espresso-800 flex gap-2 overflow-x-auto pb-[1px] relative">
          {[
            { id: "overview", label: "📊 Dashboard", desc: "Operational Overview" },
            { id: "specialties", label: "🍽️ Specialties", desc: "Food Items" },
            { id: "categories", label: "📂 Categories", desc: "Menu Structuring" },
            { id: "tables", label: "🔑 Tables & QRs", desc: "Cryptographic Table QRs" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setAdminMessage("");
              }}
              className={`relative py-3.5 px-6 font-serif text-sm font-bold uppercase tracking-wider transition-colors duration-150 cursor-pointer text-left focus:outline-hidden shrink-0 ${
                activeTab === tab.id
                  ? "text-gold-500"
                  : "text-stone-400 hover:text-stone-600 dark:hover:text-espresso-100"
              }`}
            >
              <div className="flex flex-col">
                <span>{tab.label}</span>
                <span className="text-[8px] font-sans font-normal normal-case tracking-wider opacity-75 mt-0.5">
                  {tab.desc}
                </span>
              </div>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTabBorder"
                  className="absolute bottom-0 left-0 right-0 h-[3px] bg-gold-500 rounded-full"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                {/* 8 Operational Statistics Cards */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  {[
                    {
                      title: "Total Food Categories",
                      val: data.categoryCount,
                      icon: "📂",
                      color: "from-amber-600 to-amber-500",
                    },
                    {
                      title: "Total Food Items",
                      val: data.totalFoodItems,
                      icon: "🍽️",
                      color: "from-amber-600 to-amber-500",
                    },
                    {
                      title: "Active Menu Items",
                      val: data.activeMenuCount,
                      icon: "🟢",
                      color: "from-emerald-600 to-emerald-500",
                    },
                    {
                      title: "Out of Stock Items",
                      val: data.outOfStockCount,
                      icon: "🔴",
                      color: "from-rose-600 to-rose-500",
                    },
                    {
                      title: "Pending Orders",
                      val: data.pendingOrderCount,
                      icon: "⏳",
                      color: "from-amber-600 to-amber-500",
                    },
                    {
                      title: "Confirmed Orders",
                      val: data.confirmedOrderCount,
                      icon: "🤝",
                      color: "from-emerald-600 to-emerald-500",
                    },
                    {
                      title: "Kitchen Orders",
                      val: data.kitchenOrderCount,
                      icon: "🍳",
                      color: "from-amber-600 to-amber-500",
                    },
                    {
                      title: "Completed Orders",
                      val: data.completedOrderCount,
                      icon: "✨",
                      color: "from-emerald-600 to-emerald-500",
                    },
                  ].map((stat, i) => (
                    <div
                      key={i}
                      className="rounded-2xl bg-white dark:bg-espresso-900 p-5 border border-cream-200 dark:border-espresso-750 shadow-sm relative overflow-hidden group hover:border-gold-500/40 transition-colors"
                    >
                      <div className="absolute right-4 top-3 text-2xl opacity-20">
                        {stat.icon}
                      </div>
                      <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold pr-6">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-serif font-bold text-chocolate-950 dark:text-white mt-2">
                        {stat.val || 0}
                      </p>
                      <div
                        className={`h-[3px] w-full bg-gradient-to-r ${stat.color} absolute bottom-0 left-0`}
                      />
                    </div>
                  ))}
                </div>

                {/* Dashboard Feeds */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Recent Orders List */}
                  <div className="rounded-3xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-sm space-y-4">
                    <h3 className="font-serif text-lg font-bold border-b border-cream-100 dark:border-espresso-800 pb-3">
                      Recent Activity Feed
                    </h3>
                    {data.recentOrders?.length === 0 ? (
                      <p className="text-xs text-stone-400 py-4 text-center">
                        No orders recorded today.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {data.recentOrders?.slice(0, 7).map((o) => (
                          <div
                            key={o._id}
                            className="flex items-center justify-between p-3 rounded-xl bg-cream-50/40 dark:bg-espresso-950/20 border border-cream-200 dark:border-espresso-800 text-xs"
                          >
                            <div>
                              <p className="font-bold text-chocolate-950 dark:text-white">
                                Table {o.tableNumber} • {o.customerName || "Guest"}
                              </p>
                              <p className="text-[10px] text-stone-400 mt-0.5">
                                Ref: #{o._id?.substring(18, 24).toUpperCase()} • ₹{o.totalAmount}
                              </p>
                            </div>
                            <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gold-500/10 text-gold-500 border border-gold-500/20">
                              {o.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Recent Feedback Feed */}
                  <div className="rounded-3xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-sm space-y-4">
                    <h3 className="font-serif text-lg font-bold border-b border-cream-100 dark:border-espresso-800 pb-3">
                      Live Sentiment Feed
                    </h3>
                    {data.recentFeedback?.length === 0 ? (
                      <p className="text-xs text-stone-400 py-4 text-center">
                        No service reviews submitted.
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {data.recentFeedback?.slice(0, 5).map((f) => (
                          <div
                            key={f._id}
                            className="p-3.5 rounded-xl bg-cream-50/40 dark:bg-espresso-950/20 border border-cream-200 dark:border-espresso-800 text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-[#b69234]">
                                Rating: {f.rating}/5
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                  f.sentiment === "positive"
                                    ? "bg-green-500/10 text-green-600"
                                    : f.sentiment === "negative"
                                    ? "bg-red-500/10 text-red-650"
                                    : "bg-stone-500/10 text-stone-500"
                                }`}
                              >
                                {f.sentiment || "Neutral"}
                              </span>
                            </div>
                            <p className="italic text-stone-500 dark:text-espresso-100">
                              "{f.comment}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SPECIALTIES TAB */}
            {activeTab === "specialties" && (
              <div className="space-y-6 animate-fade-in">
                {/* Search & Filters Toolbar */}
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5 bg-white dark:bg-espresso-900 p-4 rounded-2xl border border-cream-200 dark:border-espresso-800 shadow-xs">
                  {/* Search input */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-xs text-stone-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      value={foodSearch}
                      onChange={(e) => setFoodSearch(e.target.value)}
                      placeholder="Search items..."
                      className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 pl-8 pr-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none text-xs focus:border-gold-500"
                    />
                  </div>

                  {/* Category Filter */}
                  <select
                    value={foodCatFilter}
                    onChange={(e) => setFoodCatFilter(e.target.value)}
                    className="rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none text-xs font-semibold"
                  >
                    <option value="">All Categories</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>

                  {/* Availability Filter */}
                  <select
                    value={foodAvailabilityFilter}
                    onChange={(e) => setFoodAvailabilityFilter(e.target.value)}
                    className="rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none text-xs font-semibold"
                  >
                    <option value="">All Stock Status</option>
                    <option value="available">Available Only</option>
                    <option value="sold_out">Sold Out Only</option>
                  </select>

                  {/* Dietary Filter */}
                  <select
                    value={foodDietaryFilter}
                    onChange={(e) => setFoodDietaryFilter(e.target.value)}
                    className="rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none text-xs font-semibold"
                  >
                    <option value="">All Dietary</option>
                    <option value="veg">🟢 Veg Only</option>
                    <option value="non_veg">🔴 Non-Veg Only</option>
                    <option value="jain">🌾 Jain Only</option>
                  </select>

                  {/* Sort by */}
                  <select
                    value={foodSort}
                    onChange={(e) => setFoodSort(e.target.value)}
                    className="rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none text-xs font-semibold"
                  >
                    <option value="displayOrder">Sort: Display Order</option>
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="price">Sort: Price (Low → High)</option>
                    <option value="date">Sort: Date Added</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-b border-cream-200 dark:border-espresso-800 pb-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gold-500 text-lg">✦</span>
                    <h2 className="font-serif text-2xl font-bold">
                      Heritage Culinary Specialties
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setIsFormOpen(true);
                    }}
                    className="rounded-xl bg-gradient-to-r from-gold-50 to-gold-400 hover:from-gold-600 hover:to-gold-500 bg-gold-500 py-3 px-6 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    + Add Specialty Dish
                  </button>
                </div>

                <AdminMenuTable
                  menu={filteredMenu}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onToggleAvailability={handleToggleAvailability}
                />
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === "categories" && (
              <div className="space-y-6 animate-fade-in">
                {/* Search & Filters Toolbar */}
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 bg-white dark:bg-espresso-900 p-4 rounded-2xl border border-cream-200 dark:border-espresso-800 shadow-xs">
                  {/* Search input */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-xs text-stone-400">
                      🔍
                    </span>
                    <input
                      type="text"
                      value={catSearch}
                      onChange={(e) => setCatSearch(e.target.value)}
                      placeholder="Search categories..."
                      className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 pl-8 pr-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none text-xs focus:border-gold-500"
                    />
                  </div>

                  {/* Active filter */}
                  <select
                    value={catActiveFilter}
                    onChange={(e) => setCatActiveFilter(e.target.value)}
                    className="rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none text-xs font-semibold"
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active Only</option>
                    <option value="hidden">Hidden Only</option>
                  </select>

                  {/* Sort by */}
                  <select
                    value={catSort}
                    onChange={(e) => setCatSort(e.target.value)}
                    className="rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-cream-50/30 dark:bg-espresso-950 outline-none text-xs font-semibold"
                  >
                    <option value="displayOrder">Sort: Display Order</option>
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="date">Sort: Date Created</option>
                  </select>

                  <button
                    onClick={() => {
                      setEditingCategory(null);
                      setIsCategoryFormOpen(true);
                    }}
                    className="rounded-xl bg-gold-500 hover:bg-gold-600 text-white py-2.5 px-6 text-xs font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    + Add Food Category
                  </button>
                </div>

                <div className="flex items-center justify-between border-b border-cream-200 dark:border-espresso-800 pb-3 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-gold-500 text-lg">✦</span>
                    <h2 className="font-serif text-2xl font-bold">
                      Dynamic Food Categories
                    </h2>
                  </div>
                </div>

                <CategoryManagement
                  categories={filteredCategories}
                  menu={menu}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  onReload={load}
                />
              </div>
            )}

            {/* TABLES & QR TAB */}
            {activeTab === "tables" && (
              <div className="grid gap-8 lg:grid-cols-2 animate-fade-in">
                {/* Tables Management (Registration) */}
                <div className="rounded-3xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-sm space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-cream-100 dark:border-espresso-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gold-500">✦</span>
                        <h2 className="font-serif text-xl font-bold">
                          Dining Medallions
                        </h2>
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-cream-100 dark:bg-espresso-800 px-2.5 py-1 rounded-md">
                        Registered: {data.tables?.length || 0} Tables
                      </span>
                    </div>

                    {/* Table lists (No live status indicators) */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {data.tables?.map((t) => (
                        <div
                          key={t._id}
                          className="relative rounded-2xl border border-cream-200 dark:border-espresso-850 p-4 text-center bg-cream-50/30 dark:bg-espresso-950/20 text-chocolate-900 dark:text-espresso-100 hover:border-gold-500/60 hover:shadow-md transition-all duration-300 group flex flex-col items-center justify-center min-h-[90px]"
                        >
                          <button
                            onClick={() => deleteTable(t._id)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity p-1 cursor-pointer"
                            title="Remove Table"
                          >
                            ✕
                          </button>
                          <div className="h-10 w-10 rounded-full border border-dashed border-gold-500/40 flex items-center justify-center font-serif text-sm font-bold text-[#b69234]">
                            {t.tableNumber}
                          </div>
                          <p className="text-[9px] uppercase tracking-wider text-stone-400 mt-2 font-semibold">
                            Seats: {t.capacity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Create New Table Form */}
                  <div className="bg-cream-50/20 dark:bg-espresso-950/20 p-4 rounded-2xl border border-cream-200 dark:border-espresso-855 space-y-4 mt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gold-500 text-xs">⚜</span>
                      <h3 className="font-serif text-sm font-bold tracking-wide">
                        Register Medallion Table
                      </h3>
                    </div>
                    <div className="grid gap-3 grid-cols-2">
                      <div>
                        <label className="block text-[9px] uppercase text-stone-400 font-bold mb-1 tracking-wider">
                          Table ID
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newTableNumber}
                          onChange={(e) => setNewTableNumber(e.target.value)}
                          placeholder="e.g. 7"
                          className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-stone-400 font-bold mb-1 tracking-wider">
                          Capacity (Seats)
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={newTableCapacity}
                          onChange={(e) => setNewTableCapacity(e.target.value)}
                          className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-3 py-2 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 text-xs font-semibold"
                        />
                      </div>
                    </div>
                    <button
                      onClick={createTable}
                      disabled={createLoading || !newTableNumber}
                      className="w-full rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {createLoading ? "Forging Medallion..." : "Add Medallion Table"}
                    </button>
                  </div>
                </div>

                {/* QR Cryptograph Generator */}
                <div className="rounded-3xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-sm space-y-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 border-b border-cream-100 dark:border-espresso-800 pb-3">
                      <span className="text-gold-500">✦</span>
                      <h2 className="font-serif text-xl font-bold">
                        Medallion QR Cryptograph
                      </h2>
                    </div>
                    <p className="mt-2 text-xs text-stone-400 leading-relaxed">
                      Generate high-security cryptographic table links to display inside the physical brass dining table medallions for direct check-in.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone-400 font-bold">
                        Select Dining Table
                      </label>
                      <select
                        value={selectedTable}
                        onChange={(e) => setSelectedTable(e.target.value)}
                        className="w-full rounded-xl border border-cream-200 dark:border-espresso-800 bg-cream-50/50 dark:bg-espresso-950/40 px-4 py-3 outline-none focus:border-gold-500 text-xs font-semibold text-chocolate-850 dark:text-espresso-50"
                      >
                        {data.tables?.map((t) => (
                          <option key={t._id} value={t.tableNumber}>
                            Table {t.tableNumber} (Token: {t.qrToken?.substring(0, 12)}...)
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedTableObj && (
                      <div className="flex flex-col sm:flex-row items-center gap-6 pt-2 bg-cream-50/20 dark:bg-espresso-950/10 p-4 rounded-2xl border border-cream-100 dark:border-espresso-850">
                        <div className="flex h-36 w-36 items-center justify-center rounded-xl border border-dashed border-cream-250 dark:border-espresso-800 bg-white p-2 shrink-0 shadow-inner">
                          <QRCodeCanvas
                            ref={qrCanvasRef}
                            value={shareUrl}
                            size={128}
                            level="H"
                            includeMargin
                          />
                        </div>
                        <div className="space-y-3 flex-1">
                          <p className="text-[10px] uppercase tracking-widest font-bold text-gold-500">
                            Secure Cryptographic URL
                          </p>
                          <p className="text-[9px] break-all text-stone-400 font-mono select-all bg-cream-50/40 dark:bg-espresso-950 p-2 rounded-lg border border-cream-200 dark:border-espresso-800">
                            {shareUrl}
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={createQr}
                              disabled={qrLoading}
                              className="rounded-lg bg-gold-500 hover:bg-gold-600 text-white font-bold px-3.5 py-2 text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              {qrLoading ? "Generating..." : "Get Link"}
                            </button>
                            <button
                              onClick={exportQr}
                              className="rounded-lg border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white font-bold px-3.5 py-2 text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Export PNG
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Food Specialty Form Overlay Modal */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingItem(null);
                }}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto"
              >
                <AdminFoodForm
                  item={editingItem}
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setIsFormOpen(false);
                    setEditingItem(null);
                  }}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Category Form Modal Overlay */}
        <AnimatePresence>
          {isCategoryFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => {
                  setIsCategoryFormOpen(false);
                  setEditingCategory(null);
                }}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto"
              >
                <CategoryFormModal
                  category={editingCategory}
                  onSubmit={handleCategorySubmit}
                  onCancel={() => {
                    setIsCategoryFormOpen(false);
                    setEditingCategory(null);
                  }}
                />
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Admin() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return (
    <SocketProvider role="admin">
      <AdminBoard />
    </SocketProvider>
  );
}
