/**
 * App Store
 * Manages global app state
 */

import { create } from 'zustand';

const useAppStore = create((set) => ({
  sidebarOpen: false,
  isDarkMode: false,
  selectedVendor: null,
  filterParams: {
    search: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
    sortBy: 'newest',
  },

  // Toggle sidebar
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // Toggle dark mode
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),

  // Set selected vendor
  setSelectedVendor: (vendor) => set({ selectedVendor: vendor }),

  // Update filter params
  setFilterParams: (params) => set({ filterParams: params }),
  updateFilterParams: (newParams) => {
    set((state) => ({
      filterParams: { ...state.filterParams, ...newParams },
    }));
  },

  // Reset filters
  resetFilters: () => {
    set({
      filterParams: {
        search: '',
        category: '',
        minPrice: 0,
        maxPrice: 1000,
        sortBy: 'newest',
      },
    });
  },
}));

export default useAppStore;
