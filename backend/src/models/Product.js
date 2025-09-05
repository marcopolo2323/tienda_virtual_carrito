/**
 * Modelo de Producto
 * Gestiona los productos disponibles en la tienda
 */
const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

// Constantes para validación
const MIN_PRICE = 0.01;
const MAX_NAME_LENGTH = 100;

/**
 * Definición del modelo Product extendiendo Model de Sequelize
 */
class Product extends Model {}

Product.init({ 
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(MAX_NAME_LENGTH),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El nombre del producto es obligatorio'
      },
      notEmpty: {
        msg: 'El nombre del producto no puede estar vacío'
      },
      len: {
        args: [2, MAX_NAME_LENGTH],
        msg: `El nombre debe tener entre 2 y ${MAX_NAME_LENGTH} caracteres`
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 2000],
        msg: 'La descripción no puede exceder los 2000 caracteres'
      }
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      notNull: {
        msg: 'El precio es obligatorio'
      },
      isDecimal: {
        msg: 'El precio debe ser un valor decimal válido'
      },
      min: {
        args: [MIN_PRICE],
        msg: `El precio debe ser mayor o igual a ${MIN_PRICE}`
      }
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      isInt: {
        msg: 'El stock debe ser un número entero'
      },
      min: {
        args: [0],
        msg: 'El stock no puede ser negativo'
      }
    }
  },
  image_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'La URL de la imagen debe ser válida'
      }
    }
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: {
      name: 'products_sku_unique',
      msg: 'Este SKU ya está en uso'
    },
    validate: {
      is: {
        args: /^[A-Za-z0-9-_]+$/i,
        msg: 'El SKU solo puede contener letras, números, guiones y guiones bajos'
      }
    }
  },
  weight: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    validate: {
      isDecimal: {
        msg: 'El peso debe ser un valor decimal válido'
      },
      min: {
        args: [0],
        msg: 'El peso no puede ser negativo'
      }
    },
    comment: 'Peso en kilogramos'
  },
  dimensions: {
    type: DataTypes.STRING(100),
    allowNull: true,
    validate: {
      is: {
        args: /^\d+(\.\d+)?\s*x\s*\d+(\.\d+)?\s*x\s*\d+(\.\d+)?$/i,
        msg: 'Las dimensiones deben tener el formato: largo x ancho x alto'
      }
    },
    comment: 'Dimensiones en formato: largo x ancho x alto'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'out_of_stock'),
    defaultValue: 'active',
    allowNull: false,
    validate: {
      isIn: {
        args: [['active', 'inactive', 'out_of_stock']],
        msg: 'El estado debe ser active, inactive o out_of_stock'
      }
    }
  },
  discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: 0,
    validate: {
      isDecimal: {
        msg: 'El descuento debe ser un valor decimal válido'
      },
      min: {
        args: [0],
        msg: 'El descuento no puede ser negativo'
      },
      max: {
        args: [100],
        msg: 'El descuento no puede ser mayor a 100%'
      }
    }
  }
}, {
  sequelize,
  modelName: 'Product',
  tableName: 'products',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['category_id']
    },
    {
      fields: ['featured']
    },
    {
      fields: ['status']
    },
    {
      unique: true,
      fields: ['sku']
    }
  ],
  hooks: {
    beforeValidate: (product) => {
      // Normalizar SKU a mayúsculas si existe
      if (product.sku) {
        product.sku = product.sku.toUpperCase().trim();
      }
    },
    afterFind: (products) => {
      // Actualizar estado automáticamente si el stock es 0
      if (!products) return;
      
      const updateStatus = (product) => {
        if (product.stock === 0 && product.status !== 'out_of_stock') {
          product.status = 'out_of_stock';
        }
      };
      
      if (Array.isArray(products)) {
        products.forEach(updateStatus);
      } else {
        updateStatus(products);
      }
    }
  }
});

/**
 * Métodos de instancia
 */

/**
 * Calcula el precio con descuento
 * @returns {number} - Precio con descuento aplicado
 */
Product.prototype.getDiscountedPrice = function() {
  if (!this.discount_percent) return Number(this.price);
  
  const discountAmount = (Number(this.price) * Number(this.discount_percent)) / 100;
  return Number((Number(this.price) - discountAmount).toFixed(2));
};

/**
 * Actualiza el stock del producto
 * @param {number} quantity - Cantidad a reducir (negativo) o aumentar (positivo)
 * @returns {Promise<Product>} - El producto actualizado
 */
Product.prototype.updateStock = async function(quantity) {
  // Validar que el stock no quede negativo
  const newStock = this.stock + quantity;
  if (newStock < 0) {
    throw new Error('No hay suficiente stock disponible');
  }
  
  this.stock = newStock;
  
  // Actualizar estado automáticamente
  if (this.stock === 0) {
    this.status = 'out_of_stock';
  } else if (this.status === 'out_of_stock' && this.stock > 0) {
    this.status = 'active';
  }
  
  return await this.save();
};

/**
 * Métodos estáticos
 */

/**
 * Busca productos con stock bajo
 * @param {number} threshold - Umbral de stock bajo
 * @returns {Promise<Product[]>} - Productos con stock bajo
 */
Product.findLowStock = async function(threshold = 5) {
  return await this.findAll({
    where: {
      stock: { [sequelize.Sequelize.Op.lte]: threshold },
      stock: { [sequelize.Sequelize.Op.gt]: 0 },
      status: 'active'
    },
    order: [['stock', 'ASC']]
  });
};

/**
 * Busca productos destacados activos
 * @param {number} limit - Límite de resultados
 * @returns {Promise<Product[]>} - Productos destacados
 */
Product.findFeatured = async function(limit = 10) {
  return await this.findAll({
    where: {
      featured: true,
      status: 'active',
      stock: { [sequelize.Sequelize.Op.gt]: 0 }
    },
    limit,
    order: [['updatedAt', 'DESC']]
  });
};

module.exports = Product;