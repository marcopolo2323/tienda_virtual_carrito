/**
 * Aplicación Express para pruebas de rutas
 */

// Dependencias principales
const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar rutas para pruebas
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products_simple');
const ordersRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');
const categoriesRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const bannersRoutes = require('./routes/banners_simple');

// Inicialización de la aplicación
const app = express();
const PORT = process.env.PORT || 5001; // Puerto diferente para no conflictuar

// Configuración de middleware básico
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta principal - información de la API
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de prueba funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Montar solo una ruta para pruebas (descomentar la que quieras probar)
// app.use('/api/auth', authRoutes);
// app.use('/api/products', productsRoutes);
// app.use('/api/categories', categoriesRoutes);
// app.use('/api/cart', cartRoutes);
// app.use('/api/orders', ordersRoutes);
// app.use('/api/payment', paymentRoutes);
// app.use('/api/banners', bannersRoutes);
app.use('/api/admin', adminRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de prueba ejecutándose en el puerto ${PORT}`);
});