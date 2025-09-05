const express = require('express');
const router = express.Router();

// Import routes
const authRoutes = require('./auth');
const productRoutes = require('./products');
const orderRoutes = require('./orders');
const cartRoutes = require('./cart');
const paymentRoutes = require('./payment');

// Register routes
router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/cart', cartRoutes);
router.use('/payment', paymentRoutes);

module.exports = router;