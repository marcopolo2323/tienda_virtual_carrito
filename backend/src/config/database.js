const { Sequelize } = require('sequelize');
require('dotenv').config();

/**
 * Configuración optimizada de Sequelize para PostgreSQL
 * - Logging condicional basado en entorno
 * - Pool de conexiones configurado para mejor rendimiento
 * - Opciones de dialecto específicas para PostgreSQL
 */
const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'postgres',
  // Logging optimizado: solo en desarrollo y con formato mejorado
  logging: process.env.NODE_ENV === 'development' 
    ? (query, time) => console.log(`[DB Query] (${time}ms) ${query}`)
    : false,
  // Configuración de pool optimizada
  pool: {
    max: 10,               // Aumentado para mejor concurrencia
    min: 0,                // Mínimo de conexiones inactivas
    acquire: 30000,        // Tiempo máximo para adquirir conexión (ms)
    idle: 10000,           // Tiempo máximo de inactividad (ms)
    evict: 1000            // Frecuencia de comprobación de conexiones inactivas
  },
  // Opciones específicas de PostgreSQL
  dialectOptions: {
    ssl: process.env.DB_SSL === 'true' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    statement_timeout: 30000,     // Timeout para consultas (30s)
    idle_in_transaction_session_timeout: 60000  // Timeout para transacciones inactivas (60s)
  },
  // Opciones adicionales para mejorar rendimiento
  define: {
    timestamps: true,      // Habilitar timestamps por defecto
    underscored: true,     // Usar snake_case para nombres de columnas
    freezeTableName: false // No congelar nombres de tablas (plural)
  },
  benchmark: process.env.NODE_ENV === 'development' // Medir tiempo de consultas en desarrollo
});

module.exports = sequelize;