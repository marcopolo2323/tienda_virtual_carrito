const { Sequelize } = require('sequelize');
require('dotenv').config();

// Usar DATABASE_URL si está disponible (producción), sino usar variables separadas (desarrollo)
const sequelize = process.env.DATABASE_URL 
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' 
        ? (query, time) => console.log(`[DB Query] (${time}ms) ${query}`)
        : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 1000
      },
      dialectOptions: {
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false,
        statement_timeout: 30000,
        idle_in_transaction_session_timeout: 60000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: false
      },
      benchmark: process.env.NODE_ENV === 'development'
    })
  : new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' 
        ? (query, time) => console.log(`[DB Query] (${time}ms) ${query}`)
        : false,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
        evict: 1000
      },
      dialectOptions: {
        ssl: false
      }
    });

module.exports = sequelize;