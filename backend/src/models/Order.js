/**
 * Modelo de Orden
 * Gestiona las órdenes de compra de los usuarios
 */
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Constantes para validación
const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

/**
 * Definición del modelo Order extendiendo Model de Sequelize
 */
class Order extends Model {}

Order.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    validate: {
      notNull: {
        msg: 'El ID de usuario es obligatorio'
      }
    }
  },
  status: {
    type: DataTypes.ENUM(...ORDER_STATUSES),
    defaultValue: 'pending',
    allowNull: false,
    validate: {
      isIn: {
        args: [ORDER_STATUSES],
        msg: `El estado debe ser uno de los siguientes: ${ORDER_STATUSES.join(', ')}`
      }
    }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El total es obligatorio'
      },
      isDecimal: {
        msg: 'El total debe ser un valor decimal válido'
      },
      min: {
        args: [0],
        msg: 'El total no puede ser negativo'
      }
    }
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'La dirección de envío es obligatoria'
      },
      notEmpty: {
        msg: 'La dirección de envío no puede estar vacía'
      }
    }
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El método de pago es obligatorio'
      },
      notEmpty: {
        msg: 'El método de pago no puede estar vacío'
      }
    }
  },
  payment_status: {
    type: DataTypes.ENUM(...PAYMENT_STATUSES),
    defaultValue: 'pending',
    allowNull: false,
    validate: {
      isIn: {
        args: [PAYMENT_STATUSES],
        msg: `El estado de pago debe ser uno de los siguientes: ${PAYMENT_STATUSES.join(', ')}`
      }
    }
  },
  payment_id: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  shipping_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'El costo de envío debe ser un valor decimal válido'
      },
      min: {
        args: [0],
        msg: 'El costo de envío no puede ser negativo'
      }
    }
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'El impuesto debe ser un valor decimal válido'
      },
      min: {
        args: [0],
        msg: 'El impuesto no puede ser negativo'
      }
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tracking_number: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  shipped_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  delivered_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Order',
  tableName: 'orders',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['payment_status']
    },
    {
      fields: ['created_at']
    }
  ],
  hooks: {
    beforeCreate: (order) => {
      // Asegurar que los valores decimales sean correctos
      if (order.total) {
        order.total = Number(Number(order.total).toFixed(2));
      }
      if (order.shipping_cost) {
        order.shipping_cost = Number(Number(order.shipping_cost).toFixed(2));
      }
      if (order.tax) {
        order.tax = Number(Number(order.tax).toFixed(2));
      }
    },
    afterUpdate: (order) => {
      // Actualizar fechas de envío y entrega automáticamente
      if (order.changed('status')) {
        if (order.status === 'shipped' && !order.shipped_at) {
          order.shipped_at = new Date();
        }
        if (order.status === 'delivered' && !order.delivered_at) {
          order.delivered_at = new Date();
        }
      }
    }
  }
});

/**
 * Métodos de instancia
 */

/**
 * Calcula el subtotal (sin impuestos ni envío)
 * @returns {number} - Subtotal de la orden
 */
Order.prototype.getSubtotal = function() {
  const total = Number(this.total) || 0;
  const shipping = Number(this.shipping_cost) || 0;
  const tax = Number(this.tax) || 0;
  
  return Number((total - shipping - tax).toFixed(2));
};

/**
 * Actualiza el estado de la orden
 * @param {string} newStatus - Nuevo estado de la orden
 * @param {string} notes - Notas opcionales sobre el cambio de estado
 * @returns {Promise<Order>} - La orden actualizada
 */
Order.prototype.updateStatus = async function(newStatus, notes) {
  if (!ORDER_STATUSES.includes(newStatus)) {
    throw new Error(`Estado inválido. Debe ser uno de: ${ORDER_STATUSES.join(', ')}`);
  }
  
  this.status = newStatus;
  
  // Actualizar fechas según el estado
  if (newStatus === 'shipped' && !this.shipped_at) {
    this.shipped_at = new Date();
  }
  if (newStatus === 'delivered' && !this.delivered_at) {
    this.delivered_at = new Date();
  }
  
  // Añadir notas si se proporcionan
  if (notes) {
    this.notes = this.notes 
      ? `${this.notes}\n${new Date().toISOString()}: ${notes}` 
      : `${new Date().toISOString()}: ${notes}`;
  }
  
  return await this.save();
};

/**
 * Actualiza el estado de pago
 * @param {string} newPaymentStatus - Nuevo estado de pago
 * @param {string} paymentId - ID de pago opcional
 * @returns {Promise<Order>} - La orden actualizada
 */
Order.prototype.updatePaymentStatus = async function(newPaymentStatus, paymentId) {
  if (!PAYMENT_STATUSES.includes(newPaymentStatus)) {
    throw new Error(`Estado de pago inválido. Debe ser uno de: ${PAYMENT_STATUSES.join(', ')}`);
  }
  
  this.payment_status = newPaymentStatus;
  
  if (paymentId) {
    this.payment_id = paymentId;
  }
  
  // Si el pago es exitoso y la orden está pendiente, actualizar a procesando
  if (newPaymentStatus === 'paid' && this.status === 'pending') {
    this.status = 'processing';
  }
  
  return await this.save();
};

/**
 * Métodos estáticos
 */

/**
 * Busca órdenes por estado
 * @param {string} status - Estado de las órdenes a buscar
 * @param {Object} options - Opciones adicionales (limit, offset, etc.)
 * @returns {Promise<Order[]>} - Órdenes encontradas
 */
Order.findByStatus = async function(status, options = {}) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Estado inválido. Debe ser uno de: ${ORDER_STATUSES.join(', ')}`);
  }
  
  return await this.findAll({
    where: { status },
    ...options
  });
};

/**
 * Busca órdenes recientes
 * @param {number} days - Número de días hacia atrás
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Order[]>} - Órdenes recientes
 */
Order.findRecent = async function(days = 7, limit = 10) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  
  return await this.findAll({
    where: {
      created_at: { [sequelize.Sequelize.Op.gte]: date }
    },
    limit,
    order: [['created_at', 'DESC']]
  });
};

module.exports = Order;