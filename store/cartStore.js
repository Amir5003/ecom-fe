/**
 * Cart Store
 * Manages shopping cart state globally
 */

import { create } from 'zustand';

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

  // Add item to cart (locally until confirmed from API)
  addItem: (product, quantity = 1) => {
    const currentItems = get().items;
    const existingItem = currentItems.find(
      (item) => item.product._id === product._id
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      set({ items: [...currentItems] });
    } else {
      set({ items: [...currentItems, { product, quantity }] });
    }
  },

  // Remove item from cart
  removeItem: (productId) => {
    set({ items: get().items.filter((item) => item.product._id !== productId) });
  },

  // Update item quantity
  updateQuantity: (productId, quantity) => {
    const items = get().items.map((item) =>
      item.product._id === productId ? { ...item, quantity } : item
    );
    set({ items });
  },

  // Clear cart
  clearCart: () => {
    set({
      items: [],
      groupedByVendor: [],
      totalPrice: 0,
      totalItems: 0,
    });
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
