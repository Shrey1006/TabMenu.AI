import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
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
        Loading admin center...
      </div>
    );

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-espresso-950 text-chocolate-900 dark:text-[#f7f3ec] transition-colors duration-150">
      
      {/* Header */}
      <header className="border-b border-cream-200 dark:border-espresso-800 bg-white dark:bg-espresso-900/90 px-6 py-4 backdrop-blur-md sticky top-0 z-35">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full object-cover ring-2 ring-gold-500/40 bg-white"
            />
            <div>
              <h1 className="font-serif text-lg font-bold text-chocolate-900 dark:text-white tracking-wide">
                Admin Management Center
              </h1>
              <p className="text-xs uppercase tracking-wider text-gold-500 font-medium">
                Tables Management · Menu Customization
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
              className="rounded-lg bg-red-500/10 hover:bg-red-500/25 px-4 py-2 text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 transition-all cursor-pointer"
            >
              Logout
            </button>
            <Link to="/" className="rounded-lg border border-gold-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gold-500 hover:bg-gold-500 hover:text-white transition-all cursor-pointer">
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6 space-y-8">
        
        {/* Feedback / Alert notifications */}
        {adminMessage && (
          <div className="rounded-xl border border-gold-500/35 bg-gold-500/10 p-4 text-xs font-semibold uppercase tracking-wider text-[#b69234]">
            🔔 {adminMessage}
          </div>
        )}

        {/* Dynamic Alert Banner */}
        {alerts.length > 0 && (
          <div className="rounded-xl border border-red-200 dark:border-red-950 bg-red-50 dark:bg-red-950/20 p-4 space-y-2">
            <h3 className="font-bold text-red-800 dark:text-red-400 text-sm">⚠️ Live Waiter & Guest Service Alerts</h3>
            {alerts.map((a, i) => (
              <p key={i} className="text-xs text-red-700 dark:text-red-400">
                {a.message}
              </p>
            ))}
          </div>
        )}

        {/* Clean Dashboard Stats Row (No software analytics) */}
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-xs">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">Gross Dine-In Revenue</p>
            <p className="text-3xl font-serif font-bold text-gold-500 mt-2">
              ₹{data.revenue?.toLocaleString("en-IN") || 0}
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-xs">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">Active Kitchen Orders</p>
            <p className="text-3xl font-serif font-bold text-chocolate-900 dark:text-white mt-2">
              {data.activeOrders}
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-xs">
            <p className="text-xs text-stone-400 uppercase tracking-widest font-semibold">Seeded Tables Count</p>
            <p className="text-3xl font-serif font-bold text-chocolate-900 dark:text-white mt-2">
              {data.tableCount}
            </p>
          </div>
        </div>

        {/* Tables & QR Code Generator side-by-side */}
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Tables Management */}
          <div className="rounded-3xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-cream-100 dark:border-espresso-800 pb-3">
              <h2 className="font-serif text-xl font-bold">Dining Room Floor</h2>
              <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
                Total {data.tables?.length} tables
              </span>
            </div>
            
            {/* Grid of tables */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {data.tables?.map((t) => (
                <div
                  key={t._id}
                  className="relative rounded-xl border border-cream-200 dark:border-espresso-800 p-4 text-center bg-cream-50/50 dark:bg-espresso-950/40 text-chocolate-900 dark:text-espresso-100 group transition-all"
                >
                  <button
                    onClick={() => deleteTable(t._id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity p-1 cursor-pointer"
                    title="Delete Table"
                  >
                    ✕
                  </button>
                  <p className="font-serif text-sm font-bold">Table {t.tableNumber}</p>
                  <p className="text-[10px] text-stone-400 mt-1 uppercase tracking-wider">
                    Cap: {t.capacity}
                  </p>
                  <span className={`inline-block mt-2 rounded-full h-2 w-2 ${
                    t.status === "available" ? "bg-green-500" : "bg-gold-500"
                  }`} />
                </div>
              ))}
            </div>

            {/* Create New Table Form */}
            <div className="bg-cream-50/30 dark:bg-espresso-950/40 p-4 rounded-xl border border-cream-200 dark:border-espresso-800 space-y-4">
              <h3 className="font-serif text-sm font-bold tracking-wide">Register New Dining Table</h3>
              <div className="grid gap-3 grid-cols-2">
                <div>
                  <label className="block text-[10px] uppercase text-stone-400 font-semibold mb-1">
                    Table Number
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
                  <label className="block text-[10px] uppercase text-stone-400 font-semibold mb-1">
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
                className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {createLoading ? "Creating..." : "Create Table"}
              </button>
            </div>
          </div>

          {/* QR Generator */}
          <div className="rounded-3xl bg-white dark:bg-espresso-900 p-6 border border-cream-200 dark:border-espresso-750 shadow-xs space-y-6 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold border-b border-cream-100 dark:border-espresso-800 pb-3">
                Table Medallion QR Generator
              </h2>
              <p className="mt-2 text-xs text-stone-400 leading-relaxed">
                Generate high-quality cryptographic QR codes linking physical table medallions directly to our digital check-in interface.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-stone-500 dark:text-espresso-100 font-medium">
                  Select Dining Table
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full rounded-xl border border-cream-200 dark:border-espresso-800 bg-cream-50/50 dark:bg-espresso-950/40 px-4 py-3 outline-none focus:border-gold-500 text-xs font-semibold"
                >
                  {data.tables?.map((t) => (
                    <option key={t._id} value={t.tableNumber}>
                      Table {t.tableNumber} (Token: {t.qrToken?.substring(0, 10)}...)
                    </option>
                  ))}
                </select>
              </div>

              {selectedTableObj && (
                <div className="flex flex-col sm:flex-row items-center gap-6 pt-2 bg-cream-50/20 dark:bg-espresso-950/10 p-4 rounded-2xl border border-cream-100 dark:border-espresso-850">
                  <div className="flex h-36 w-36 items-center justify-center rounded-xl border border-dashed border-cream-250 dark:border-espresso-800 bg-white p-2 shrink-0">
                    <QRCodeCanvas
                      ref={qrCanvasRef}
                      value={shareUrl}
                      size={128}
                      level="H"
                      includeMargin
                    />
                  </div>
                  <div className="space-y-3 flex-1">
                    <p className="text-xs uppercase tracking-widest font-semibold text-gold-500">QR Landing Link</p>
                    <p className="text-[10px] break-all text-stone-400 max-w-[250px]">{shareUrl}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={createQr}
                        disabled={qrLoading}
                        className="rounded-lg bg-gold-500 hover:bg-gold-600 text-white font-bold px-3 py-2 text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        {qrLoading ? "Regenerating..." : "Create Link"}
                      </button>
                      <button
                        onClick={exportQr}
                        className="rounded-lg border border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-white font-bold px-3 py-2 text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Download PNG
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

        {/* Menu Management Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold">Heritage Menu Customs</h2>
            <button
              onClick={() => {
                setEditingItem(null);
                setIsFormOpen(true);
              }}
              className="rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 py-3 px-5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
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
