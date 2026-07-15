import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext";
import { SocketProvider, useSocket } from "../context/SocketContext";
import { useTheme } from "../context/ThemeContext";

// Reuse components
import AdminMenuTable from "../components/AdminMenuTable";
import AdminFoodForm from "../components/AdminFoodForm";

function AdminBoard() {
  const socket = useSocket();
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // State
  const [data, setData] = useState(null);
  const [menu, setMenu] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(4);
  const [createLoading, setCreateLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState("");
  const qrCanvasRef = useRef(null);

  // Menu Edit state
  const [editingItem, setEditingItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const load = () => {
    api.get("/admin/dashboard").then((r) => setData(r.data));
    api.get("/menu/all").then((r) => setMenu(r.data));
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
    return data?.tables?.find((t) => String(t.tableNumber) === String(selectedTable));
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
          "Unable to create table. Please check the values.",
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
      setAdminMessage("Dishes availability toggled.");
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
      <header className="border-b border-cream-200 dark:border-espresso-850 bg-white dark:bg-espresso-900/90 px-6 py-4 backdrop-blur-md sticky top-0 z-35">
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
                Heritage Table Medallions & Menu Customs
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
            <Link to="/" className="rounded-lg border border-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-500 hover:bg-gold-500 hover:text-white transition-all cursor-pointer">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Admin Wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl p-6 space-y-8"
      >
        {/* Banner Title */}
        <div className="text-center space-y-2 py-4">
          <p className="font-serif text-xs font-semibold uppercase tracking-[0.35em] text-gold-500">
            Ambika Pure Veg Jaipur
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
                <p key={i} className="text-xs text-red-700 dark:text-red-400/80 pl-4 border-l border-red-550">
                  {a.message}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Royal Dashboard Stats Row */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-sm relative overflow-hidden group hover:border-gold-500/40 transition-colors">
            <div className="absolute right-4 top-4 text-3xl opacity-20">🪙</div>
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">Gross Dine-In Billings</p>
            <p className="text-3xl font-serif font-bold text-gold-500 mt-2">
              ₹{data.revenue?.toLocaleString("en-IN") || 0}
            </p>
            <div className="h-1 w-full bg-gold-500 absolute bottom-0 left-0" />
          </div>
          
          <div className="rounded-2xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-sm relative overflow-hidden group hover:border-gold-500/40 transition-colors">
            <div className="absolute right-4 top-4 text-3xl opacity-20">🔥</div>
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">Active Kitchen Orders</p>
            <p className="text-3xl font-serif font-bold text-chocolate-900 dark:text-white mt-2">
              {data.activeOrders}
            </p>
            <div className="h-1 w-full bg-gold-500 absolute bottom-0 left-0" />
          </div>

          <div className="rounded-2xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-sm relative overflow-hidden group hover:border-gold-500/40 transition-colors">
            <div className="absolute right-4 top-4 text-3xl opacity-20">🍽️</div>
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">Dining Floor Tables</p>
            <p className="text-3xl font-serif font-bold text-chocolate-900 dark:text-white mt-2">
              {data.tableCount}
            </p>
            <div className="h-1 w-full bg-gold-500 absolute bottom-0 left-0" />
          </div>
        </div>

        {/* Tables & QR Code Generator */}
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Tables Management */}
          <div className="rounded-3xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-cream-100 dark:border-espresso-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gold-500">✦</span>
                  <h2 className="font-serif text-xl font-bold">Dining Medallions</h2>
                </div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-cream-100 dark:bg-espresso-800 px-2 py-0.5 rounded-md">
                  Floor Occupancy
                </span>
              </div>
              
              {/* Grid of tables - Medallion Style */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {data.tables?.map((t) => (
                  <div
                    key={t._id}
                    className="relative rounded-2xl border border-cream-200 dark:border-espresso-850 p-4 text-center bg-cream-50/30 dark:bg-espresso-950/20 text-chocolate-900 dark:text-espresso-100 hover:border-gold-500/60 hover:shadow-md transition-all duration-300 group flex flex-col items-center justify-center min-h-[100px]"
                  >
                    <button
                      onClick={() => deleteTable(t._id)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity p-1 cursor-pointer"
                      title="Remove Table"
                    >
                      ✕
                    </button>
                    {/* Ring Medallion Details */}
                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-gold-500/40 flex items-center justify-center font-serif text-sm font-bold text-[#b69234]">
                      {t.tableNumber}
                    </div>
                    <p className="text-[9px] uppercase tracking-wider text-stone-400 mt-2 font-semibold">
                      Seats: {t.capacity}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        t.status === "available" ? "bg-green-500 animate-pulse" : "bg-gold-500"
                      }`} />
                      <span className="text-[8px] uppercase tracking-widest text-stone-405">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create New Table Form */}
            <div className="bg-cream-50/20 dark:bg-espresso-950/20 p-4 rounded-2xl border border-cream-200 dark:border-espresso-850 space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <span className="text-gold-500 text-xs">⚜</span>
                <h3 className="font-serif text-sm font-bold tracking-wide">Register Medallion Table</h3>
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

          {/* QR Generator */}
          <div className="rounded-3xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-sm space-y-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 border-b border-cream-100 dark:border-espresso-800 pb-3">
                <span className="text-gold-500">✦</span>
                <h2 className="font-serif text-xl font-bold">Medallion QR Cryptograph</h2>
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
                    <p className="text-[10px] uppercase tracking-widest font-bold text-gold-500">Secure Cryptographic URL</p>
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

        {/* Dynamic Food Specialty Form overlay */}
        <AnimatePresence>
          {isFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-xs animate-fade-in"
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

        {/* Menu Management Section */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between border-b border-cream-200 dark:border-espresso-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-gold-500 text-lg">✦</span>
              <h2 className="font-serif text-2xl font-bold">Heritage Culinary Specialties</h2>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-3 px-6 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              + Add Specialty Dish
            </button>
          </div>

          <AdminMenuTable
            menu={menu}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
            onToggleAvailability={handleToggleAvailability}
          />
        </div>

      </motion.div>
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
