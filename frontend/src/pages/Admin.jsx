import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext";
import { SocketProvider, useSocket } from "../context/SocketContext";

function AdminBoard() {
  const socket = useSocket();
  const { logout } = useAuth();
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

  const toggleItem = async (id, available) => {
    await api.put(`/menu/${id}`, { available: !available });
    load();
  };

  if (!data)
    return (
      <div className="flex min-h-screen items-center justify-center">
        Loading...
      </div>
    );

  const sentimentColor = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-stone-500",
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-10 w-10 rounded-full"
            />
            <div>
              <h1 className="text-xl font-bold text-purple-900">
                Admin Management Center
              </h1>
              <p className="text-sm text-stone-500">
                Revenue · Floor speed · AI sentiment
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="text-sm text-stone-500 hover:text-red-600"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6">
        {alerts.length > 0 && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <h3 className="font-bold text-red-800">⚠️ AI Sentiment Alerts</h3>
            {alerts.map((a, i) => (
              <p key={i} className="mt-1 text-sm text-red-700">
                {a.message}
              </p>
            ))}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Today's Revenue</p>
            <p className="text-2xl font-bold text-brand-700">
              ₹{data.revenue?.toLocaleString("en-IN")}
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Active Orders</p>
            <p className="text-2xl font-bold">{data.activeOrders}</p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Wait Reduction</p>
            <p className="text-2xl font-bold text-brand-700">
              {data.avgWaitReduction}s
            </p>
          </div>
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-stone-500">Issue Detection</p>
            <p className="text-2xl font-bold text-warm-600">
              +{data.issueDetectionBoost}%
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Tables</h2>
              <span className="text-sm text-stone-500">
                Total {data.tableCount} tables
              </span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {data.tables?.map((t) => (
                <div
                  key={t._id}
                  className="relative rounded-lg border border-stone-200 p-3 text-center text-xs font-medium bg-stone-50 text-stone-700 group hover:border-red-200"
                >
                  <button
                    onClick={() => deleteTable(t._id)}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-600 transition-opacity p-0.5"
                    title="Delete Table"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="text-sm font-semibold">T{t.tableNumber}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.15em] text-stone-500">
                    Cap {t.capacity || 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold">Create New Table</h2>
                <p className="mt-2 text-sm text-stone-500">
                  Add table records and generate QR codes for guest seating.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Table number
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
                  placeholder="Enter table number"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={newTableCapacity}
                  onChange={(e) => setNewTableCapacity(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
                />
              </div>
              <button
                onClick={createTable}
                disabled={createLoading || !newTableNumber}
                className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {createLoading ? "Creating table..." : "Create Table"}
              </button>
              {adminMessage && (
                <p className="rounded-xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700">
                  {adminMessage}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <h2 className="font-bold">QR Generator</h2>
            <p className="mt-2 text-sm text-stone-500">
              Admin-only QR links for table assignment.
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Select table
                </label>
                <select
                  value={selectedTable}
                  onChange={(e) => setSelectedTable(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3"
                >
                  {data.tables?.map((t) => (
                    <option key={t._id} value={t.tableNumber}>
                      Table {t.tableNumber}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={createQr}
                disabled={qrLoading || !selectedTable}
                className="rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {qrLoading ? "Generating..." : "Generate QR Link"}
              </button>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 text-sm">
                <p className="font-semibold">Guest landing URL</p>
                <p className="mt-2 break-all text-stone-600">{shareUrl}</p>
              </div>
              <div className="mx-auto flex h-44 w-44 items-center justify-center rounded-2xl border border-dashed bg-white p-3">
                <QRCodeCanvas
                  ref={qrCanvasRef}
                  value={shareUrl}
                  size={160}
                  level="H"
                  includeMargin
                />
              </div>
              <button
                onClick={exportQr}
                disabled={!selectedTable}
                className="w-full rounded-xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                Download QR PNG
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="font-bold">Menu Management</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-stone-500">
                  <th className="pb-2">Item</th>
                  <th className="pb-2">Category</th>
                  <th className="pb-2">Price</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {menu.map((m) => (
                  <tr key={m._id} className="border-b">
                    <td className="py-2 font-medium">{m.name}</td>
                    <td className="capitalize">{m.category}</td>
                    <td>₹{m.price}</td>
                    <td>{m.available ? "✅ Available" : "❌ Unavailable"}</td>
                    <td>
                      <button
                        onClick={() => toggleItem(m._id, m.available)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Toggle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/roi" className="text-sm text-brand-600 hover:underline">
            View ROI Calculator →
          </Link>
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
