// models/index.js
const sequelize = require('../config/database');

// Importar todos los modelos
const User = require('./User');
const Product = require('./Product');
const Category = require('./Category');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Banner = require('./Banner');

// Definir relaciones

// Relación Categoría - Productos
Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// Relación Usuario - Órdenes
User.hasMany(Order, { foreignKey: 'user_id' });
Order.belongsTo(User, { foreignKey: 'user_id' });

// Relación Orden - Items de Orden
Order.hasMany(OrderItem, { foreignKey: 'order_id' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });

// Relación Producto - Items de Orden
Product.hasMany(OrderItem, { foreignKey: 'product_id' });
OrderItem.belongsTo(Product, { foreignKey: 'product_id' });

// Relación Usuario - Carrito
User.hasOne(Cart, { foreignKey: 'user_id' });
Cart.belongsTo(User, { foreignKey: 'user_id' });

// Relación Carrito - Items de Carrito
Cart.hasMany(CartItem, { foreignKey: 'cart_id' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });

// Relación Producto - Items de Carrito
Product.hasMany(CartItem, { foreignKey: 'product_id' });
CartItem.belongsTo(Product, { foreignKey: 'product_id' });

// Banner no tiene relaciones con otros modelos por ahora
// Si en el futuro quieres relacionar banners con productos o categorías:
// Banner.belongsTo(Product, { foreignKey: 'product_id', allowNull: true });
// Banner.belongsTo(Category, { foreignKey: 'category_id', allowNull: true });

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    // Verificar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar modelos con la base de datos
    // En producción, usa { alter: true } o migraciones en lugar de { force: true }
    await sequelize.sync({ 
      force: false, // Cambia a true solo si quieres recrear todas las tablas
      alter: false   // Cambia a true para actualizar tablas existentes
    });
    
    console.log('✅ Modelos sincronizados con la base de datos.');
    
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    throw error;
  }
};

module.exports = {
  sequelize,        // ← Esto es importante
  initializeDatabase,
  // Modelos
  User,
  Product,
  Category,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Banner 
};