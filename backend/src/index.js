/**
 * Aplicación principal Express
 * Configuración, middleware y rutas centralizadas
 */

// Dependencias principales
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Importar conexión a la base de datos
const { sequelize } = require('./models/index');


// Importar rutas directamente
const productsRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const paymentRoutes = require('./routes/payment');
const categoriesRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const bannersRoutes = require('./routes/banners');

// Inicialización de la aplicación
const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV === 'development';

/**
 * Configuración de middleware principal
 */
// Seguridad y CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parseo de cuerpo de peticiones
app.use(express.json({ limit: '10mb' })); // Reducido para mejor rendimiento
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de logging para desarrollo
if (isDev) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
}

/**
 * Configuración de archivos estáticos
 * Optimizado para servir imágenes y archivos con caché
 */
if (process.env.SERVE_LOCAL_UPLOADS === 'true') {
  const uploadsPath = path.join(__dirname, 'uploads');
  
  // Crear directorio uploads si no existe (con manejo de errores)
  try {
    if (!fs.existsSync(uploadsPath)) {
      fs.mkdirSync(uploadsPath, { recursive: true });
      console.log('📁 Created uploads directory:', uploadsPath);
    }
    
    // Middleware para servir archivos estáticos con configuración optimizada
    app.use('/uploads', (req, res, next) => {
      // Headers de seguridad y CORS para imágenes
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      
      // Headers de caché optimizados por tipo de archivo
      const ext = path.extname(req.path).toLowerCase();
      const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
      
      if (isImage) {
        // Caché más largo para imágenes (7 días)
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      } else {
        // Caché estándar para otros archivos (1 día)
        res.setHeader('Cache-Control', 'public, max-age=86400');
      }
      
      next();
    }, express.static(uploadsPath, {
      maxAge: '1d',        // Tiempo de caché del cliente
      etag: true,          // Soporte para validación ETag
      lastModified: true,  // Soporte para validación por fecha de modificación
      index: false,        // Deshabilitar listado de directorios
    }));
    
    console.log('📁 Serving optimized static files from:', uploadsPath);
  } catch (error) {
    console.error('❌ Error configuring static files:', error.message);
  }
}

/**
 * Configuración de rutas API
 * Organizadas por dominio funcional
 */
// Rutas de autenticación y usuarios (prioridad alta)
app.use('/api/auth', authRoutes);

// Rutas principales de la tienda
app.use('/api/products', productsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/payment', paymentRoutes);

// Rutas públicas de banners
app.use('/api/banners', bannersRoutes);

// Rutas administrativas (acceso restringido)
app.use('/api/admin', adminRoutes);

/**
 * Rutas de información y diagnóstico
 */
// Ruta principal - información de la API
app.get('/', (req, res) => {
  res.json({ 
    message: 'API de Tienda funcionando correctamente',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: Math.floor(process.uptime()) + ' segundos'
  });
});

/**
 * Rutas de desarrollo y diagnóstico
 * Solo disponibles en entorno de desarrollo
 */
if (isDev) {
  // Ruta de estado del sistema (health check)
  app.get('/api/health', async (req, res) => {
    try {
      // Verificar conexión a la base de datos
      await sequelize.authenticate({ timeout: 5000 });
      
      res.json({ 
        status: 'healthy',
        message: 'API funcionando correctamente', 
        timestamp: new Date().toISOString(),
        port: PORT,
        environment: process.env.NODE_ENV,
        database: 'connected',
        memory: {
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        },
        uptime: {
          seconds: Math.floor(process.uptime()),
          formatted: formatUptime(process.uptime())
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        message: 'Error en la API',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Ruta de seeding de la base de datos
  app.get('/api/seed', async (req, res) => {
    try {
      console.log('🌱 Iniciando seeding de la base de datos...');
      
      // Importar el seeder
      const seedDatabase = require('./../scripts/seed');
      
      // Ejecutar el seeding
      await seedDatabase();
      
      console.log('✅ Seeding completado exitosamente');
      
      res.json({ 
        success: true,
        message: 'Base de datos poblada exitosamente',
        timestamp: new Date().toISOString(),
        data: {
          admin: 'admin@gmail.com / admin123',
          categories: 5,
          products: 8,
          banners: 3
        }
      });
    } catch (error) {
      console.error('❌ Error durante el seeding:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error al poblar la base de datos',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Ruta de prueba para uploads locales
  app.get('/api/test-uploads', (req, res) => {
    const uploadsPath = path.join(__dirname, 'uploads');
    
    try {
      if (!fs.existsSync(uploadsPath)) {
        return res.json({
          message: 'Uploads directory does not exist',
          uploadsPath,
          files: []
        });
      }

      const files = fs.readdirSync(uploadsPath);
      res.json({
        uploadsPath,
        totalFiles: files.length,
        files: files.map(file => {
          const filePath = path.join(uploadsPath, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: formatFileSize(stats.size),
            url: `${req.protocol}://${req.get('host')}/uploads/${file}`,
            modified: stats.mtime
          };
        })
      });
    } catch (error) {
      res.status(500).json({
        error: 'Error reading uploads directory',
        message: error.message,
        uploadsPath
      });
    }
  });
}

/**
 * Funciones auxiliares
 */
// Formatear tiempo de actividad
const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
  
  return parts.join(' ');
};

// Formatear tamaño de archivo
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

/**
 * Manejo de rutas no encontradas
 */
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

/**
 * Middleware de manejo de errores centralizado
 * Captura y formatea todos los errores no manejados
 */
app.use((err, req, res, next) => {
  // Registrar error con información contextual
  console.error(`❌ Error [${req.method} ${req.path}]:`, err.message);
  if (isDev) console.error(err.stack);
  
  // Determinar tipo de error y respuesta apropiada
  let statusCode = err.status || err.statusCode || 500;
  let errorResponse = {
    success: false,
    message: err.message || 'Error interno del servidor',
    path: req.originalUrl,
    method: req.method
  };
  
  // Manejar tipos específicos de errores
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Error de sintaxis JSON
    statusCode = 400;
    errorResponse.message = 'Formato JSON inválido';
    errorResponse.type = 'syntax_error';
  } else if (err.type === 'entity.too.large') {
    // Error de límite de payload
    statusCode = 413;
    errorResponse.message = 'Payload demasiado grande';
    errorResponse.type = 'payload_too_large';
  } else if (err.name === 'SequelizeValidationError') {
    // Error de validación de Sequelize
    statusCode = 400;
    errorResponse.message = 'Error de validación';
    errorResponse.type = 'validation_error';
    errorResponse.errors = err.errors.map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    // Error de unicidad de Sequelize
    statusCode = 409;
    errorResponse.message = 'Conflicto de datos';
    errorResponse.type = 'unique_constraint_error';
    errorResponse.errors = err.errors.map(e => ({
      field: e.path,
      message: `El valor '${e.value}' ya existe`,
      value: e.value
    }));
  }
  
  // Incluir detalles adicionales solo en desarrollo
  if (isDev) {
    errorResponse.error = err.message;
    errorResponse.stack = err.stack?.split('\n');
  }
  
  // Enviar respuesta de error
  res.status(statusCode).json(errorResponse);
});

/**
 * Inicialización de la aplicación
 * Secuencia controlada de arranque con manejo de errores
 */
const initializeApp = async () => {
  try {
    console.log('🔄 Iniciando aplicación...');
    const startTime = Date.now();
    
    // 1. Verificar conexión a la base de datos
    try {
      await sequelize.authenticate({ timeout: 10000 });
      console.log('✅ Conexión a la base de datos establecida correctamente');
    } catch (dbError) {
      console.error('❌ Error al conectar con la base de datos:', dbError.message);
      throw new Error('Database connection failed');
    }
    
    // 2. Sincronizar modelos con la base de datos
    const syncOptions = isDev ? { alter: true } : { alter: false };
    try {
      await sequelize.sync(syncOptions);
      console.log('✅ Modelos sincronizados con la base de datos');
    } catch (syncError) {
      console.error('❌ Error al sincronizar modelos:', syncError.message);
      throw new Error('Database synchronization failed');
    }
    
    // 3. Iniciar servidor HTTP
    const server = app.listen(PORT, () => {
      const bootTime = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✨ Aplicación iniciada en ${bootTime} segundos`);
      console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔒 CORS Origin: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
      
      if (process.env.SERVE_LOCAL_UPLOADS === 'true') {
        console.log(`📸 Imágenes locales disponibles en http://localhost:${PORT}/uploads/`);
      }
      
      if (isDev) {
        console.log(`🧪 Health check: http://localhost:${PORT}/api/health`);
        console.log(`📁 Test uploads: http://localhost:${PORT}/api/test-uploads`);
      }
    });
    
    // 4. Configurar manejo de señales para cierre graceful
    const gracefulShutdown = (signal) => {
      console.log(`🛑 Señal ${signal} recibida, cerrando aplicación...`);
      server.close(() => {
        console.log('✅ Servidor HTTP cerrado correctamente');
        // Cerrar conexión a la base de datos
        sequelize.close().then(() => {
          console.log('✅ Conexión a la base de datos cerrada correctamente');
          console.log('👋 Proceso terminado');
          process.exit(0);
        }).catch(err => {
          console.error('❌ Error al cerrar la conexión a la base de datos:', err.message);
          process.exit(1);
        });
      });
      
      // Forzar cierre después de 10 segundos si no se completa gracefully
      setTimeout(() => {
        console.error('⚠️ No se pudo cerrar gracefully después de 10s, forzando salida');
        process.exit(1);
      }, 10000);
    };
    
    // Registrar manejadores de señales
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // Manejar excepciones no capturadas
    process.on('uncaughtException', (err) => {
      console.error('❌ Excepción no capturada:', err);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });
    
  } catch (error) {
    console.error('❌ Error al inicializar la aplicación:', error.message);
    if (isDev) console.error(error.stack);
    process.exit(1);
  }
};

// Inicializar la aplicación
initializeApp();

module.exports = app;