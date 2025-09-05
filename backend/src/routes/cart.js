const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} = require('../controllers/cartController'); // Importar el controlador real

/**
 * @route   GET /api/cart
 * @desc    Obtener el carrito del usuario
 * @access  Private
 */
router.get('/', authenticate, getCart);

/**
 * @route   POST /api/cart/add
 * @desc    Añadir producto al carrito
 * @access  Private
 */
router.post('/add', authenticate, addToCart);

/**
 * @route   PUT /api/cart/update
 * @desc    Actualizar cantidad de un producto en el carrito
 * @access  Private
 */
router.put('/update', authenticate, updateCartItem);

/**
 * @route   DELETE /api/cart/remove/:productId
 * @desc    Eliminar producto del carrito
 * @access  Private
 */
router.delete('/remove/:productId', authenticate, removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Vaciar el carrito
 * @access  Private
 */
router.delete('/', authenticate, clearCart);

module.exports = router;