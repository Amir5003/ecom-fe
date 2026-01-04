// Mock Data Loader Service
// Loads JSON data from public/mockData folder based on endpoint requests

import usersData from '@/public/mockData/users.json';
import productsData from '@/public/mockData/products.json';
import cartData from '@/public/mockData/cart.json';
import ordersData from '@/public/mockData/orders.json';
import storesData from '@/public/mockData/stores.json';
import vendorData from '@/public/mockData/vendor.json';

// Utility function to delay response (simulate network latency)
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data loader
export const mockDataLoader = {
  // ============ AUTH ENDPOINTS ============
  async login(email, password) {
    await delay();
    // Simple mock login validation
    if (email === 'vendor@example.com' || email === 'deepak@vendor.com') {
      return {
        success: true,
        token: 'mock_jwt_token_' + Date.now(),
        user: {
          _id: 'vendor_001',
          name: 'Rajesh Verma',
          email: email,
          role: 'vendor',
          businessName: 'Fresh Farms Co.',
          vendorSlug: 'fresh-farms-co'
        }
      };
    }
    if (email && email.includes('@')) {
      return {
        success: true,
        token: 'mock_jwt_token_' + Date.now(),
        user: usersData.currentUser
      };
    }
    throw new Error('Invalid credentials');
  },

  async register(data) {
    await delay();
    return {
      success: true,
      message: 'Registration successful. Please verify your email.',
      user: {
        _id: 'new_user_' + Date.now(),
        ...data,
        role: data.role || 'customer'
      }
    };
  },

  async verifyEmail(token) {
    await delay();
    return {
      success: true,
      message: 'Email verified successfully'
    };
  },

  async logout() {
    await delay(300);
    return { success: true };
  },

  async vendorSetup(data) {
    await delay();
    return {
      success: true,
      message: 'Vendor setup completed',
      vendorSlug: data.businessName.toLowerCase().replace(/\s+/g, '-')
    };
  },

  // ============ PRODUCT ENDPOINTS ============
  async getAllProducts(filters = {}) {
    await delay();
    let products = [...productsData.products];
    
    if (filters.search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.category) {
      products = products.filter(p => p.category === filters.category);
    }
    
    if (filters.vendor) {
      products = products.filter(p => p.vendor._id === filters.vendor);
    }
    
    // Limit results if specified
    const limit = filters.limit || 50;
    return {
      success: true,
      data: products.slice(0, limit),
      total: products.length
    };
  },

  async getProductById(id) {
    await delay();
    const product = productsData.products.find(p => p._id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    return { success: true, data: product };
  },

  async getProductsByVendor(vendorId) {
    await delay();
    const products = productsData.products.filter(p => p.vendor._id === vendorId);
    return { success: true, data: products };
  },

  async getMyProducts() {
    await delay();
    // Returns products for current vendor (mock vendor_001)
    return { success: true, data: vendorData.vendorProducts };
  },

  async createProduct(data) {
    await delay();
    const newProduct = {
      _id: 'prod_' + Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return { success: true, data: newProduct };
  },

  async updateProduct(id, data) {
    await delay();
    const product = productsData.products.find(p => p._id === id);
    if (!product) throw new Error('Product not found');
    const updated = { ...product, ...data, updatedAt: new Date().toISOString() };
    return { success: true, data: updated };
  },

  async deleteProduct(id) {
    await delay();
    return { success: true, message: 'Product deleted successfully' };
  },

  // ============ STORE ENDPOINTS ============
  async getStoreBySlug(slug) {
    await delay();
    const store = storesData.stores.find(s => s.slug === slug);
    if (!store) {
      throw new Error('Store not found');
    }
    return { success: true, data: store };
  },

  async getStoreProducts(slug) {
    await delay();
    const store = storesData.stores.find(s => s.slug === slug);
    if (!store) throw new Error('Store not found');
    return { success: true, data: storesData.storeProducts };
  },

  async getStoreReviews(slug) {
    await delay();
    return { success: true, data: storesData.storeReviews };
  },

  async submitStoreReview(slug, data) {
    await delay();
    const review = {
      _id: 'review_' + Date.now(),
      ...data,
      createdAt: new Date().toISOString()
    };
    return { success: true, data: review, message: 'Review submitted successfully' };
  },

  async getMyStore() {
    await delay();
    return { success: true, data: storesData.stores[0] };
  },

  // ============ CART ENDPOINTS ============
  async getCart() {
    await delay();
    return { success: true, data: cartData };
  },

  async addToCart(productId, quantity) {
    await delay();
    const product = productsData.products.find(p => p._id === productId);
    if (!product) throw new Error('Product not found');
    
    return {
      success: true,
      message: 'Item added to cart',
      data: {
        product,
        quantity,
        subtotal: product.price * quantity
      }
    };
  },

  async removeFromCart(productId) {
    await delay();
    return {
      success: true,
      message: 'Item removed from cart'
    };
  },

  async updateCartQuantity(productId, quantity) {
    await delay();
    const product = productsData.products.find(p => p._id === productId);
    if (!product) throw new Error('Product not found');
    
    return {
      success: true,
      message: 'Cart updated',
      data: {
        product,
        quantity,
        subtotal: product.price * quantity
      }
    };
  },

  async clearCart() {
    await delay();
    return {
      success: true,
      message: 'Cart cleared',
      data: { items: [], totalPrice: 0 }
    };
  },

  // ============ ORDER ENDPOINTS ============
  async createOrder(data) {
    await delay();
    const newOrder = {
      _id: 'order_' + Date.now(),
      ...data,
      status: 'pending',
      isDelivered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return { success: true, data: newOrder, message: 'Order created successfully' };
  },

  async getAllOrders() {
    await delay();
    return { success: true, data: ordersData.orders };
  },

  async getOrderById(id) {
    await delay();
    // Return mock order detail with vendor breakdown
    return { success: true, data: ordersData.orderDetail };
  },

  async updateOrderStatus(id, status) {
    await delay();
    return {
      success: true,
      message: 'Order status updated',
      data: { status }
    };
  },

  async getVendorOrders() {
    await delay();
    return { success: true, data: vendorData.vendorOrders };
  },

  async updateVendorOrderStatus(orderId, status) {
    await delay();
    return {
      success: true,
      message: 'Vendor order status updated',
      data: { status }
    };
  },

  // ============ VENDOR ENDPOINTS ============
  async getVendorProfile() {
    await delay();
    return { success: true, data: usersData.vendors[0] };
  },

  async updateVendorProfile(data) {
    await delay();
    return {
      success: true,
      message: 'Profile updated',
      data: { ...usersData.vendors[0], ...data }
    };
  },

  async updateVendorBankDetails(data) {
    await delay();
    return {
      success: true,
      message: 'Bank details updated',
      data
    };
  },

  async getVendorDashboard() {
    await delay();
    return { success: true, data: vendorData.vendorDashboard };
  },

  async getVendorEarnings() {
    await delay();
    return { success: true, data: vendorData.vendorEarnings };
  },

  async requestVendorPayout(amount) {
    await delay();
    if (amount < 100) {
      throw new Error('Minimum payout amount is ₹100');
    }
    return {
      success: true,
      message: 'Payout request submitted',
      data: {
        _id: 'payout_' + Date.now(),
        amount,
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    };
  },

  async getVendorReviews() {
    await delay();
    return { success: true, data: storesData.storeReviews };
  },

  // ============ ADMIN ENDPOINTS ============
  async getAdminDashboard() {
    await delay();
    return {
      success: true,
      data: {
        totalVendors: usersData.vendors.length,
        totalOrders: ordersData.orders.length,
        totalCustomers: usersData.customers.length,
        totalRevenue: 450000,
        pendingVendorApprovals: 2,
        pendingPayouts: 5
      }
    };
  },

  async getAllVendors() {
    await delay();
    return { success: true, data: usersData.vendors };
  },

  async getVendorDetails(vendorId) {
    await delay();
    const vendor = usersData.vendors.find(v => v._id === vendorId);
    if (!vendor) throw new Error('Vendor not found');
    return { success: true, data: vendor };
  },

  async approveVendor(vendorId) {
    await delay();
    return { success: true, message: 'Vendor approved' };
  },

  async rejectVendor(vendorId) {
    await delay();
    return { success: true, message: 'Vendor rejected' };
  },

  async suspendVendor(vendorId) {
    await delay();
    return { success: true, message: 'Vendor suspended' };
  },

  async activateVendor(vendorId) {
    await delay();
    return { success: true, message: 'Vendor activated' };
  },

  async deleteVendor(vendorId) {
    await delay();
    return { success: true, message: 'Vendor deleted' };
  },

  async getAllPayouts() {
    await delay();
    return { success: true, data: [] };
  },

  async approvePayout(payoutId) {
    await delay();
    return { success: true, message: 'Payout approved' };
  },

  async processPayout(payoutId) {
    await delay();
    return { success: true, message: 'Payout processed' };
  },

  async rejectPayout(payoutId) {
    await delay();
    return { success: true, message: 'Payout rejected' };
  }
};

export default mockDataLoader;
