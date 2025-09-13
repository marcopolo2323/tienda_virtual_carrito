/**
 * Automation utilities for e-commerce
 * Mejoras para automatizar procesos y mejorar la experiencia del cliente
 */

const nodemailer = require('nodemailer');
const cron = require('node-cron');

// Email automation configuration
const emailTransporter = nodemailer.createTransporter({
  service: 'gmail', // o tu proveedor de email preferido
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * 1. AUTOMATIZACIÓN DE EMAILS DE BIENVENIDA
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '¡Bienvenido a nuestra tienda premium! 🎉',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1B263B, #2A3B5C); color: white; padding: 2rem; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #D4AF37; font-family: 'Playfair Display', serif; margin-bottom: 1rem;">¡Bienvenido ${userName}!</h1>
            <p style="font-size: 1.2rem; margin-bottom: 2rem;">Gracias por unirte a nuestra comunidad premium</p>
          </div>
          
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
            <h3 style="color: #D4AF37; margin-bottom: 1rem;">🎁 Oferta especial de bienvenida</h3>
            <p>Obtén un <strong>10% de descuento</strong> en tu primera compra usando el código:</p>
            <div style="background: #D4AF37; color: #1B263B; padding: 1rem; border-radius: 8px; text-align: center; font-weight: bold; font-size: 1.2rem; margin: 1rem 0;">
              WELCOME10
            </div>
            <p><em>Válido por 30 días desde hoy</em></p>
          </div>
          
          <div style="text-align: center; margin-top: 2rem;">
            <a href="${process.env.FRONTEND_URL}/products" style="background: linear-gradient(135deg, #D4AF37, #B8941F); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Comenzar a comprar
            </a>
          </div>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email de bienvenida enviado a:', userEmail);
  } catch (error) {
    console.error('❌ Error enviando email de bienvenida:', error);
  }
};

/**
 * 2. AUTOMATIZACIÓN DE ABANDONO DE CARRITO
 */
const sendCartAbandonmentEmail = async (userEmail, userName, cartItems) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: '¡No olvides completar tu compra! 🛍️',
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1B263B, #2A3B5C); color: white; padding: 2rem; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #D4AF37; font-family: 'Playfair Display', serif; margin-bottom: 1rem;">¡Hola ${userName}!</h1>
            <p style="font-size: 1.2rem;">Veo que dejaste algunos productos en tu carrito</p>
          </div>
          
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
            <h3 style="color: #D4AF37; margin-bottom: 1rem;">🛒 Tu carrito te está esperando</h3>
            ${cartItems.map(item => `
              <div style="display: flex; align-items: center; margin-bottom: 1rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <img src="${item.image_url}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px; margin-right: 1rem;">
                <div>
                  <h4 style="margin: 0; color: #D4AF37;">${item.name}</h4>
                  <p style="margin: 0; color: #ccc;">Cantidad: ${item.quantity}</p>
                  <p style="margin: 0; color: #D4AF37; font-weight: bold;">$${item.price}</p>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="text-align: center; margin-top: 2rem;">
            <a href="${process.env.FRONTEND_URL}/cart" style="background: linear-gradient(135deg, #D4AF37, #B8941F); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Completar compra
            </a>
          </div>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email de carrito abandonado enviado a:', userEmail);
  } catch (error) {
    console.error('❌ Error enviando email de carrito abandonado:', error);
  }
};

/**
 * 3. AUTOMATIZACIÓN DE SEGUIMIENTO DE PEDIDOS
 */
const sendOrderStatusUpdate = async (userEmail, userName, orderNumber, status, trackingInfo = null) => {
  try {
    const statusMessages = {
      'processing': 'Tu pedido está siendo preparado',
      'shipped': '¡Tu pedido está en camino!',
      'delivered': '¡Tu pedido ha sido entregado!',
      'cancelled': 'Tu pedido ha sido cancelado'
    };

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `Actualización de tu pedido #${orderNumber} 📦`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1B263B, #2A3B5C); color: white; padding: 2rem; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #D4AF37; font-family: 'Playfair Display', serif; margin-bottom: 1rem;">Actualización de pedido</h1>
            <p style="font-size: 1.2rem;">Hola ${userName}, aquí tienes una actualización sobre tu pedido</p>
          </div>
          
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
            <h3 style="color: #D4AF37; margin-bottom: 1rem;">📦 Pedido #${orderNumber}</h3>
            <p><strong>Estado:</strong> ${statusMessages[status] || status}</p>
            ${trackingInfo ? `<p><strong>Código de seguimiento:</strong> ${trackingInfo}</p>` : ''}
            <p><strong>Fecha de actualización:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin-top: 2rem;">
            <a href="${process.env.FRONTEND_URL}/orders/${orderNumber}" style="background: linear-gradient(135deg, #D4AF37, #B8941F); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Ver detalles del pedido
            </a>
          </div>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email de actualización de pedido enviado a:', userEmail);
  } catch (error) {
    console.error('❌ Error enviando email de actualización de pedido:', error);
  }
};

/**
 * 4. AUTOMATIZACIÓN DE REBAJAS Y OFERTAS
 */
const sendPromotionalEmail = async (userEmail, userName, offer) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: `🔥 ${offer.title} - ¡Oferta limitada!`,
      html: `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1B263B, #2A3B5C); color: white; padding: 2rem; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 2rem;">
            <h1 style="color: #D4AF37; font-family: 'Playfair Display', serif; margin-bottom: 1rem;">${offer.title}</h1>
            <p style="font-size: 1.2rem;">¡Oferta exclusiva para ti, ${userName}!</p>
          </div>
          
          <div style="background: rgba(212, 175, 55, 0.1); padding: 1.5rem; border-radius: 12px; margin-bottom: 2rem;">
            <h3 style="color: #D4AF37; margin-bottom: 1rem;">🎯 ${offer.description}</h3>
            <div style="background: #D4AF37; color: #1B263B; padding: 1rem; border-radius: 8px; text-align: center; font-weight: bold; font-size: 1.2rem; margin: 1rem 0;">
              ${offer.discount}% DE DESCUENTO
            </div>
            <p><em>Válido hasta: ${offer.expiryDate}</em></p>
            <p><strong>Código:</strong> ${offer.code}</p>
          </div>
          
          <div style="text-align: center; margin-top: 2rem;">
            <a href="${process.env.FRONTEND_URL}/products" style="background: linear-gradient(135deg, #D4AF37, #B8941F); color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Aprovechar oferta
            </a>
          </div>
        </div>
      `
    };

    await emailTransporter.sendMail(mailOptions);
    console.log('✅ Email promocional enviado a:', userEmail);
  } catch (error) {
    console.error('❌ Error enviando email promocional:', error);
  }
};

/**
 * 5. TAREAS PROGRAMADAS (CRON JOBS)
 */

// Enviar emails de carrito abandonado diariamente
cron.schedule('0 10 * * *', async () => {
  console.log('🔄 Ejecutando tarea: Envío de emails de carrito abandonado');
  // Aquí implementarías la lógica para encontrar carritos abandonados
  // y enviar emails a los usuarios correspondientes
});

// Generar reportes semanales
cron.schedule('0 9 * * 1', async () => {
  console.log('📊 Ejecutando tarea: Generación de reportes semanales');
  // Aquí implementarías la lógica para generar reportes automáticos
});

// Limpiar datos temporales
cron.schedule('0 2 * * *', async () => {
  console.log('🧹 Ejecutando tarea: Limpieza de datos temporales');
  // Aquí implementarías la lógica para limpiar datos antiguos
});

/**
 * 6. NOTIFICACIONES PUSH (para implementar con Service Workers)
 */
const sendPushNotification = async (userId, title, body, icon, url) => {
  // Implementar con service workers y web push API
  console.log(`📱 Notificación push enviada a usuario ${userId}: ${title}`);
};

/**
 * 7. RECOMENDACIONES INTELIGENTES
 */
const generateProductRecommendations = (userId, purchaseHistory) => {
  // Implementar algoritmo de recomendaciones basado en:
  // - Historial de compras
  // - Productos vistos
  // - Categorías favoritas
  // - Comportamiento similar de otros usuarios
  
  return {
    basedOnHistory: [],
    trending: [],
    personalized: [],
    crossSell: []
  };
};

/**
 * 8. ANÁLISIS DE SENTIMIENTOS EN RESEÑAS
 */
const analyzeReviewSentiment = (reviewText) => {
  // Implementar análisis de sentimientos para:
  // - Detectar reseñas negativas automáticamente
  // - Alertar al equipo de soporte
  // - Generar respuestas automáticas
  
  return {
    sentiment: 'positive', // 'positive', 'negative', 'neutral'
    confidence: 0.85,
    keywords: ['excellent', 'quality', 'fast']
  };
};

module.exports = {
  sendWelcomeEmail,
  sendCartAbandonmentEmail,
  sendOrderStatusUpdate,
  sendPromotionalEmail,
  sendPushNotification,
  generateProductRecommendations,
  analyzeReviewSentiment
};
