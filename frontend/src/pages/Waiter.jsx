import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { SocketProvider, useSocket } from '../context/SocketContext';

function WaiterBoard() {
  const socket = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadOrders = () => api.get('/orders/active').then((r) => setOrders(r.data));

  useEffect(() => {
    loadOrders();
    if (!socket) return;
    socket.emit('join', { role: 'waiter' });
    socket.on('waiter:alert', (alert) => {
      setAlerts((prev) => [{ ...alert, id: Date.now() }, ...prev].slice(0, 20));
    });
    socket.on('order:update', loadOrders);
    socket.on('order:new', loadOrders);
    return () => {
      socket.off('waiter:alert');
      socket.off('order:update');
      socket.off('order:new');
    };
  }, [socket]);

  const dismiss = (id) => setAlerts((prev) => prev.filter((a) => a.id !== id));

  const markServed = async (orderId) => {
    await api.patch(`/orders/${orderId}/status`, { status: 'served' });
    loadOrders();
  };

  const alertIcon = { dish_ready: '🍽️', service_request: '🔔', payment: '💳' };
  const alertColor = { dish_ready: 'border-green-400 bg-green-50', service_request: 'border-warm-500 bg-warm-50', payment: 'border-blue-400 bg-blue-50' };

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="border-b border-blue-200 bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">💼</span>
          <div>
            <h1 className="text-xl font-bold text-blue-900">Waiter Portal</h1>
            <p className="text-sm text-stone-500">Real-time table alerts & dispatch</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-6">
        <h2 className="mb-4 text-lg font-bold text-stone-800">Live Alerts</h2>
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className={`flex items-center justify-between rounded-xl border-l-4 p-4 ${alertColor[a.type] || 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{alertIcon[a.type] || '🔔'}</span>
                <div>
                  <p className="font-bold">{a.message}</p>
                  <p className="text-xs text-stone-500 capitalize">{a.type?.replace('_', ' ')}</p>
                </div>
              </div>
              <button onClick={() => dismiss(a.id)} className="text-sm text-stone-400 hover:text-stone-600">Dismiss</button>
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="rounded-xl bg-white p-6 text-center text-stone-400">No alerts — all tables serviced</p>
          )}
        </div>

        <h2 className="mb-4 mt-8 text-lg font-bold text-stone-800">Ready for Dispatch</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {orders.filter((o) => o.status === 'ready').map((order) => (
            <div key={order._id} className="rounded-xl border border-green-200 bg-white p-4">
              <h3 className="font-bold">Table {order.tableNumber}</h3>
              <ul className="mt-2 text-sm text-stone-600">
                {order.items?.map((i, idx) => (
                  <li key={idx}>{i.quantity}x {i.name}</li>
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

  if (!isAuthenticated || user?.role !== 'waiter') {
    return <Navigate to="/login" replace />;
  }

  return (
    <SocketProvider role="waiter">
      <WaiterBoard />
    </SocketProvider>
  );
}
