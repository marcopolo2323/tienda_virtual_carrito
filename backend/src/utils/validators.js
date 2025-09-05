/**
 * Utility functions for data validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with isValid and message
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) { // ✅ CAMBIAR: tu modelo User requiere mínimo 6, no 8
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }

  // Hacer validación menos estricta para que coincida con tu seeder
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  if (!hasLetter || !hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter and one number'
    };
  }

  return {
    isValid: true,
    message: 'Password is valid'
  };
};

/**
 * Validate product data
 * @param {Object} product - Product data
 * @returns {Object} Validation result with isValid and errors
 */
const validateProduct = (product) => {
  const errors = {};

  if (!product.name || product.name.trim() === '') {
    errors.name = 'Product name is required';
  }

  if (!product.price || isNaN(product.price) || product.price <= 0) {
    errors.price = 'Product price must be a positive number';
  }

  if (product.stock !== undefined && (isNaN(product.stock) || product.stock < 0)) {
    errors.stock = 'Product stock must be a non-negative number';
  }

  if (product.category_id && (isNaN(product.category_id) || product.category_id <= 0)) { // ✅ CAMBIAR: categoryId → category_id
    errors.category_id = 'Category must be a valid ID';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate order data
 * @param {Object} order - Order data
 * @returns {Object} Validation result with isValid and errors
 */
const validateOrder = (order) => {
  const errors = {};

  if (!order.user_id) { // ✅ CAMBIAR: userId → user_id
    errors.user_id = 'User ID is required';
  }

  if (!order.shipping_address || order.shipping_address.trim() === '') { // ✅ CAMBIAR: shippingAddress → shipping_address
    errors.shipping_address = 'Shipping address is required';
  }

  if (!order.payment_method || order.payment_method.trim() === '') { // ✅ CAMBIAR: paymentMethod → payment_method
    errors.payment_method = 'Payment method is required';
  }

  if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
    errors.items = 'Order must contain at least one item';
  } else {
    // Validate each item
    const itemErrors = [];
    order.items.forEach((item, index) => {
      const itemError = {};
      
      if (!item.product_id) { // ✅ CAMBIAR: productId → product_id
        itemError.product_id = 'Product ID is required';
      }
      
      if (!item.quantity || isNaN(item.quantity) || item.quantity <= 0) {
        itemError.quantity = 'Quantity must be a positive number';
      }
      
      if (Object.keys(itemError).length > 0) {
        itemErrors[index] = itemError;
      }
    });
    
    if (itemErrors.length > 0) {
      errors.items = itemErrors;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user data
 * @param {Object} user - User data
 * @returns {Object} Validation result with isValid and errors
 */
const validateUser = (user) => {
  const errors = {};

  if (!user.username || user.username.trim().length < 3) {
    errors.username = 'Username must be at least 3 characters long';
  }

  if (!user.email || !isValidEmail(user.email)) {
    errors.email = 'Valid email is required';
  }

  if (!user.first_name || user.first_name.trim() === '') {
    errors.first_name = 'First name is required';
  }

  if (!user.last_name || user.last_name.trim() === '') {
    errors.last_name = 'Last name is required';
  }

  if (user.phone && (user.phone.length < 7 || user.phone.length > 20)) {
    errors.phone = 'Phone must be between 7 and 20 characters';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  isValidEmail,
  validatePassword,
  validateProduct,
  validateOrder,
  validateUser // ✅ AGREGAR: nueva función de validación
};