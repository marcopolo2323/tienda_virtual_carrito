const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, isAdmin } = require('../middlewares/auth');

// Rutas protegidas de órdenes (usuario)
router.get('/my-orders', authenticate, orderController.getUserOrders);
router.post('/', authenticate, orderController.createOrder);
router.get('/:id', authenticate, orderController.getOrderById);

// Rutas protegidas de órdenes (admin)
router.get('/', authenticate, isAdmin, orderController.getAllOrders);
router.put('/:id/status', authenticate, isAdmin, orderController.updateOrderStatus);
router.put('/:id/payment', authenticate, isAdmin, orderController.updatePaymentStatus);

module.exports = router;