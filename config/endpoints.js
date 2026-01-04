/**
 * API Configuration
 * All API endpoints are centralized here
 * Domain selection can be changed from this file
 */

const DOMAINS = {
  LOCAL: 'http://localhost:5001',
  STAGING: 'https://api-staging.example.com',
  PRODUCTION: 'https://api.example.com',
};

// Change this to switch between environments
const CURRENT_DOMAIN = DOMAINS.LOCAL;

const API_BASE_URL = `${CURRENT_DOMAIN}/api`;

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    VERIFY_EMAIL: `${API_BASE_URL}/auth/verify-email`,
    VENDOR_SETUP: `${API_BASE_URL}/auth/vendor-setup`,
  },

  // Product endpoints
  PRODUCTS: {
    GET_ALL: `${API_BASE_URL}/products`,
    GET_BY_ID: (id) => `${API_BASE_URL}/products/${id}`,
    GET_BY_VENDOR: (vendorId) => `${API_BASE_URL}/products/vendor/${vendorId}`,
    CREATE: `${API_BASE_URL}/products`,
    UPDATE: (id) => `${API_BASE_URL}/products/${id}`,
    DELETE: (id) => `${API_BASE_URL}/products/${id}`,
    GET_MY_PRODUCTS: `${API_BASE_URL}/products/my-products`,
  },

  // Store endpoints
  STORE: {
    GET_BY_SLUG: (slug) => `${API_BASE_URL}/store/${slug}`,
    GET_PRODUCTS: (slug) => `${API_BASE_URL}/store/${slug}/products`,
    GET_REVIEWS: (slug) => `${API_BASE_URL}/store/${slug}/reviews`,
    SUBMIT_REVIEW: (slug) => `${API_BASE_URL}/store/${slug}/reviews`,
    GET_MY_STORE: `${API_BASE_URL}/store/info/me`,
  },

  // Cart endpoints
  CART: {
    GET: `${API_BASE_URL}/cart`,
    ADD: `${API_BASE_URL}/cart/add`,
    REMOVE: `${API_BASE_URL}/cart/remove`,
    UPDATE_QUANTITY: `${API_BASE_URL}/cart/update`,
    CLEAR: `${API_BASE_URL}/cart`,
  },

  // Order endpoints
  ORDERS: {
    CREATE: `${API_BASE_URL}/orders`,
    GET_ALL: `${API_BASE_URL}/orders`,
    GET_BY_ID: (id) => `${API_BASE_URL}/orders/${id}`,
    UPDATE_STATUS: (id) => `${API_BASE_URL}/orders/${id}`,
    GET_VENDOR_ORDERS: `${API_BASE_URL}/orders/vendor/orders`,
    UPDATE_VENDOR_STATUS: (id) => `${API_BASE_URL}/orders/${id}/vendor-status`,
  },

  // Vendor endpoints
  VENDOR: {
    GET_PROFILE: `${API_BASE_URL}/vendor/profile`,
    UPDATE_PROFILE: `${API_BASE_URL}/vendor/profile`,
    UPDATE_BANK_DETAILS: `${API_BASE_URL}/vendor/bank-details`,
    GET_DASHBOARD: `${API_BASE_URL}/vendor/dashboard`,
    GET_ORDERS: `${API_BASE_URL}/vendor/orders`,
    UPDATE_ORDER_STATUS: (orderId) => `${API_BASE_URL}/vendor/orders/${orderId}/status`,
    GET_EARNINGS: `${API_BASE_URL}/vendor/earnings`,
    REQUEST_PAYOUT: `${API_BASE_URL}/vendor/payout-request`,
    GET_REVIEWS: `${API_BASE_URL}/vendor/reviews`,
  },

  // Admin endpoints
  ADMIN: {
    GET_DASHBOARD: `${API_BASE_URL}/admin/dashboard`,
    GET_ALL_VENDORS: `${API_BASE_URL}/admin/vendors`,
    GET_VENDOR_DETAILS: (vendorId) => `${API_BASE_URL}/admin/vendors/${vendorId}`,
    APPROVE_VENDOR: (vendorId) => `${API_BASE_URL}/admin/vendors/${vendorId}/approve`,
    REJECT_VENDOR: (vendorId) => `${API_BASE_URL}/admin/vendors/${vendorId}/reject`,
    SUSPEND_VENDOR: (vendorId) => `${API_BASE_URL}/admin/vendors/${vendorId}/suspend`,
    ACTIVATE_VENDOR: (vendorId) => `${API_BASE_URL}/admin/vendors/${vendorId}/activate`,
    DELETE_VENDOR: (vendorId) => `${API_BASE_URL}/admin/vendors/${vendorId}`,
    GET_ALL_PAYOUTS: `${API_BASE_URL}/admin/payouts`,
    APPROVE_PAYOUT: (payoutId) => `${API_BASE_URL}/admin/payouts/${payoutId}/approve`,
    PROCESS_PAYOUT: (payoutId) => `${API_BASE_URL}/admin/payouts/${payoutId}/process`,
    REJECT_PAYOUT: (payoutId) => `${API_BASE_URL}/admin/payouts/${payoutId}/reject`,
  },

  // Upload endpoints
  UPLOAD: {
    PRODUCT_IMAGE: `${CURRENT_DOMAIN}/api/products`,
  },
};

export const UPLOAD_BASE_URL = `${CURRENT_DOMAIN}/uploads`;

export default API_ENDPOINTS;
