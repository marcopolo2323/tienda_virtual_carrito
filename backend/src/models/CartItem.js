const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CartItem = sequelize.define('CartItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  cart_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'carts',
      key: 'id'
    },
    onDelete: 'CASCADE' // Si se elimina el cart, eliminar sus items
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE' // Si se elimina el producto, eliminar de carritos
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: {
        args: [1],
        msg: 'Quantity must be at least 1'
      },
      max: {
        args: [999],
        msg: 'Quantity cannot exceed 999'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: {
        args: [0],
        msg: 'Price must be positive'
      }
    }
  }
}, {
  timestamps: true,
  underscored: true,
  tableName: 'cart_items',
  indexes: [
    {
      unique: true,
      fields: ['cart_id', 'product_id'] // Un producto solo puede estar una vez por carrito
    }
  ]
});

module.exports = CartItem;