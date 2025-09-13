/**
 * Controlador de órdenes
 * Maneja operaciones CRUD para órdenes y sus items
 */
const { Order, OrderItem, Product, User } = require('../models');
const sequelize = require('../config/database');
const { 
  handleSequelizeError, 
  handleNotFoundError, 
  handleValidationError,
  handleForbiddenError,
  handleError, 
  sendErrorResponse 
} = require('../utils/errorHandler');

/**
 * Obtener todas las órdenes (admin)
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getAllOrders = async (req, res) => {
  try {
    // Verificar si el usuario es admin
    if (req.user.role !== 'admin') {
      return sendErrorResponse(res, handleForbiddenError('No tiene permisos para acceder a esta información'));
    }
    
    const { status, page = 1, limit = 10, payment_status, sort_by = 'created_at', sort_order = 'DESC' } = req.query;
    
    // Validar parámetros de paginación
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return sendErrorResponse(res, handleValidationError({
        message: 'El límite debe ser un número positivo',
        fields: ['limit']
      }));
    }
    
    if (isNaN(parsedPage) || parsedPage < 1) {
      return sendErrorResponse(res, handleValidationError({
        message: 'La página debe ser un número positivo',
        fields: ['page']
      }));
    }
    
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    if (status) {
      whereConditions.status = status;
    }
    
    if (payment_status) {
      whereConditions.payment_status = payment_status;
    }
    
    // Validar y configurar ordenamiento
    const allowedSortFields = ['created_at', 'total', 'status', 'payment_status'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    // Obtener órdenes con paginación
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereConditions,
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'first_name', 'last_name'] },
        { 
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price', 'image_url', 'sku'] }]
        }
      ],
      limit: parsedLimit,
      offset,
      order: [[sortField, sortDirection]]
    });
    
    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total_pages: Math.ceil(count / parsedLimit),
        current_page: parsedPage,
        total_orders: count,
        limit: parsedLimit
      }
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error));
  }
};

/**
 * Obtener órdenes de un usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, sort_by = 'created_at', sort_order = 'DESC' } = req.query;
    
    // Validar parámetros de paginación
    const parsedLimit = parseInt(limit);
    const parsedPage = parseInt(page);
    
    if (isNaN(parsedLimit) || parsedLimit < 1) {
      return sendErrorResponse(res, handleValidationError({
        message: 'El límite debe ser un número positivo',
        fields: ['limit']
      }));
    }
    
    if (isNaN(parsedPage) || parsedPage < 1) {
      return sendErrorResponse(res, handleValidationError({
        message: 'La página debe ser un número positivo',
        fields: ['page']
      }));
    }
    
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Construir condiciones de búsqueda
    const whereConditions = { user_id: req.user.id };
    
    if (status) {
      whereConditions.status = status;
    }
    
    // Validar y configurar ordenamiento
    const allowedSortFields = ['created_at', 'total', 'status', 'payment_status'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = sort_order === 'ASC' ? 'ASC' : 'DESC';
    
    // Obtener órdenes del usuario con paginación
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereConditions,
      include: [
        { 
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price', 'image_url', 'sku'] }]
        }
      ],
      limit: parsedLimit,
      offset,
      order: [[sortField, sortDirection]]
    });
    
    res.status(200).json({
      success: true,
      orders,
      pagination: {
        total_pages: Math.ceil(count / parsedLimit),
        current_page: parsedPage,
        total_orders: count,
        limit: parsedLimit
      }
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error));
  }
};

/**
 * Obtener una orden por ID
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Se requiere un ID de orden válido',
        fields: ['id']
      }));
    }
    
    const order = await Order.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'first_name', 'last_name'] },
        { 
          model: OrderItem,
          include: [{ model: Product, attributes: ['id', 'name', 'price', 'image_url', 'sku'] }]
        }
      ]
    });
    
    if (!order) {
      return sendErrorResponse(res, handleNotFoundError(`Orden con ID ${id} no encontrada`));
    }
    
    // Verificar si el usuario es el propietario o un admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return sendErrorResponse(res, handleForbiddenError('No tiene autorización para acceder a esta orden'));
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear una nueva orden
const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { 
      shipping_info, 
      payment_method, 
      preference_id,
      subtotal, 
      shipping_cost, 
      tax, 
      total, 
      status = 'pending' 
    } = req.body;
    
    // Crear la orden
    const order = await Order.create({
      user_id: req.user.id,
      shipping_info: JSON.stringify(shipping_info),
      payment_method,
      preference_id,
      subtotal,
      shipping_cost,
      tax,
      total,
      status,
      payment_status: 'pending'
    }, { transaction });
    
    // Obtener items del carrito del usuario
    const cart = await Cart.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: CartItem,
          include: [Product]
        }
      ]
    }, { transaction });
    
    if (!cart || !cart.CartItems || cart.CartItems.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'No hay items en el carrito' 
      });
    }
    
    // Crear los items de la orden y actualizar stock
    const orderItems = [];
    
    for (const cartItem of cart.CartItems) {
      const product = cartItem.Product;
      
      if (product.stock < cartItem.quantity) {
        await transaction.rollback();
        return res.status(400).json({ 
          success: false,
          message: `No hay suficiente stock para ${product.name}. Disponible: ${product.stock}` 
        });
      }
      
      // Actualizar stock
      product.stock -= cartItem.quantity;
      await product.save({ transaction });
      
      // Crear item de orden
      const orderItem = await OrderItem.create({
        order_id: order.id,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        price: cartItem.price
      }, { transaction });
      
      orderItems.push(orderItem);
    }
    
    // Limpiar el carrito después de crear la orden
    await CartItem.destroy({
      where: { cart_id: cart.id }
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      order: {
        id: order.id,
        total: order.total,
        status: order.status,
        payment_status: order.payment_status,
        created_at: order.created_at
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error al crear la orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Actualizar estado de una orden (admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Actualizar estado
    order.status = status || order.status;
    
    await order.save();
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar estado de pago de una orden
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const order = await Order.findByPk(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Actualizar estado de pago
    order.paymentStatus = paymentStatus || order.paymentStatus;
    order.paymentId = paymentId || order.paymentId;
    
    await order.save();
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updatePaymentStatus
}