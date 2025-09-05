const { Order } = require('../models');
const { successResponse, errorResponse } = require('../utils/apiResponse');
const { MESSAGES, PAYMENT_METHODS, PAYMENT_STATUS } = require('../utils/constants');
const logger = require('../utils/logger');
const mercadopago = require('mercadopago');

// Configurar MercadoPago
mercadopago.configure({
  access_token: process.env.MERCADOPAGO_ACCESS_TOKEN,
  client_id: process.env.MERCADOPAGO_CLIENT_ID,
  client_secret: process.env.MERCADOPAGO_CLIENT_SECRET
});

/**
 * Crear preferencia de pago en MercadoPago
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createPreference = async (req, res) => {
  try {
    const { items, payer, shipments, back_urls, orderId } = req.body;
    
    if (!items || items.length === 0) {
      return errorResponse(res, 'Se requieren productos para crear la preferencia', 400);
    }

    // Buscar la orden si se proporciona orderId
    let order = null;
    if (orderId) {
      order = await Order.findOne({
        where: { 
          id: orderId,
          user_id: req.user.id
        }
      });

      if (!order) {
        return errorResponse(res, 'Orden no encontrada', 404);
      }
    }

    const preference = {
      items: items.map(item => ({
        title: item.title,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        currency_id: 'PEN'
      })),
      payer: {
        name: payer?.name || '',
        surname: payer?.surname || '',
        email: payer?.email || req.user.email,
        phone: payer?.phone || {},
        address: payer?.address || {}
      },
      shipments: shipments || {
        cost: 0,
        mode: 'not_specified'
      },
      back_urls: back_urls || {
        success: `${process.env.FRONTEND_URL}/order-success`,
        failure: `${process.env.FRONTEND_URL}/checkout?error=payment_failed`,
        pending: `${process.env.FRONTEND_URL}/order-pending`
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12
      },
      notification_url: `${process.env.API_URL}/api/payment/webhooks/mercadopago`,
      external_reference: orderId ? `order_${orderId}` : `temp_${req.user.id}_${Date.now()}`,
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };

    const response = await mercadopago.preferences.create(preference);

    // Si hay una orden, actualizar con el preference_id
    if (order) {
      order.preference_id = response.body.id;
      order.payment_method = PAYMENT_METHODS.MERCADOPAGO;
      await order.save();
    }

    logger.info('Preferencia MercadoPago creada', {
      preferenceId: response.body.id,
      userId: req.user.id,
      orderId: orderId
    });

    return successResponse(res, 'Preferencia creada correctamente', {
      id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    });
  } catch (error) {
    logger.error('Error al crear preferencia MercadoPago', { 
      error: error.message, 
      userId: req.user.id 
    });
    return errorResponse(res, 'Error al crear la preferencia de pago', 500);
  }
};

/**
 * Procesar un pago
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const processPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, paymentDetails, preferenceId } = req.body;

    if (!orderId || !paymentMethod) {
      return errorResponse(res, 'Se requiere ID de orden y método de pago', 400);
    }

    // Validar método de pago
    const validMethods = [
      PAYMENT_METHODS.MERCADOPAGO, 
      PAYMENT_METHODS.TRANSFER, 
      PAYMENT_METHODS.CASH
    ];
    
    if (!validMethods.includes(paymentMethod)) {
      return errorResponse(res, 'Método de pago no válido', 400);
    }

    // Buscar la orden
    const order = await Order.findOne({
      where: { 
        id: orderId,
        user_id: req.user.id
      }
    });

    if (!order) {
      return errorResponse(res, MESSAGES.ORDER_NOT_FOUND, 404);
    }

    // Verificar que la orden no esté ya pagada
    if (order.payment_status === PAYMENT_STATUS.PAID) {
      return errorResponse(res, 'Esta orden ya ha sido pagada', 400);
    }

    let paymentResult;
    
    // Procesar según el método de pago
    switch (paymentMethod) {
      case PAYMENT_METHODS.MERCADOPAGO:
        paymentResult = await processMercadoPagoPayment(order, preferenceId);
        break;
      case PAYMENT_METHODS.TRANSFER:
        paymentResult = await processBankTransfer(order);
        break;
      case PAYMENT_METHODS.CASH:
        paymentResult = await processCashPayment(order);
        break;
      default:
        return errorResponse(res, 'Método de pago no soportado', 400);
    }

    // Actualizar la orden
    order.payment_method = paymentMethod;
    order.payment_status = paymentResult.status;
    order.transaction_id = paymentResult.transactionId;
    
    if (paymentResult.status === PAYMENT_STATUS.PAID) {
      order.payment_date = new Date();
    }
    
    if (preferenceId) {
      order.preference_id = preferenceId;
    }
    
    await order.save();

    logger.info('Pago procesado', {
      orderId: order.id,
      paymentMethod,
      status: paymentResult.status,
      userId: req.user.id
    });

    return successResponse(res, 'Pago procesado con éxito', {
      orderId: order.id,
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      transactionId: order.transaction_id,
      paymentDate: order.payment_date
    });
  } catch (error) {
    logger.error('Error al procesar pago', { 
      error: error.message, 
      userId: req.user.id 
    });
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

/**
 * Manejar webhook de MercadoPago
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const handleMercadoPagoWebhook = async (req, res) => {
  try {
    const { type, data } = req.body;
    
    logger.info('Webhook MercadoPago recibido', { type, data });
    
    if (type === 'payment') {
      const paymentId = data.id;
      
      // Obtener información del pago desde MercadoPago
      const payment = await mercadopago.payment.findById(paymentId);
      const paymentData = payment.body;
      
      // Buscar la orden por external_reference
      const externalRef = paymentData.external_reference;
      if (externalRef && externalRef.startsWith('order_')) {
        const orderId = externalRef.replace('order_', '');
        
        const order = await Order.findOne({
          where: { id: orderId }
        });
        
        if (order) {
          // Mapear estado de MercadoPago a nuestro sistema
          const newStatus = mapMercadoPagoStatus(paymentData.status);
          
          // Actualizar orden solo si hay cambio de estado
          if (order.payment_status !== newStatus) {
            order.payment_status = newStatus;
            order.transaction_id = paymentData.id;
            
            if (paymentData.status === 'approved') {
              order.payment_date = new Date(paymentData.date_approved);
            }
            
            await order.save();
            
            logger.info('Orden actualizada por webhook', {
              orderId: order.id,
              oldStatus: order.payment_status,
              newStatus: newStatus,
              paymentId: paymentData.id
            });
          }
        } else {
          logger.warn('Orden no encontrada para webhook', { externalRef });
        }
      }
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error('Error procesando webhook MercadoPago', { error: error.message });
    res.status(500).json({ error: 'Error procesando webhook' });
  }
};

/**
 * Obtener métodos de pago disponibles
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: PAYMENT_METHODS.MERCADOPAGO,
        name: 'MercadoPago',
        description: 'Tarjetas, Yape, Plin, BCP y más',
        enabled: true,
        icon: 'mercadopago'
      },
      {
        id: PAYMENT_METHODS.TRANSFER,
        name: 'Transferencia Bancaria',
        description: 'Transferencia a cuenta bancaria',
        enabled: true,
        icon: 'bank'
      },
      {
        id: PAYMENT_METHODS.CASH,
        name: 'Pago Contra Entrega',
        description: 'Solo en Lima Metropolitana',
        enabled: true,
        icon: 'cash'
      }
    ];

    return successResponse(res, 'Métodos de pago obtenidos', paymentMethods);
  } catch (error) {
    logger.error('Error al obtener métodos de pago', { error: error.message });
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

/**
 * Verificar estado de pago de una orden
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const checkPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return errorResponse(res, 'Se requiere ID de orden', 400);
    }

    const order = await Order.findOne({
      where: { 
        id: orderId,
        user_id: req.user.id
      },
      attributes: [
        'id', 'total', 'payment_status', 'payment_method', 
        'payment_date', 'transaction_id', 'preference_id'
      ]
    });

    if (!order) {
      return errorResponse(res, MESSAGES.ORDER_NOT_FOUND, 404);
    }

    return successResponse(res, 'Estado de pago obtenido', {
      orderId: order.id,
      total: order.total,
      currency: 'PEN',
      paymentStatus: order.payment_status,
      paymentMethod: order.payment_method,
      paymentDate: order.payment_date,
      transactionId: order.transaction_id,
      preferenceId: order.preference_id
    });
  } catch (error) {
    logger.error('Error al verificar estado de pago', { 
      error: error.message, 
      userId: req.user.id 
    });
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

/**
 * Solicitar reembolso
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const requestRefund = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    if (!orderId) {
      return errorResponse(res, 'Se requiere ID de orden', 400);
    }

    const order = await Order.findOne({
      where: { 
        id: orderId,
        user_id: req.user.id
      }
    });

    if (!order) {
      return errorResponse(res, MESSAGES.ORDER_NOT_FOUND, 404);
    }

    if (order.payment_status !== PAYMENT_STATUS.PAID) {
      return errorResponse(res, 'Solo se pueden reembolsar órdenes pagadas', 400);
    }

    let refundResult;

    // Procesar reembolso según el método de pago
    if (order.payment_method === PAYMENT_METHODS.MERCADOPAGO) {
      if (!order.transaction_id) {
        return errorResponse(res, 'No se encontró ID de transacción para el reembolso', 400);
      }

      const refund = {
        payment_id: parseInt(order.transaction_id),
        amount: amount ? parseFloat(amount) : undefined,
        reason: reason || 'Reembolso solicitado por el cliente'
      };

      const response = await mercadopago.refunds.create(refund);
      
      refundResult = {
        refundId: response.body.id,
        amount: response.body.amount,
        status: response.body.status
      };
    } else {
      // Para otros métodos, marcar como reembolso manual
      refundResult = {
        refundId: 'manual_' + Math.random().toString(36).substring(2, 15),
        amount: amount || order.total,
        status: 'manual_refund_required'
      };
    }

    // Actualizar orden
    order.payment_status = PAYMENT_STATUS.REFUNDED;
    order.refund_reason = reason || 'No se proporcionó razón';
    order.refund_date = new Date();
    await order.save();

    logger.info('Reembolso procesado', {
      orderId: order.id,
      refundId: refundResult.refundId,
      amount: refundResult.amount,
      userId: req.user.id
    });

    return successResponse(res, 'Reembolso procesado con éxito', {
      orderId: order.id,
      paymentStatus: order.payment_status,
      refundDate: order.refund_date,
      refundDetails: refundResult
    });
  } catch (error) {
    logger.error('Error al procesar reembolso', { 
      error: error.message, 
      userId: req.user.id 
    });
    return errorResponse(res, MESSAGES.INTERNAL_SERVER_ERROR, 500);
  }
};

// Funciones auxiliares

const processMercadoPagoPayment = async (order, preferenceId) => {
  return {
    transactionId: preferenceId || 'mp_' + Math.random().toString(36).substring(2, 15),
    status: PAYMENT_STATUS.PENDING // Se actualizará por webhook
  };
};

const processBankTransfer = async (order) => {
  return {
    transactionId: 'transfer_' + Math.random().toString(36).substring(2, 15),
    status: PAYMENT_STATUS.PENDING
  };
};

const processCashPayment = async (order) => {
  return {
    transactionId: 'cash_' + Math.random().toString(36).substring(2, 15),
    status: PAYMENT_STATUS.PENDING
  };
};

const mapMercadoPagoStatus = (mpStatus) => {
  const statusMap = {
    'pending': PAYMENT_STATUS.PENDING,
    'approved': PAYMENT_STATUS.PAID,
    'authorized': PAYMENT_STATUS.AUTHORIZED,
    'in_process': PAYMENT_STATUS.PROCESSING,
    'in_mediation': PAYMENT_STATUS.DISPUTED,
    'rejected': PAYMENT_STATUS.FAILED,
    'cancelled': PAYMENT_STATUS.CANCELLED,
    'refunded': PAYMENT_STATUS.REFUNDED,
    'charged_back': PAYMENT_STATUS.CHARGEBACK
  };
  
  return statusMap[mpStatus] || PAYMENT_STATUS.UNKNOWN;
};

module.exports = {
  createPreference,
  processPayment,
  handleMercadoPagoWebhook,
  getPaymentMethods,
  checkPaymentStatus,
  requestRefund
};