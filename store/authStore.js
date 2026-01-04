/**
 * Authentication Store
 * Manages user authentication state globally
 */

import { create } from 'zustand';
import { getCookie, setCookie, deleteCookie } from 'cookies-next';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  // Initialize from cookies
  initialize: () => {
    const token = getCookie('jwt_token');
    const userData = getCookie('user_data');
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        set({ user, token, isAuthenticated: true });
      } catch (e) {
        set({ isAuthenticated: false });
      }
    }
  },

  // Set user after login
  setUser: (user, token) => {
    setCookie('jwt_token', token, { maxAge: 30 * 24 * 60 * 60 });
    setCookie('user_data', JSON.stringify(user), { maxAge: 30 * 24 * 60 * 60 });
    set({ user, token, isAuthenticated: true, error: null });
  },

  // Clear user on logout
  clearUser: () => {
    deleteCookie('jwt_token');
    deleteCookie('user_data');
    set({ user: null, token: null, isAuthenticated: false });
  },

  // Update user data
  updateUser: (updatedUser) => {
    const currentUser = get().user;
    const newUser = { ...currentUser, ...updatedUser };
    setCookie('user_data', JSON.stringify(newUser), { maxAge: 30 * 24 * 60 * 60 });
    set({ user: newUser });
  },

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Check if user is vendor
  isVendor: () => get().user?.role === 'vendor',

  // Check if user is admin
  isAdmin: () => get().user?.role === 'admin',

  // Check if user is customer
  isCustomer: () => get().user?.role === 'customer',

  // Get vendor slug
  getVendorSlug: () => get().user?.vendorSlug || null,
}));

export default useAuthStore;
