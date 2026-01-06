/**
 * API Service with Axios
 * Handles all HTTP requests to the backend
 * Includes error handling and JWT token management
 * Supports mock data mode for testing without backend
 */

import axios from 'axios';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';
import API_ENDPOINTS from '@/config/endpoints';
import { createMockAdapter, handleMockResponse, handleMockError } from './mockAdapter';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup mock adapter if enabled
const mockAdapter = createMockAdapter();

// Request interceptor - Add JWT token to headers and handle mock mode
api.interceptors.request.use(
  async (config) => {
    // Add JWT token
    const token = getCookie('jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Handle mock mode
    if (process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true') {
      const mockConfig = await mockAdapter.request(config);
      return mockConfig;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors and mock responses
api.interceptors.response.use(
  (response) => {
    // Handle mock response
    if (response.config?.__isMockResponse) {
      return handleMockResponse(response);
    }
    return response;
  },
  (error) => {
    // Handle mock error
    if (error.config?.__isMockError) {
      return handleMockError(error);
    }
    
    // If token expired, clear it and redirect to login
    // BUT: Don't redirect if we're already on the login/register/verify page
    if (error.response?.status === 401) {
      // Check if this is a login/register/verify endpoint call (not a token expiry issue)
      const isAuthEndpoint = error.config?.url?.includes('/api/auth/');
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthPage = currentPath.includes('/auth/');
      
      // Only redirect if:
      // 1. It's NOT an auth endpoint call (token expiry during normal operations)
      // 2. We're NOT already on an auth page
      if (!isAuthEndpoint && !isAuthPage) {
        deleteCookie('jwt_token');
        deleteCookie('user_data');
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

/**
 * AUTH SERVICE
 */
export const authService = {
  register: (data) => api.post(API_ENDPOINTS.AUTH.REGISTER, data),
  login: (data) => api.post(API_ENDPOINTS.AUTH.LOGIN, data),
  logout: () => api.post(API_ENDPOINTS.AUTH.LOGOUT),
  verifyEmail: (email, verificationCode) => api.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, verificationCode }),
  resendVerificationCode: (email) => api.post(`${API_ENDPOINTS.AUTH.VERIFY_EMAIL}/resend`, { email }),
  vendorSetup: (data) =>
    api.post(API_ENDPOINTS.AUTH.VENDOR_SETUP, data, {
      headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    }),
  getVendorStatus: () => api.get('/auth/vendor-status'),
};

/**
 * PRODUCT SERVICE
 */
export const productService = {
  getAllProducts: (params) => api.get(API_ENDPOINTS.PRODUCTS.GET_ALL, { params }),
  getProductById: (id) => api.get(API_ENDPOINTS.PRODUCTS.GET_BY_ID(id)),
  getProductsByVendor: (vendorId, params) =>
    api.get(API_ENDPOINTS.PRODUCTS.GET_BY_VENDOR(vendorId), { params }),
  createProduct: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      if (key === 'image' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (key !== 'image') {
        formData.append(key, data[key]);
      }
    });
    return api.post(API_ENDPOINTS.PRODUCTS.CREATE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  updateProduct: (id, data) => api.put(API_ENDPOINTS.PRODUCTS.UPDATE(id), data),
  deleteProduct: (id) => api.delete(API_ENDPOINTS.PRODUCTS.DELETE(id)),
  getMyProducts: (params) => api.get(API_ENDPOINTS.PRODUCTS.GET_MY_PRODUCTS, { params }),
};

/**
 * STORE SERVICE
 */
export const storeService = {
  getAllStores: (params) => api.get(API_ENDPOINTS.STORE.GET_ALL, { params }),
  validateName: (name) => api.get(API_ENDPOINTS.STORE.VALIDATE_NAME, { params: { name } }),
  getStoreBySlug: (slug) => api.get(API_ENDPOINTS.STORE.GET_BY_SLUG(slug)),
  getStoreProducts: (slug, params) =>
    api.get(API_ENDPOINTS.STORE.GET_PRODUCTS(slug), { params }),
  getStoreReviews: (slug, params) =>
    api.get(API_ENDPOINTS.STORE.GET_REVIEWS(slug), { params }),
  submitStoreReview: (slug, data) =>
    api.post(API_ENDPOINTS.STORE.SUBMIT_REVIEW(slug), data),
  getMyStore: () => api.get(API_ENDPOINTS.STORE.GET_MY_STORE),
};

/**
 * CART SERVICE
 */
export const cartService = {
  getCart: () => api.get(API_ENDPOINTS.CART.GET),
  addToCart: (data) => api.post(API_ENDPOINTS.CART.ADD, data),
  removeFromCart: (data) => api.delete(API_ENDPOINTS.CART.REMOVE, { data }),
  updateCartQuantity: (data) => api.put(API_ENDPOINTS.CART.UPDATE_QUANTITY, data),
  clearCart: () => api.delete(API_ENDPOINTS.CART.CLEAR),
};

/**
 * ORDER SERVICE
 */
export const orderService = {
  createOrder: (data) => api.post(API_ENDPOINTS.ORDERS.CREATE, data),
  getAllOrders: (params) => api.get(API_ENDPOINTS.ORDERS.GET_ALL, { params }),
  getOrderById: (id) => api.get(API_ENDPOINTS.ORDERS.GET_BY_ID(id)),
  updateOrderStatus: (id, data) => api.put(API_ENDPOINTS.ORDERS.UPDATE_STATUS(id), data),
  getVendorOrders: (params) => api.get(API_ENDPOINTS.ORDERS.GET_VENDOR_ORDERS, { params }),
  updateVendorOrderStatus: (id, data) =>
    api.put(API_ENDPOINTS.ORDERS.UPDATE_VENDOR_STATUS(id), data),
};

/**
 * VENDOR SERVICE
 */
export const vendorService = {
  getProfile: () => api.get(API_ENDPOINTS.VENDOR.GET_PROFILE),
  updateProfile: (data) => api.put(API_ENDPOINTS.VENDOR.UPDATE_PROFILE, data),
  updateBankDetails: (data) => api.put(API_ENDPOINTS.VENDOR.UPDATE_BANK_DETAILS, data),
  getDashboard: () => api.get(API_ENDPOINTS.VENDOR.GET_DASHBOARD),
  getOrders: (params) => api.get(API_ENDPOINTS.VENDOR.GET_ORDERS, { params }),
  updateOrderStatus: (orderId, data) =>
    api.put(API_ENDPOINTS.VENDOR.UPDATE_ORDER_STATUS(orderId), data),
  getEarnings: (params) => api.get(API_ENDPOINTS.VENDOR.GET_EARNINGS, { params }),
  requestPayout: (data) => api.post(API_ENDPOINTS.VENDOR.REQUEST_PAYOUT, data),
  getReviews: (params) => api.get(API_ENDPOINTS.VENDOR.GET_REVIEWS, { params }),
};

/**
 * ADMIN SERVICE
 */
export const adminService = {
  getDashboard: () => api.get(API_ENDPOINTS.ADMIN.GET_DASHBOARD),
  getAllVendors: (params) => api.get(API_ENDPOINTS.ADMIN.GET_ALL_VENDORS, { params }),
  getVendorDetails: (vendorId) => api.get(API_ENDPOINTS.ADMIN.GET_VENDOR_DETAILS(vendorId)),
  approveVendor: (vendorId) => api.put(API_ENDPOINTS.ADMIN.APPROVE_VENDOR(vendorId)),
  rejectVendor: (vendorId, data) =>
    api.put(API_ENDPOINTS.ADMIN.REJECT_VENDOR(vendorId), data),
  suspendVendor: (vendorId, data) =>
    api.put(API_ENDPOINTS.ADMIN.SUSPEND_VENDOR(vendorId), data),
  activateVendor: (vendorId) => api.put(API_ENDPOINTS.ADMIN.ACTIVATE_VENDOR(vendorId)),
  deleteVendor: (vendorId) => api.delete(API_ENDPOINTS.ADMIN.DELETE_VENDOR(vendorId)),
  getAllPayouts: (params) => api.get(API_ENDPOINTS.ADMIN.GET_ALL_PAYOUTS, { params }),
  approvePayout: (payoutId) => api.put(API_ENDPOINTS.ADMIN.APPROVE_PAYOUT(payoutId)),
  processPayout: (payoutId, data) =>
    api.put(API_ENDPOINTS.ADMIN.PROCESS_PAYOUT(payoutId), data),
  rejectPayout: (payoutId, data) =>
    api.put(API_ENDPOINTS.ADMIN.REJECT_PAYOUT(payoutId), data),
};

export default api;
