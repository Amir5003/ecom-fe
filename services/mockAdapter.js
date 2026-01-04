// Mock API Adapter
// Intercepts axios requests and returns mock data based on endpoint patterns

import mockDataLoader from './mockDataLoader';

/**
 * Mock adapter for axios that intercepts requests and returns mock data
 * Based on NEXT_PUBLIC_USE_MOCK_DATA environment variable
 */
export const createMockAdapter = () => {
  return {
    // Request interceptor - returns data immediately
    request: async (config) => {
      if (process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'true') {
        return config;
      }

      const { method, url, data } = config;
      const baseURL = config.baseURL || '';
      const fullUrl = url.replace(baseURL, '');

      console.log(`[MOCK] ${method?.toUpperCase()} ${fullUrl}`);

      try {
        let response = null;

        // AUTH ENDPOINTS
        if (method === 'post' && fullUrl.includes('/auth/login')) {
          const { email, password } = data;
          response = await mockDataLoader.login(email, password);
        }
        else if (method === 'post' && fullUrl.includes('/auth/register')) {
          response = await mockDataLoader.register(data);
        }
        else if (method === 'post' && fullUrl.includes('/auth/verify-email')) {
          response = await mockDataLoader.verifyEmail(data.token);
        }
        else if (method === 'post' && fullUrl.includes('/auth/logout')) {
          response = await mockDataLoader.logout();
        }
        else if (method === 'post' && fullUrl.includes('/auth/vendor-setup')) {
          response = await mockDataLoader.vendorSetup(data);
        }

        // PRODUCT ENDPOINTS
        else if (method === 'get' && fullUrl.includes('/products') && !fullUrl.includes('/my-products')) {
          const params = config.params || {};
          response = await mockDataLoader.getAllProducts(params);
        }
        else if (method === 'get' && fullUrl.match(/\/products\/[^/]+$/) && !fullUrl.includes('/my-products')) {
          const id = fullUrl.split('/').pop();
          response = await mockDataLoader.getProductById(id);
        }
        else if (method === 'get' && fullUrl.includes('/products/vendor/')) {
          const vendorId = fullUrl.split('/').pop();
          response = await mockDataLoader.getProductsByVendor(vendorId);
        }
        else if (method === 'get' && fullUrl.includes('/products/my-products')) {
          response = await mockDataLoader.getMyProducts();
        }
        else if (method === 'post' && fullUrl.includes('/products') && !fullUrl.includes('/')) {
          response = await mockDataLoader.createProduct(data);
        }
        else if (method === 'put' && fullUrl.match(/\/products\/[^/]+$/)) {
          const id = fullUrl.split('/').pop();
          response = await mockDataLoader.updateProduct(id, data);
        }
        else if (method === 'delete' && fullUrl.match(/\/products\/[^/]+$/)) {
          const id = fullUrl.split('/').pop();
          response = await mockDataLoader.deleteProduct(id);
        }

        // STORE ENDPOINTS
        else if (method === 'get' && fullUrl.includes('/store/') && !fullUrl.includes('/products')) {
          const slug = fullUrl.split('/').pop();
          response = await mockDataLoader.getStoreBySlug(slug);
        }
        else if (method === 'get' && fullUrl.includes('/store/') && fullUrl.includes('/products')) {
          const slug = fullUrl.split('/')[2];
          response = await mockDataLoader.getStoreProducts(slug);
        }
        else if (method === 'get' && fullUrl.includes('/store/') && fullUrl.includes('/reviews')) {
          const slug = fullUrl.split('/')[2];
          response = await mockDataLoader.getStoreReviews(slug);
        }
        else if (method === 'post' && fullUrl.includes('/store/') && fullUrl.includes('/review')) {
          const slug = fullUrl.split('/')[2];
          response = await mockDataLoader.submitStoreReview(slug, data);
        }
        else if (method === 'get' && fullUrl.includes('/store/my-store')) {
          response = await mockDataLoader.getMyStore();
        }

        // CART ENDPOINTS
        else if (method === 'get' && fullUrl.includes('/cart') && fullUrl === '/cart') {
          response = await mockDataLoader.getCart();
        }
        else if (method === 'post' && fullUrl.includes('/cart/add')) {
          const { productId, quantity } = data;
          response = await mockDataLoader.addToCart(productId, quantity);
        }
        else if (method === 'delete' && fullUrl.includes('/cart/remove')) {
          const productId = data.productId;
          response = await mockDataLoader.removeFromCart(productId);
        }
        else if (method === 'put' && fullUrl.includes('/cart/update')) {
          const { productId, quantity } = data;
          response = await mockDataLoader.updateCartQuantity(productId, quantity);
        }
        else if (method === 'delete' && fullUrl.includes('/cart/clear')) {
          response = await mockDataLoader.clearCart();
        }

        // ORDER ENDPOINTS
        else if (method === 'post' && fullUrl.includes('/orders') && !fullUrl.includes('/')) {
          response = await mockDataLoader.createOrder(data);
        }
        else if (method === 'get' && fullUrl.includes('/orders') && !fullUrl.includes('/')) {
          response = await mockDataLoader.getAllOrders();
        }
        else if (method === 'get' && fullUrl.match(/\/orders\/[^/]+$/) && !fullUrl.includes('/vendor')) {
          const id = fullUrl.split('/').pop();
          response = await mockDataLoader.getOrderById(id);
        }
        else if (method === 'put' && fullUrl.includes('/orders/') && fullUrl.includes('/status')) {
          const id = fullUrl.split('/')[2];
          response = await mockDataLoader.updateOrderStatus(id, data.status);
        }
        else if (method === 'get' && fullUrl.includes('/orders/vendor')) {
          response = await mockDataLoader.getVendorOrders();
        }
        else if (method === 'put' && fullUrl.includes('/orders/') && fullUrl.includes('/vendor-status')) {
          const id = fullUrl.split('/')[2];
          response = await mockDataLoader.updateVendorOrderStatus(id, data.status);
        }

        // VENDOR ENDPOINTS
        else if (method === 'get' && fullUrl.includes('/vendor/profile')) {
          response = await mockDataLoader.getVendorProfile();
        }
        else if (method === 'put' && fullUrl.includes('/vendor/profile')) {
          response = await mockDataLoader.updateVendorProfile(data);
        }
        else if (method === 'put' && fullUrl.includes('/vendor/bank')) {
          response = await mockDataLoader.updateVendorBankDetails(data);
        }
        else if (method === 'get' && fullUrl.includes('/vendor/dashboard')) {
          response = await mockDataLoader.getVendorDashboard();
        }
        else if (method === 'get' && fullUrl.includes('/vendor/earnings')) {
          response = await mockDataLoader.getVendorEarnings();
        }
        else if (method === 'post' && fullUrl.includes('/vendor/payout')) {
          response = await mockDataLoader.requestVendorPayout(data.amount);
        }
        else if (method === 'get' && fullUrl.includes('/vendor/reviews')) {
          response = await mockDataLoader.getVendorReviews();
        }

        // ADMIN ENDPOINTS
        else if (method === 'get' && fullUrl.includes('/admin/dashboard')) {
          response = await mockDataLoader.getAdminDashboard();
        }
        else if (method === 'get' && fullUrl.includes('/admin/vendors')) {
          response = await mockDataLoader.getAllVendors();
        }
        else if (method === 'get' && fullUrl.includes('/admin/vendor/')) {
          const vendorId = fullUrl.split('/').pop();
          response = await mockDataLoader.getVendorDetails(vendorId);
        }
        else if (method === 'put' && fullUrl.includes('/admin/vendor/') && fullUrl.includes('/approve')) {
          const vendorId = fullUrl.split('/')[3];
          response = await mockDataLoader.approveVendor(vendorId);
        }
        else if (method === 'put' && fullUrl.includes('/admin/vendor/') && fullUrl.includes('/reject')) {
          const vendorId = fullUrl.split('/')[3];
          response = await mockDataLoader.rejectVendor(vendorId);
        }
        else if (method === 'put' && fullUrl.includes('/admin/vendor/') && fullUrl.includes('/suspend')) {
          const vendorId = fullUrl.split('/')[3];
          response = await mockDataLoader.suspendVendor(vendorId);
        }
        else if (method === 'put' && fullUrl.includes('/admin/vendor/') && fullUrl.includes('/activate')) {
          const vendorId = fullUrl.split('/')[3];
          response = await mockDataLoader.activateVendor(vendorId);
        }
        else if (method === 'delete' && fullUrl.includes('/admin/vendor/')) {
          const vendorId = fullUrl.split('/').pop();
          response = await mockDataLoader.deleteVendor(vendorId);
        }
        else if (method === 'get' && fullUrl.includes('/admin/payouts')) {
          response = await mockDataLoader.getAllPayouts();
        }
        else if (method === 'put' && fullUrl.includes('/admin/payout/') && fullUrl.includes('/approve')) {
          const payoutId = fullUrl.split('/')[3];
          response = await mockDataLoader.approvePayout(payoutId);
        }
        else if (method === 'put' && fullUrl.includes('/admin/payout/') && fullUrl.includes('/process')) {
          const payoutId = fullUrl.split('/')[3];
          response = await mockDataLoader.processPayout(payoutId);
        }
        else if (method === 'put' && fullUrl.includes('/admin/payout/') && fullUrl.includes('/reject')) {
          const payoutId = fullUrl.split('/')[3];
          response = await mockDataLoader.rejectPayout(payoutId);
        }

        if (response) {
          console.log(`[MOCK] Response:`, response);
          // Return mocked response by throwing error with data property
          // This will be caught by response interceptor
          return {
            ...config,
            __isMockResponse: true,
            __mockData: response
          };
        }

        console.warn(`[MOCK] No mock data for: ${method?.toUpperCase()} ${fullUrl}`);
        return config;
      } catch (error) {
        console.error(`[MOCK] Error in request:`, error);
        return {
          ...config,
          __isMockError: true,
          __mockError: error
        };
      }
    }
  };
};

/**
 * Response handler for mock adapter
 * Converts mock config back to response
 */
export const handleMockResponse = (response) => {
  if (response.config?.__isMockResponse) {
    return {
      ...response,
      data: response.config.__mockData,
      status: 200,
      statusText: 'OK (Mock)'
    };
  }
  return response;
};

/**
 * Error handler for mock adapter
 */
export const handleMockError = (error) => {
  if (error.config?.__isMockError) {
    const mockError = error.config.__mockError;
    const axiosError = new Error(mockError.message);
    axiosError.response = {
      status: 400,
      data: {
        success: false,
        message: mockError.message
      }
    };
    throw axiosError;
  }
  throw error;
};
