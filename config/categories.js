/**
 * Categories Configuration
 * Defines all product categories, vendor types, and their relationships
 */

export const PRODUCT_CATEGORIES = {
  vegetables: {
    id: "vegetables",
    name: "Vegetables",
    icon: "🥬",
    description: "Fresh vegetables from farms",
    color: "#4CAF50"
  },
  fruits: {
    id: "fruits",
    name: "Fruits",
    icon: "🍎",
    description: "Fresh & seasonal fruits",
    color: "#FF6B6B"
  },
  dairy: {
    id: "dairy",
    name: "Dairy & Eggs",
    icon: "🥛",
    description: "Milk, cheese, yogurt & eggs",
    color: "#FFD93D"
  },
  bakery: {
    id: "bakery",
    name: "Bakery & Grains",
    icon: "🥖",
    description: "Bread, rice, flour & grains",
    color: "#CD7F32"
  },
  meat: {
    id: "meat",
    name: "Meat & Fish",
    icon: "🍗",
    description: "Fresh meat, poultry & fish",
    color: "#A0522D"
  },
  spices: {
    id: "spices",
    name: "Spices & Condiments",
    icon: "🌶️",
    description: "Spices, sauces & condiments",
    color: "#FF4500"
  },
  snacks: {
    id: "snacks",
    name: "Snacks & Beverages",
    icon: "🍿",
    description: "Snacks, tea, coffee & drinks",
    color: "#8B4513"
  },
  organic: {
    id: "organic",
    name: "Organic & Health",
    icon: "🌿",
    description: "100% organic & healthy products",
    color: "#228B22"
  }
};

export const VENDOR_BUSINESS_TYPES = {
  organic_farm: {
    id: "organic_farm",
    name: "Organic Farm",
    icon: "🌾",
    description: "Certified organic farming operations",
    categories: ["vegetables", "fruits", "organic", "spices"],
    deliveryTime: "2-3 days",
    defaultCommission: 10
  },
  general_store: {
    id: "general_store",
    name: "General Store",
    icon: "🏪",
    description: "Multi-category convenience store",
    categories: ["vegetables", "fruits", "bakery", "spices", "snacks", "dairy"],
    deliveryTime: "1-2 days",
    defaultCommission: 8
  },
  dairy_shop: {
    id: "dairy_shop",
    name: "Dairy Shop",
    icon: "🐄",
    description: "Dairy and milk products specialist",
    categories: ["dairy"],
    deliveryTime: "Same day",
    defaultCommission: 9
  },
  bakery_shop: {
    id: "bakery_shop",
    name: "Bakery Shop",
    icon: "🥐",
    description: "Fresh baked goods and bread",
    categories: ["bakery"],
    deliveryTime: "2 hours",
    defaultCommission: 11
  },
  meat_shop: {
    id: "meat_shop",
    name: "Meat Shop",
    icon: "🍗",
    description: "Fresh meat and poultry products",
    categories: ["meat"],
    deliveryTime: "1-2 hours",
    defaultCommission: 13
  },
  seafood_shop: {
    id: "seafood_shop",
    name: "Seafood Shop",
    icon: "🐟",
    description: "Fresh seafood and fish products",
    categories: ["meat"],
    deliveryTime: "Same day",
    defaultCommission: 13
  },
  grocery_store: {
    id: "grocery_store",
    name: "Grocery Store",
    icon: "🛒",
    description: "Full service grocery supermarket",
    categories: ["vegetables", "fruits", "bakery", "spices", "snacks", "dairy", "organic"],
    deliveryTime: "Next day",
    defaultCommission: 7
  },
  specialty_shop: {
    id: "specialty_shop",
    name: "Specialty Shop",
    icon: "⭐",
    description: "Specialized products and gourmet items",
    categories: ["spices", "organic", "snacks"],
    deliveryTime: "2-3 days",
    defaultCommission: 15
  }
};

/**
 * Get category object by ID
 */
export const getCategoryById = (categoryId) => {
  return PRODUCT_CATEGORIES[categoryId] || null;
};

/**
 * Get all categories as array
 */
export const getAllCategories = () => {
  return Object.values(PRODUCT_CATEGORIES);
};

/**
 * Get vendor type object by ID
 */
export const getVendorTypeById = (typeId) => {
  return VENDOR_BUSINESS_TYPES[typeId] || null;
};

/**
 * Get all vendor types as array
 */
export const getAllVendorTypes = () => {
  return Object.values(VENDOR_BUSINESS_TYPES);
};

/**
 * Get categories available for a vendor type
 */
export const getCategoriesForVendorType = (vendorTypeId) => {
  const vendorType = getVendorTypeById(vendorTypeId);
  if (!vendorType) return [];
  
  return vendorType.categories
    .map(catId => getCategoryById(catId))
    .filter(cat => cat !== null);
};

/**
 * Check if vendor type supports a category
 */
export const vendorSupportsCategory = (vendorTypeId, categoryId) => {
  const vendorType = getVendorTypeById(vendorTypeId);
  if (!vendorType) return false;
  
  return vendorType.categories.includes(categoryId);
};

/**
 * Get default commission rate for vendor type
 */
export const getDefaultCommission = (vendorTypeId) => {
  const vendorType = getVendorTypeById(vendorTypeId);
  return vendorType?.defaultCommission || 10;
};

/**
 * Get default delivery time for vendor type
 */
export const getDefaultDeliveryTime = (vendorTypeId) => {
  const vendorType = getVendorTypeById(vendorTypeId);
  return vendorType?.deliveryTime || "2-3 days";
};

/**
 * Filter vendors by business type
 */
export const filterVendorsByType = (vendors, businessType) => {
  if (!businessType) return vendors;
  return vendors.filter(vendor => vendor.businessType === businessType);
};

/**
 * Filter vendors by supported category
 */
export const filterVendorsByCategory = (vendors, categoryId) => {
  if (!categoryId) return vendors;
  
  return vendors.filter(vendor => {
    if (!vendor.categories) return false;
    return vendor.categories.includes(categoryId);
  });
};

/**
 * Get vendors that support multiple categories
 */
export const filterVendorsByCategories = (vendors, categoryIds) => {
  if (!categoryIds || categoryIds.length === 0) return vendors;
  
  return vendors.filter(vendor => {
    if (!vendor.categories) return false;
    // Check if vendor supports at least one of the categories
    return categoryIds.some(catId => vendor.categories.includes(catId));
  });
};

export default {
  PRODUCT_CATEGORIES,
  VENDOR_BUSINESS_TYPES,
  getCategoryById,
  getAllCategories,
  getVendorTypeById,
  getAllVendorTypes,
  getCategoriesForVendorType,
  vendorSupportsCategory,
  getDefaultCommission,
  getDefaultDeliveryTime,
  filterVendorsByType,
  filterVendorsByCategory,
  filterVendorsByCategories
};
