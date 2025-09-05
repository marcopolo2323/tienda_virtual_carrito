const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');

// Importar utilidades de manejo de errores
const { 
  handleSequelizeError, 
  handleNotFoundError, 
  handleValidationError,
  handleForbiddenError,
  handleError, 
  sendErrorResponse 
} = require('../utils/errorHandler');

// Importar modelos
const {
  User,
  Product,
  Category,
  Order,
  OrderItem,
  Cart,
  CartItem
} = require('../models');

// Middleware de autenticación admin
const requireAuth = (req, res, next) => {
  // Verificar si el usuario existe en la solicitud (debería ser agregado por el middleware authenticate)
  if (!req.user) {
    return sendErrorResponse(res, handleForbiddenError('Acceso no autorizado'));
  }
  
  // Verificar si el usuario es administrador
  if (req.user.role !== 'admin') {
    return sendErrorResponse(res, handleForbiddenError('Se requieren permisos de administrador'));
  }
  
  next();
};

/**
 * @route   GET /api/admin/dashboard
 * @desc    Obtener datos principales para el dashboard de administración
 * @access  Admin
 */
router.get('/dashboard', requireAuth, async (req, res) => {
  try {
    // Ejecutar consultas en paralelo para mejorar el rendimiento
    const [
      userCount,
      productCount,
      orderCount,
      revenueResult,
      recentOrders,
      lowStockProducts,
      ordersByStatus,
    ] = await Promise.all([
      // 1. Contar usuarios totales
      User.count(),
      
      // 2. Contar productos totales
      Product.count(),
      
      // 3. Contar órdenes totales
      Order.count(),
      
      // 4. Calcular ingresos totales (optimizado)
      sequelize.query(`
        SELECT COALESCE(SUM(total), 0)::DECIMAL as total_revenue
        FROM orders 
        WHERE status IN ('completed', 'delivered', 'shipped')
      `, {
        type: sequelize.QueryTypes.SELECT
      }),
      
      // 5. Órdenes recientes (últimas 5)
      Order.findAll({
        limit: 5,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: User,
            attributes: ['id', 'name', 'email']
          }
        ],
        attributes: ['id', 'created_at', 'total', 'status']
      }),
      
      // 6. Productos con stock bajo (menos de 10 unidades)
      Product.findAll({
        where: {
          stock: {
            [Op.lt]: 10
          }
        },
        include: [
          {
            model: Category,
            attributes: ['id', 'name']
          }
        ],
        attributes: ['id', 'name', 'price', 'stock', 'image_url'],
        order: [['stock', 'ASC']],
        limit: 10
      }),
      
      // 7. Órdenes por estado
      Order.findAll({
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['status']
      })
    ]);
    
    // Calcular ingresos totales
    const totalRevenue = parseFloat(revenueResult[0]?.total_revenue || 0);
    
    // Formatear órdenes recientes
    const formattedRecentOrders = recentOrders.map(order => ({
      id: order.id,
      user_name: order.User?.name || 'Usuario eliminado',
      user_email: order.User?.email,
      created_at: order.created_at,
      total: order.total,
      status: order.status
    }));
    
    // Formatear productos con stock bajo
    const formattedLowStock = lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      category_name: product.Category?.name || 'Sin categoría',
      price: product.price,
      stock: product.stock,
      image_url: product.image_url
    }));
    
    // Formatear órdenes por estado
    const formattedOrdersByStatus = {};
    ordersByStatus.forEach(item => {
      formattedOrdersByStatus[item.status] = parseInt(item.dataValues.count);
    });
    
    // 8. Productos más vendidos (optimizado)
    // Usamos una consulta indexada y con joins optimizados
    const topProductsQuery = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.image_url,
        COALESCE(SUM(oi.quantity), 0)::INTEGER as units_sold
      FROM products p
      LEFT JOIN (
        SELECT oi.product_id, oi.quantity 
        FROM order_items oi
        JOIN orders o ON oi.order_id = o.id 
        WHERE o.status IN ('completed', 'delivered', 'shipped')
      ) oi ON p.id = oi.product_id
      GROUP BY p.id, p.name, p.price, p.image_url
      ORDER BY units_sold DESC
      LIMIT 5;
    `;
    
    const topProducts = await sequelize.query(topProductsQuery, {
      type: sequelize.QueryTypes.SELECT
    });
    
    // Formatear productos más vendidos
    const formattedTopProducts = topProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image_url: product.image_url,
      units_sold: parseInt(product.units_sold || 0)
    }));
    
    // Responder con todos los datos
    const dashboardData = {
      user_count: userCount,
      product_count: productCount,
      order_count: orderCount,
      total_revenue: totalRevenue,
      recent_orders: formattedRecentOrders,
      low_stock_products: formattedLowStock,
      orders_by_status: formattedOrdersByStatus,
      top_products: formattedTopProducts
    };
    
    res.json(dashboardData);
    
  } catch (error) {
    sendErrorResponse(res, handleError(error, 'No se pudieron obtener los datos del dashboard'));
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Obtener lista de usuarios con paginación y filtros
 * @access  Admin
 */
router.get('/users', requireAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort_by = 'created_at', 
      sort_order = 'DESC',
      search = '',
      role
    } = req.query;
    
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
    
    // Validar campo de ordenamiento
    const allowedSortFields = ['id', 'name', 'email', 'created_at', 'last_login'];
    if (!allowedSortFields.includes(sort_by)) {
      return sendErrorResponse(res, handleValidationError({
        message: `Campo de ordenamiento inválido. Permitidos: ${allowedSortFields.join(', ')}`,
        fields: ['sort_by']
      }));
    }
    
    // Validar dirección de ordenamiento
    const sortOrder = sort_order.toUpperCase();
    if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
      return sendErrorResponse(res, handleValidationError({
        message: 'Dirección de ordenamiento inválida. Use ASC o DESC',
        fields: ['sort_order']
      }));
    }
    
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { first_name: { [Op.iLike]: `%${search}%` } },
        { last_name: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (role) {
      whereConditions.role = role;
    }
    
    // Ejecutar consulta con paginación
    const { count, rows: users } = await User.findAndCountAll({
      where: whereConditions,
      attributes: { exclude: ['password'] },
      order: [[sort_by, sortOrder]],
      limit: parsedLimit,
      offset: offset
    });
    
    // Calcular información de paginación
    const totalPages = Math.ceil(count / parsedLimit);
    
    res.json({
      users,
      pagination: {
        total: count,
        per_page: parsedLimit,
        current_page: parsedPage,
        last_page: totalPages,
        from: offset + 1,
        to: Math.min(offset + parsedLimit, count)
      }
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error, 'Error al obtener usuarios'));
  }
});

/**
 * @route   GET /api/admin/orders
 * @desc    Obtener lista de órdenes con paginación y filtros
 * @access  Admin
 */
router.get('/orders', requireAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort_by = 'created_at', 
      sort_order = 'DESC',
      status,
      payment_status,
      start_date,
      end_date,
      search = ''
    } = req.query;
    
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
    
    // Validar campo de ordenamiento
    const allowedSortFields = ['id', 'created_at', 'total', 'status', 'payment_status'];
    if (!allowedSortFields.includes(sort_by)) {
      return sendErrorResponse(res, handleValidationError({
        message: `Campo de ordenamiento inválido. Permitidos: ${allowedSortFields.join(', ')}`,
        fields: ['sort_by']
      }));
    }
    
    // Validar dirección de ordenamiento
    const sortOrder = sort_order.toUpperCase();
    if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
      return sendErrorResponse(res, handleValidationError({
        message: 'Dirección de ordenamiento inválida. Use ASC o DESC',
        fields: ['sort_order']
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
    
    // Filtrar por rango de fechas
    if (start_date && end_date) {
      whereConditions.created_at = {
        [Op.between]: [new Date(start_date), new Date(`${end_date}T23:59:59.999Z`)]
      };
    } else if (start_date) {
      whereConditions.created_at = {
        [Op.gte]: new Date(start_date)
      };
    } else if (end_date) {
      whereConditions.created_at = {
        [Op.lte]: new Date(`${end_date}T23:59:59.999Z`)
      };
    }
    
    // Búsqueda por ID de orden o información de usuario
    if (search) {
      // Si el search es un número, buscar por ID
      const searchAsNumber = parseInt(search);
      if (!isNaN(searchAsNumber)) {
        whereConditions.id = searchAsNumber;
      } else {
        // Incluir condición para buscar en datos de usuario
        // Esta búsqueda se realizará a través de la inclusión del modelo User
      }
    }
    
    // Ejecutar consulta con paginación
    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'email'],
          where: search && isNaN(parseInt(search)) ? {
            [Op.or]: [
              { name: { [Op.iLike]: `%${search}%` } },
              { email: { [Op.iLike]: `%${search}%` } }
            ]
          } : undefined
        },
        {
          model: OrderItem,
          attributes: ['id', 'product_id', 'quantity', 'price'],
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'price', 'image_url']
            }
          ]
        }
      ],
      order: [[sort_by, sortOrder]],
      limit: parsedLimit,
      offset: offset,
      distinct: true // Necesario para contar correctamente con includes
    });
    
    // Calcular información de paginación
    const totalPages = Math.ceil(count / parsedLimit);
    
    res.json({
      orders,
      pagination: {
        total: count,
        per_page: parsedLimit,
        current_page: parsedPage,
        last_page: totalPages,
        from: offset + 1,
        to: Math.min(offset + parsedLimit, count)
      }
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error, 'Error al obtener órdenes'));
  }
});

/**
 * @route   PUT /api/admin/orders/:id/status
 * @desc    Actualizar estado de una orden
 * @access  Admin
 */
router.put('/orders/:id/status', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    // Validar ID
    const orderId = parseInt(id);
    if (isNaN(orderId) || orderId <= 0) {
      return sendErrorResponse(res, handleValidationError({
        message: 'ID de orden inválido',
        fields: ['id']
      }));
    }
    
    // Validar estado
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return sendErrorResponse(res, handleValidationError({
        message: `Estado inválido. Valores permitidos: ${validStatuses.join(', ')}`,
        fields: ['status']
      }));
    }
    
    // Verificar si la orden existe
    const order = await Order.findByPk(orderId);
    if (!order) {
      return sendErrorResponse(res, handleNotFoundError('Orden'));
    }
    
    // Actualizar estado
    order.status = status;
    await order.save();
    
    // Registrar historial de cambios (opcional, si se implementa en el futuro)
    
    res.json({ 
      message: 'Estado de orden actualizado correctamente',
      order: {
        id: order.id,
        status: order.status,
        updated_at: order.updated_at
      }
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error, 'Error al actualizar estado de orden'));
  }
});

/**
 * @route   GET /api/admin/products
 * @desc    Obtener lista de productos con paginación y filtros
 * @access  Admin
 */
router.get('/products', requireAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort_by = 'created_at', 
      sort_order = 'DESC',
      search = '',
      category_id,
      min_price,
      max_price,
      min_stock,
      max_stock,
      status
    } = req.query;
    
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
    
    // Validar campo de ordenamiento
    const allowedSortFields = ['id', 'name', 'price', 'stock', 'created_at', 'status'];
    if (!allowedSortFields.includes(sort_by)) {
      return sendErrorResponse(res, handleValidationError({
        message: `Campo de ordenamiento inválido. Permitidos: ${allowedSortFields.join(', ')}`,
        fields: ['sort_by']
      }));
    }
    
    // Validar dirección de ordenamiento
    const sortOrder = sort_order.toUpperCase();
    if (sortOrder !== 'ASC' && sortOrder !== 'DESC') {
      return sendErrorResponse(res, handleValidationError({
        message: 'Dirección de ordenamiento inválida. Use ASC o DESC',
        fields: ['sort_order']
      }));
    }
    
    const offset = (parsedPage - 1) * parsedLimit;
    
    // Construir condiciones de búsqueda
    const whereConditions = {};
    
    // Búsqueda por nombre o descripción
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    // Filtrar por categoría
    if (category_id) {
      whereConditions.category_id = category_id;
    }
    
    // Filtrar por rango de precios
    if (min_price || max_price) {
      whereConditions.price = {};
      
      if (min_price) {
        const parsedMinPrice = parseFloat(min_price);
        if (!isNaN(parsedMinPrice)) {
          whereConditions.price[Op.gte] = parsedMinPrice;
        }
      }
      
      if (max_price) {
        const parsedMaxPrice = parseFloat(max_price);
        if (!isNaN(parsedMaxPrice)) {
          whereConditions.price[Op.lte] = parsedMaxPrice;
        }
      }
    }
    
    // Filtrar por rango de stock
    if (min_stock || max_stock) {
      whereConditions.stock = {};
      
      if (min_stock) {
        const parsedMinStock = parseInt(min_stock);
        if (!isNaN(parsedMinStock)) {
          whereConditions.stock[Op.gte] = parsedMinStock;
        }
      }
      
      if (max_stock) {
        const parsedMaxStock = parseInt(max_stock);
        if (!isNaN(parsedMaxStock)) {
          whereConditions.stock[Op.lte] = parsedMaxStock;
        }
      }
    }
    
    // Filtrar por estado
    if (status) {
      whereConditions.status = status;
    }
    
    // Ejecutar consulta con paginación
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: Category,
          attributes: ['id', 'name']
        }
      ],
      order: [[sort_by, sortOrder]],
      limit: parsedLimit,
      offset: offset
    });
    
    // Calcular información de paginación
    const totalPages = Math.ceil(count / parsedLimit);
    
    // Calcular precio con descuento para cada producto
    const productsWithDiscountedPrice = products.map(product => {
      const plainProduct = product.get({ plain: true });
      
      // Calcular precio con descuento si hay un porcentaje de descuento
      if (plainProduct.discount_percent > 0) {
        plainProduct.discounted_price = parseFloat(
          (plainProduct.price * (1 - plainProduct.discount_percent / 100)).toFixed(2)
        );
      } else {
        plainProduct.discounted_price = plainProduct.price;
      }
      
      return plainProduct;
    });
    
    res.json({
      products: productsWithDiscountedPrice,
      pagination: {
        total: count,
        per_page: parsedLimit,
        current_page: parsedPage,
        last_page: totalPages,
        from: offset + 1,
        to: Math.min(offset + parsedLimit, count)
      }
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error, 'Error al obtener productos'));
  }
});

/**
 * @route   GET /api/admin/reports/sales
 * @desc    Generar reporte de ventas con filtros por fecha
 * @access  Admin
 */
router.get('/reports/sales', requireAuth, async (req, res) => {
  try {
    const { start_date, end_date, time_range, category_id } = req.query;
    
    // Validar fechas
    if (!start_date || !end_date) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Las fechas de inicio y fin son requeridas',
        fields: ['start_date', 'end_date']
      }));
    }

    // Validar que las fechas sean válidas
    const startDate = new Date(start_date);
    const endDate = new Date(`${end_date} 23:59:59`);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Formato de fechas inválido',
        fields: ['start_date', 'end_date']
      }));
    }
    
    // Validar que la fecha de inicio no sea posterior a la fecha de fin
    if (startDate > endDate) {
      return sendErrorResponse(res, handleValidationError({
        message: 'La fecha de inicio no puede ser posterior a la fecha de fin',
        fields: ['start_date', 'end_date']
      }));
    }

    // Construir condiciones WHERE optimizadas para usar índices
    let dateCondition = `o.created_at BETWEEN '${start_date}' AND '${end_date} 23:59:59'`;
    let statusCondition = `o.status IN ('completed', 'delivered', 'shipped')`;
    let categoryCondition = category_id ? `AND c.id = ${parseInt(category_id)}` : '';

    // 1. Ventas diarias - Optimizada con índices
    const dailySalesQuery = `
      SELECT 
        DATE(o.created_at) as date,
        COALESCE(SUM(o.total), 0)::DECIMAL as revenue,
        COUNT(o.id)::INTEGER as order_count
      FROM orders o
      WHERE ${dateCondition} AND ${statusCondition}
      GROUP BY DATE(o.created_at)
      ORDER BY date
    `;

    // 2. Totales generales - Optimizada para rendimiento
    const totalsQuery = `
      SELECT 
        COALESCE(SUM(o.total), 0)::DECIMAL as total_revenue,
        COUNT(o.id)::INTEGER as order_count,
        COUNT(DISTINCT o.user_id)::INTEGER as unique_customers,
        COALESCE(AVG(o.total), 0)::DECIMAL as average_order_value
      FROM orders o
      WHERE ${dateCondition} AND ${statusCondition}
    `;

    // 3. Ingresos por método de pago - Optimizada
    const paymentMethodsQuery = `
      SELECT 
        COALESCE(o.payment_method, 'Unknown') as payment_method,
        COALESCE(SUM(o.total), 0)::DECIMAL as revenue,
        COUNT(o.id)::INTEGER as order_count
      FROM orders o
      WHERE ${dateCondition} AND ${statusCondition}
      GROUP BY o.payment_method
      ORDER BY revenue DESC
    `;
    
    // 4. Ventas por estado - Nueva consulta
    const orderStatusQuery = `
      SELECT 
        o.status,
        COUNT(o.id)::INTEGER as order_count,
        COALESCE(SUM(o.total), 0)::DECIMAL as revenue
      FROM orders o
      WHERE ${dateCondition}
      GROUP BY o.status
      ORDER BY revenue DESC
    `;

    // Ejecutar consultas en paralelo para mejor rendimiento
    const [dailySales, totals, revenueByPaymentMethod, orderStatus] = await Promise.all([
      sequelize.query(dailySalesQuery, {
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(totalsQuery, {
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(paymentMethodsQuery, {
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(orderStatusQuery, {
        type: sequelize.QueryTypes.SELECT
      })
    ]);

    // Formatear datos para mejorar la presentación
    const formattedDailySales = dailySales.map(item => ({
      date: item.date,
      revenue: parseFloat(item.revenue || 0),
      order_count: parseInt(item.order_count || 0)
    }));

    const formattedPaymentMethods = revenueByPaymentMethod.map(item => ({
      payment_method: item.payment_method,
      revenue: parseFloat(item.revenue || 0),
      order_count: parseInt(item.order_count || 0)
    }));
    
    const formattedOrderStatus = orderStatus.map(item => ({
      status: item.status,
      order_count: parseInt(item.order_count || 0),
      revenue: parseFloat(item.revenue || 0)
    }));

    const salesData = {
      start_date: start_date,
      end_date: end_date,
      daily_sales: formattedDailySales,
      totals: {
        total_revenue: parseFloat(totals[0]?.total_revenue || 0),
        order_count: parseInt(totals[0]?.order_count || 0),
        unique_customers: parseInt(totals[0]?.unique_customers || 0),
        average_order_value: parseFloat(totals[0]?.average_order_value || 0)
      },
      revenue_by_payment_method: formattedPaymentMethods,
      orders_by_status: formattedOrderStatus
    };

    res.json(salesData);

  } catch (error) {
    sendErrorResponse(res, handleError(error, 'No se pudo generar el reporte de ventas'));
  }
});

/**
 * @route   GET /api/admin/reports/products
 * @desc    Generar reporte de productos con filtros
 * @access  Admin
 */
router.get('/reports/products', requireAuth, async (req, res) => {
  try {
    const { 
      start_date, 
      end_date, 
      category_id, 
      low_stock_threshold = 10,
      top_products_limit = 20 
    } = req.query;
    
    // Validar parámetros
    const parsedLowStockThreshold = parseInt(low_stock_threshold);
    if (isNaN(parsedLowStockThreshold) || parsedLowStockThreshold < 1) {
      return sendErrorResponse(res, handleValidationError({
        message: 'El umbral de bajo stock debe ser un número positivo',
        fields: ['low_stock_threshold']
      }));
    }
    
    const parsedTopProductsLimit = parseInt(top_products_limit);
    if (isNaN(parsedTopProductsLimit) || parsedTopProductsLimit < 1 || parsedTopProductsLimit > 50) {
      return sendErrorResponse(res, handleValidationError({
        message: 'El límite de productos top debe ser un número entre 1 y 50',
        fields: ['top_products_limit']
      }));
    }
    
    // Validar fechas
    if (!start_date || !end_date) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Las fechas de inicio y fin son requeridas',
        fields: ['start_date', 'end_date']
      }));
    }

    const startDate = new Date(start_date);
    const endDate = new Date(`${end_date} 23:59:59`);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Formato de fechas inválido',
        fields: ['start_date', 'end_date']
      }));
    }
    
    if (startDate > endDate) {
      return sendErrorResponse(res, handleValidationError({
        message: 'La fecha de inicio no puede ser posterior a la fecha de fin',
        fields: ['start_date', 'end_date']
      }));
    }

    let categoryCondition = '';
    if (category_id) {
      const parsedCategoryId = parseInt(category_id);
      if (isNaN(parsedCategoryId)) {
        return sendErrorResponse(res, handleValidationError({
          message: 'ID de categoría inválido',
          fields: ['category_id']
        }));
      }
      categoryCondition = `AND c.id = ${parsedCategoryId}`;
    }

    // 1. Productos más vendidos - Optimizada para rendimiento
    const topProductsQuery = `
      SELECT 
        p.id,
        p.name,
        p.price,
        p.discount_percent,
        CASE 
          WHEN p.discount_percent > 0 THEN ROUND(p.price * (1 - p.discount_percent / 100), 2)
          ELSE p.price 
        END as discounted_price,
        p.image_url,
        c.name as category_name,
        COALESCE(SUM(oi.quantity), 0)::INTEGER as units_sold,
        COALESCE(SUM(oi.quantity * oi.price), 0)::DECIMAL as revenue
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      LEFT JOIN orders o ON oi.order_id = o.id 
        AND o.status IN ('completed', 'delivered', 'shipped')
        AND o.created_at BETWEEN '${start_date}' AND '${end_date} 23:59:59'
      WHERE 1=1 ${categoryCondition}
      GROUP BY p.id, p.name, p.price, p.discount_percent, p.image_url, c.name
      ORDER BY units_sold DESC, revenue DESC
      LIMIT ${parsedTopProductsLimit}
    `;

    // 2. Productos con stock bajo - Optimizada para rendimiento
    const lowStockQuery = `
      SELECT 
        p.id,
        p.name,
        p.stock,
        p.price,
        p.discount_percent,
        CASE 
          WHEN p.discount_percent > 0 THEN ROUND(p.price * (1 - p.discount_percent / 100), 2)
          ELSE p.price 
        END as discounted_price,
        p.image_url,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.stock <= ${parsedLowStockThreshold} ${categoryCondition}
      ORDER BY p.stock ASC
      LIMIT 20
    `;
    
    // 3. Productos sin ventas - Nueva consulta
    const noSalesQuery = `
      SELECT 
        p.id,
        p.name,
        p.stock,
        p.price,
        p.discount_percent,
        CASE 
          WHEN p.discount_percent > 0 THEN ROUND(p.price * (1 - p.discount_percent / 100), 2)
          ELSE p.price 
        END as discounted_price,
        p.image_url,
        c.name as category_name,
        p.created_at
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN order_items oi ON p.id = oi.product_id
      WHERE oi.id IS NULL
      AND p.status = 'active'
      ${categoryCondition}
      ORDER BY p.created_at DESC
      LIMIT 10
    `;

    // Ejecutar consultas en paralelo para mejor rendimiento
    const [topProducts, lowStockProducts, noSalesProducts] = await Promise.all([
      sequelize.query(topProductsQuery, { type: sequelize.QueryTypes.SELECT }),
      sequelize.query(lowStockQuery, { type: sequelize.QueryTypes.SELECT }),
      sequelize.query(noSalesQuery, { type: sequelize.QueryTypes.SELECT })
    ]);

    // Formatear datos para mejorar la presentación
    const formattedTopProducts = topProducts.map(product => ({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      discount_percent: parseFloat(product.discount_percent || 0),
      discounted_price: parseFloat(product.discounted_price || product.price),
      image_url: product.image_url,
      category_name: product.category_name,
      units_sold: parseInt(product.units_sold || 0),
      revenue: parseFloat(product.revenue || 0)
    }));

    const formattedLowStock = lowStockProducts.map(product => ({
      id: product.id,
      name: product.name,
      stock: parseInt(product.stock),
      price: parseFloat(product.price),
      discount_percent: parseFloat(product.discount_percent || 0),
      discounted_price: parseFloat(product.discounted_price || product.price),
      image_url: product.image_url,
      category_name: product.category_name
    }));
    
    const formattedNoSalesProducts = noSalesProducts.map(product => ({
      id: product.id,
      name: product.name,
      stock: parseInt(product.stock),
      price: parseFloat(product.price),
      discount_percent: parseFloat(product.discount_percent || 0),
      discounted_price: parseFloat(product.discounted_price || product.price),
      image_url: product.image_url,
      category_name: product.category_name,
      created_at: product.created_at
    }));

    const productData = {
      top_selling_products: formattedTopProducts,
      low_stock_products: formattedLowStock,
      no_sales_products: formattedNoSalesProducts,
      filters: {
        start_date,
        end_date,
        category_id: category_id ? parseInt(category_id) : null,
        low_stock_threshold: parsedLowStockThreshold,
        top_products_limit: parsedTopProductsLimit
      }
    };

    res.json(productData);

  } catch (error) {
    sendErrorResponse(res, handleError(error, 'No se pudo generar el reporte de productos'));
  }
});

/**
 * @route   GET /api/admin/reports/categories
 * @desc    Generar reporte de ventas por categoría con filtros por fecha
 * @access  Admin
 */
router.get('/reports/categories', requireAuth, async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Validar fechas
    if (!start_date || !end_date) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Las fechas de inicio y fin son requeridas',
        fields: ['start_date', 'end_date']
      }));
    }
    
    // Validar que las fechas sean válidas
    const startDate = new Date(start_date);
    const endDate = new Date(`${end_date} 23:59:59`);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Formato de fechas inválido',
        fields: ['start_date', 'end_date']
      }));
    }
    
    // Validar que la fecha de inicio no sea posterior a la fecha de fin
    if (startDate > endDate) {
      return sendErrorResponse(res, handleValidationError({
        message: 'La fecha de inicio no puede ser posterior a la fecha de fin',
        fields: ['start_date', 'end_date']
      }));
    }
    
    // Reporte de ventas por categoría - Optimizada para rendimiento
    const categoriesReportQuery = `
      WITH category_sales AS (
        SELECT 
          p.category_id,
          o.id as order_id,
          p.id as product_id,
          oi.quantity,
          oi.price * oi.quantity as item_revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('completed', 'delivered', 'shipped')
          AND o.created_at BETWEEN '${start_date}' AND '${end_date} 23:59:59'
      )
      SELECT 
        c.id,
        c.name,
        c.description,
        COUNT(DISTINCT cs.order_id) as order_count,
        COALESCE(SUM(cs.quantity), 0)::INTEGER as units_sold,
        COALESCE(SUM(cs.item_revenue), 0)::DECIMAL as revenue,
        COUNT(DISTINCT p.id)::INTEGER as product_count,
        COALESCE(AVG(p.price), 0)::DECIMAL as average_price
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.status = 'active'
      LEFT JOIN category_sales cs ON c.id = cs.category_id
      GROUP BY c.id, c.name, c.description
      ORDER BY revenue DESC
    `;
    
    // Consulta para obtener productos más vendidos por categoría
    const topProductsByCategoryQuery = `
      WITH category_product_sales AS (
        SELECT 
          p.category_id,
          p.id as product_id,
          p.name as product_name,
          p.price,
          p.discount_percent,
          p.image_url,
          SUM(oi.quantity) as units_sold,
          SUM(oi.price * oi.quantity) as revenue
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('completed', 'delivered', 'shipped')
          AND o.created_at BETWEEN '${start_date}' AND '${end_date} 23:59:59'
        GROUP BY p.category_id, p.id, p.name, p.price, p.discount_percent, p.image_url
      ),
      ranked_products AS (
        SELECT 
          category_id,
          product_id,
          product_name,
          price,
          discount_percent,
          CASE 
            WHEN discount_percent > 0 THEN ROUND(price * (1 - discount_percent / 100), 2)
            ELSE price 
          END as discounted_price,
          image_url,
          units_sold,
          revenue,
          ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY units_sold DESC, revenue DESC) as rank
        FROM category_product_sales
      )
      SELECT 
        c.id as category_id,
        c.name as category_name,
        rp.product_id,
        rp.product_name,
        rp.price,
        rp.discount_percent,
        rp.discounted_price,
        rp.image_url,
        rp.units_sold,
        rp.revenue
      FROM categories c
      LEFT JOIN ranked_products rp ON c.id = rp.category_id AND rp.rank <= 3
      ORDER BY c.id, rp.rank
    `;
    
    // Ejecutar consultas en paralelo para mejor rendimiento
    const [categoriesReport, topProductsByCategory] = await Promise.all([
      sequelize.query(categoriesReportQuery, {
        type: sequelize.QueryTypes.SELECT
      }),
      sequelize.query(topProductsByCategoryQuery, {
        type: sequelize.QueryTypes.SELECT
      })
    ]);
    
    // Formatear datos de categorías
    const formattedCategoriesReport = categoriesReport.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      order_count: parseInt(category.order_count || 0),
      units_sold: parseInt(category.units_sold || 0),
      revenue: parseFloat(category.revenue || 0),
      product_count: parseInt(category.product_count || 0),
      average_price: parseFloat(category.average_price || 0)
    }));
    
    // Agrupar productos top por categoría
    const topProductsMap = {};
    topProductsByCategory.forEach(product => {
      if (!product.product_id) return; // Ignorar categorías sin productos
      
      if (!topProductsMap[product.category_id]) {
        topProductsMap[product.category_id] = [];
      }
      
      topProductsMap[product.category_id].push({
        id: product.product_id,
        name: product.product_name,
        price: parseFloat(product.price),
        discount_percent: parseFloat(product.discount_percent || 0),
        discounted_price: parseFloat(product.discounted_price || product.price),
        image_url: product.image_url,
        units_sold: parseInt(product.units_sold),
        revenue: parseFloat(product.revenue)
      });
    });
    
    // Añadir productos top a cada categoría
    const categoriesWithTopProducts = formattedCategoriesReport.map(category => ({
      ...category,
      top_products: topProductsMap[category.id] || []
    }));
    
    res.json({
      start_date,
      end_date,
      categories: categoriesWithTopProducts
    });
    
  } catch (error) {
    sendErrorResponse(res, handleError(error, 'No se pudo generar el reporte de categorías'));
  }
});

module.exports = router;