const { Cart, CartItem, Product } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { MESSAGES } = require('../utils/constants');
const logger = require('../utils/logger');

/**
 * Obtener el carrito del usuario
 */
const getCart = async (req, res) => {
  try {
    // Buscar o crear el carrito del usuario
    const [cart, created] = await Cart.findOrCreate({
      where: { user_id: req.user.id },
      include: [
        {
          model: CartItem,
          include: [Product], // IMPORTANTE: Incluir datos del producto
        }
      ]
    });

    // Calcular el total del carrito
    let total = 0;
    const items = cart.CartItems || [];
    
    if (items.length > 0) {
      total = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);
    }

    // Estructura que espera el frontend
    return successResponse(res, 'Carrito obtenido con éxito', {
      id: cart.id,
      items: items,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    logger.error('Error al obtener carrito', { 
      error: error.message, 
      userId: req.user?.id,
      stack: error.stack 
    });
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

/**
 * Añadir producto al carrito
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity <= 0) {
      return errorResponse(res, 'Se requiere ID de producto y cantidad válida', 400);
    }

    // Verificar si el producto existe y tiene stock suficiente
    const product = await Product.findByPk(productId);
    if (!product) {
      return errorResponse(res, MESSAGES.PRODUCT_NOT_FOUND, 404);
    }

    if (product.stock < quantity) {
      return errorResponse(res, MESSAGES.INSUFFICIENT_STOCK, 400);
    }

    // Buscar o crear el carrito del usuario
    const [cart] = await Cart.findOrCreate({
      where: { user_id: req.user.id }
    });

    // Verificar si el producto ya está en el carrito
    let cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id: productId
      }
    });

    if (cartItem) {
      // Actualizar cantidad si ya existe
      cartItem.quantity += quantity;
      cartItem.price = product.price; // Actualizar precio por si ha cambiado
      await cartItem.save();
    } else {
      // Crear nuevo item en el carrito
      cartItem = await CartItem.create({
        cart_id: cart.id,
        product_id: productId,
        quantity,
        price: product.price
      });
    }

    // Devolver el carrito completo actualizado
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    });

    const total = updatedCart.CartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    return successResponse(res, 'Producto añadido al carrito', {
      id: updatedCart.id,
      items: updatedCart.CartItems,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    logger.error('Error al añadir al carrito', { 
      error: error.message, 
      userId: req.user?.id,
      productId: req.body?.productId,
      stack: error.stack
    });
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

/**
 * Actualizar cantidad de un producto en el carrito
 */
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return errorResponse(res, 'Se requiere ID de producto y cantidad', 400);
    }

    if (quantity <= 0) {
      return errorResponse(res, 'Para eliminar un producto use la ruta /remove', 400);
    }

    // Buscar el carrito del usuario
    const cart = await Cart.findOne({
      where: { user_id: req.user.id }
    });

    if (!cart) {
      return errorResponse(res, 'Carrito no encontrado', 404);
    }

    // Verificar si el producto existe y tiene stock suficiente
    const product = await Product.findByPk(productId);
    if (!product) {
      return errorResponse(res, MESSAGES.PRODUCT_NOT_FOUND, 404);
    }

    if (product.stock < quantity) {
      return errorResponse(res, MESSAGES.INSUFFICIENT_STOCK, 400);
    }

    // Buscar el item en el carrito
    const cartItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        product_id: productId
      }
    });

    if (!cartItem) {
      return errorResponse(res, 'Producto no encontrado en el carrito', 404);
    }

    // Actualizar cantidad
    cartItem.quantity = quantity;
    cartItem.price = product.price; // Actualizar precio por si ha cambiado
    await cartItem.save();

    // Devolver el carrito completo actualizado
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    });

    const total = updatedCart.CartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    return successResponse(res, 'Carrito actualizado', {
      id: updatedCart.id,
      items: updatedCart.CartItems,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    logger.error('Error al actualizar carrito', { 
      error: error.message, 
      userId: req.user?.id,
      stack: error.stack
    });
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

/**
 * Eliminar producto del carrito
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return errorResponse(res, 'Se requiere ID de producto', 400);
    }

    // Buscar el carrito del usuario
    const cart = await Cart.findOne({
      where: { user_id: req.user.id }
    });

    if (!cart) {
      return errorResponse(res, 'Carrito no encontrado', 404);
    }

    // Eliminar el item del carrito
    const deleted = await CartItem.destroy({
      where: {
        cart_id: cart.id,
        product_id: productId
      }
    });

    if (deleted === 0) {
      return errorResponse(res, 'Producto no encontrado en el carrito', 404);
    }

    // Devolver el carrito completo actualizado
    const updatedCart = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    });

    const total = updatedCart.CartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    return successResponse(res, 'Producto eliminado del carrito', {
      id: updatedCart.id,
      items: updatedCart.CartItems,
      total: parseFloat(total.toFixed(2))
    });
  } catch (error) {
    logger.error('Error al eliminar del carrito', { 
      error: error.message, 
      userId: req.user?.id,
      stack: error.stack
    });
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

/**
 * Vaciar el carrito
 */
const clearCart = async (req, res) => {
  try {
    // Buscar el carrito del usuario
    const cart = await Cart.findOne({
      where: { user_id: req.user.id }
    });

    if (!cart) {
      return errorResponse(res, 'Carrito no encontrado', 404);
    }

    // Eliminar todos los items del carrito
    await CartItem.destroy({
      where: { cart_id: cart.id }
    });

    return successResponse(res, 'Carrito vaciado', {
      items: [],
      total: 0
    });
  } catch (error) {
    logger.error('Error al vaciar carrito', { 
      error: error.message, 
      userId: req.user?.id,
      stack: error.stack
    });
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};