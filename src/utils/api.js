// Pharmacy ERP API Service Client for FastAPI Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

/**
 * Helper to execute fetch requests with error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `HTTP Error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`[Backend API] Request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: async () => {
    try {
      const res = await fetch('http://localhost:8000/health');
      return res.ok;
    } catch {
      return false;
    }
  },

  // Medicines
  getMedicines: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category) query.append('category', params.category);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/medicines${qs}`);
  },

  getMedicine: (id) => request(`/medicines/${id}`),

  createMedicine: (data) => request('/medicines', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  updateMedicine: (id, data) => request(`/medicines/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }),

  deleteMedicine: (id) => request(`/medicines/${id}`, {
    method: 'DELETE'
  }),

  simulateDailySales: () => request('/medicines/simulate-daily-sales', {
    method: 'POST'
  }),

  triggerUrgentStockout: (sku) => request(`/medicines/${sku}/urgent-stockout`, {
    method: 'POST'
  }),

  // Vendors
  getVendors: () => request('/vendors'),
  getVendor: (id) => request(`/vendors/${id}`),
  getVendorCatalog: (id) => request(`/vendors/${id}/catalog`),

  // Orders & Tracking
  getOrders: (status = null) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/orders${qs}`);
  },

  getOrder: (poNumber) => request(`/orders/${poNumber}`),

  createOrder: (orderData) => request('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),

  advanceOrderStatus: (poNumber) => request(`/orders/${poNumber}/advance`, {
    method: 'PATCH'
  }),

  updateOrderStatus: (poNumber, status) => request(`/orders/${poNumber}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),

  toggleOrderDelayed: (poNumber) => request(`/orders/${poNumber}/toggle-delayed`, {
    method: 'PATCH'
  }),

  receiveGoods: (poNumber) => request(`/orders/${poNumber}/receive-goods`, {
    method: 'POST'
  }),

  // Analytics & Sizing
  getStockAudit: (bufferDays = 21) => request(`/analytics/stock-audit?buffer_days=${bufferDays}`),
  getDashboardSummary: () => request('/analytics/summary'),

  // Autonomous Negotiation AI
  simulateNegotiation: (data) => request('/negotiation/simulate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  runTournament: (data) => request('/negotiation/tournament', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Store Profile
  getStoreProfile: () => request('/store/profile'),
  updateStoreProfile: (data) => request('/store/profile', {
    method: 'PUT',
    body: JSON.stringify(data)
  }),
  resetDefaults: () => request('/store/reset-defaults', {
    method: 'POST'
  })
};

export default api;
