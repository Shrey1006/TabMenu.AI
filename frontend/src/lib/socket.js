import io from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_IO_URL || "http://localhost:5000";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = {};
  }

  connect(role, tableId = null) {
    if (this.socket) return this.socket;

    this.socket = io(SOCKET_URL, {
      query: {
        role,
        table: tableId,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
      this.emit("user_joined", { role, tableId });
    });

    this.socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  on(event, callback) {
    if (this.socket) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(
          (cb) => cb !== callback,
        );
      }
    }
  }

  // Order events
  orderCreated(callback) {
    this.on("order:created", callback);
  }

  orderUpdated(callback) {
    this.on("order:updated", callback);
  }

  orderCompleted(callback) {
    this.on("order:completed", callback);
  }

  // Kitchen events
  kitchenOrderReceived(callback) {
    this.on("kitchen:order_received", callback);
  }

  kitchenOrderStart(callback) {
    this.on("kitchen:order_start", callback);
  }

  kitchenOrderReady(callback) {
    this.on("kitchen:order_ready", callback);
  }

  // Table events
  tableStatusChanged(callback) {
    this.on("table:status_changed", callback);
  }

  // Feedback events
  feedbackReceived(callback) {
    this.on("feedback:received", callback);
  }

  // Admin events
  dashboardUpdate(callback) {
    this.on("admin:dashboard_update", callback);
  }

  analyticsUpdate(callback) {
    this.on("admin:analytics_update", callback);
  }

  // Broadcast methods
  broadcastOrderStatus(orderId, status) {
    this.emit("order:status_update", { orderId, status });
  }

  broadcastTableUpdate(tableId, data) {
    this.emit("table:update", { tableId, ...data });
  }

  broadcastFeedback(feedback) {
    this.emit("feedback:submit", feedback);
  }
}

export default new SocketService();
