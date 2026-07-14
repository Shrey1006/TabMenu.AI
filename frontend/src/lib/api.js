import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Authentication endpoints
export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
  register: (data) => api.post("/auth/register", data),
  logout: () => {
    localStorage.removeItem("token");
  },
  verifyToken: () => api.get("/auth/verify"),
};

// Menu endpoints
export const menuAPI = {
  getMenus: () => api.get("/menu"),
  getMenuById: (id) => api.get(`/menu/${id}`),
  createMenu: (data) => api.post("/menu", data),
  updateMenu: (id, data) => api.patch(`/menu/${id}`, data),
  deleteMenu: (id) => api.delete(`/menu/${id}`),
};

// Table endpoints
export const tablesAPI = {
  getTables: () => api.get("/tables"),
  getTableById: (id) => api.get(`/tables/${id}`),
  verifyQRToken: (token) => api.post("/tables/verify-qr", { token }),
  updateTableStatus: (id, status) => api.patch(`/tables/${id}`, { status }),
};

// Order endpoints
export const ordersAPI = {
  createOrder: (data) => api.post("/orders", data),
  getOrders: () => api.get("/orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}`, { status }),
  getTableOrders: (tableId) => api.get(`/orders/table/${tableId}`),
};

// Feedback endpoints
export const feedbackAPI = {
  submitFeedback: (data) => api.post("/feedback", data),
  getFeedback: () => api.get("/feedback"),
  getTableFeedback: (tableId) => api.get(`/feedback/table/${tableId}`),
};

// Admin endpoints
export const adminAPI = {
  getDashboardStats: () => api.get("/admin/stats"),
  getOrderAnalytics: () => api.get("/admin/analytics/orders"),
  getTableAnalytics: () => api.get("/admin/analytics/tables"),
  getSentimentAnalytics: () => api.get("/admin/analytics/sentiment"),
  exportData: (format) => api.get(`/admin/export?format=${format}`),
};

export default api;
