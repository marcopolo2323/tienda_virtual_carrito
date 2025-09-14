const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Configurar cliente MercadoPago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

router.post('/create-preference', authenticate, async (req, res) => {
  try {
    const { items, payer, shipments } = req.body;
    
    console.log('=== DEBUG VARIABLES ===');
    console.log('process.env.FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('process.env.API_URL:', process.env.API_URL);
    console.log('process.env.NODE_ENV:', process.env.NODE_ENV);
    
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requieren items para crear la preferencia'
      });
    }

    // URLs dinámicas según el entorno
    const FRONTEND_URL = process.env.FRONTEND_URL || 'https://tiendadiego.vercel.app';
    const API_URL = process.env.API_URL || 'https://tienda-diego-qkm5.onrender.com';

    const preferenceData = {
      items: items.map(item => ({
        title: item.title || item.name || 'Producto',
        quantity: parseInt(item.quantity) || 1,
        unit_price: parseFloat(item.unit_price || item.price) || 0,
        currency_id: 'PEN'
      })),
      
      back_urls: {
        success: `${FRONTEND_URL}/order-success`,
        failure: `${FRONTEND_URL}/checkout`,
        pending: `${FRONTEND_URL}/order-pending`
      },

      notification_url: `${API_URL}/api/payment/webhooks/mercadopago`,
      external_reference: `order_${req.user.id}_${Date.now()}`
      // REMOVER auto_return temporalmente
    };

    // Agregar payer solo si tiene email
    if (payer && payer.email) {
      preferenceData.payer = {
        name: payer.name || '',
        surname: payer.surname || '',
        email: payer.email,
        phone: {
          area_code: '51',
          number: payer.phone?.number ? String(payer.phone.number) : '987654321'
        }
      };
    }

    console.log('=== PREFERENCIA FINAL ===');
    console.log(JSON.stringify(preferenceData, null, 2));

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceData });
    
    console.log('=== RESULTADO MERCADOPAGO ===');
    console.log('ID:', result.id);
    console.log('Init point:', result.init_point);

    res.json({
      success: true,
      message: 'Preferencia creada correctamente',
      data: {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      }
    });

  } catch (error) {
    console.error('=== ERROR COMPLETO ===');
    console.error('Message:', error.message);
    console.error('Cause:', error.cause);
    console.error('Stack:', error.stack);
    
    let errorMessage = error.message || 'Error al crear la preferencia de pago';
    if (error.cause && Array.isArray(error.cause)) {
      errorMessage = error.cause.map(c => c.description || c.message).join(', ');
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

router.post('/webhooks/mercadopago', async (req, res) => {
  try {
    console.log('Webhook recibido:', req.body);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error webhook:', error);
    res.status(500).json({ error: 'Error procesando webhook' });
  }
});

module.exports = router;