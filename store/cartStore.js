/**
 * Cart Store
 * Manages shopping cart state globally
 */

import { create } from 'zustand';
import { cartService } from '@/services/api';

const useCartStore = create((set, get) => ({
  items: [],
  groupedByVendor: [],
  totalPrice: 0,
  totalItems: 0,
  loading: false,
  error: null,

  // Set cart data from API
  setCart: (cartData) => {
    set({
      items: cartData.items || [],
      groupedByVendor: cartData.cartSummary || [],
      totalPrice: cartData.totalPrice || 0,
      totalItems: cartData.totalItems || 0,
      error: null,
    });
  },

  // Fetch cart from backend and sync state
  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await cartService.getCart();
      set({
        items: data.items || [],
        groupedByVendor: data.cartSummary || [],
        totalPrice: data.totalPrice || 0,
        totalItems: data.totalItems || 0,
      });
      return data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load cart';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Add item via API then refresh cart
  addItem: async (productId, quantity = 1) => {
    set({ loading: true, error: null });
    try {
      await cartService.addToCart({ productId, quantity });
      return await get().fetchCart();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to add to cart';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Remove item then refresh cart
  removeItem: async (productId) => {
    set({ loading: true, error: null });
    try {
      await cartService.removeFromCart({ productId });
      return await get().fetchCart();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove item';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Update quantity via API then refresh cart
  updateQuantity: async (productId, quantity) => {
    set({ loading: true, error: null });
    try {
      await cartService.updateCartQuantity({ productId, quantity });
      return await get().fetchCart();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update quantity';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Clear cart via API and local state
  clearCart: async () => {
    set({ loading: true, error: null });
    try {
      await cartService.clearCart();
      set({
        items: [],
        groupedByVendor: [],
        totalPrice: 0,
        totalItems: 0,
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to clear cart';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Get cart summary by vendor
  getCartSummary: () => get().groupedByVendor,

  // Set loading state
  setLoading: (loading) => set({ loading }),

  // Set error
  setError: (error) => set({ error }),

  // Get total cart value
  getTotalPrice: () => get().totalPrice,

  // Get total items count
  getTotalItems: () => get().totalItems,

  // Check if cart is empty
  isEmpty: () => get().items.length === 0,
}));

export default useCartStore;
