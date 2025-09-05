/**
 * Modelo de Usuario
 * Gestiona la autenticación y datos de usuarios del sistema
 */
const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

// Constantes para validación
const PASSWORD_MIN_LENGTH = 6;
const USERNAME_MIN_LENGTH = 3;
const SALT_ROUNDS = 10;

/**
 * Definición del modelo User extendiendo Model de Sequelize
 * para aprovechar características de herencia y tipado
 */
class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
    unique: {
      name: 'users_username_unique',
      msg: 'Este nombre de usuario ya está en uso'
    },
    validate: {
      len: {
        args: [USERNAME_MIN_LENGTH, 30],
        msg: `El nombre de usuario debe tener entre ${USERNAME_MIN_LENGTH} y 30 caracteres`
      },
      notNull: {
        msg: 'El nombre de usuario es obligatorio'
      },
      is: {
        args: /^[a-zA-Z0-9_.-]+$/i,
        msg: 'El nombre de usuario solo puede contener letras, números, guiones y puntos'
      }
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: {
      name: 'users_email_unique',
      msg: 'Este correo electrónico ya está registrado'
    },
    validate: {
      isEmail: {
        msg: 'Debe proporcionar un correo electrónico válido'
      },
      notNull: {
        msg: 'El correo electrónico es obligatorio'
      },
      isLowercase: true
    },
    set(value) {
      // Normalizar email a minúsculas
      this.setDataValue('email', value ? value.toLowerCase().trim() : null);
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [PASSWORD_MIN_LENGTH, 100],
        msg: `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
      },
      notNull: {
        msg: 'La contraseña es obligatoria'
      }
    }
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: 'El nombre debe tener entre 1 y 50 caracteres'
      },
      notNull: {
        msg: 'El nombre es obligatorio'
      }
    },
    set(value) {
      // Capitalizar primera letra
      if (value) {
        const formatted = value.trim();
        this.setDataValue('first_name', 
          formatted.charAt(0).toUpperCase() + formatted.slice(1));
      }
    }
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      len: {
        args: [1, 50],
        msg: 'El apellido debe tener entre 1 y 50 caracteres'
      },
      notNull: {
        msg: 'El apellido es obligatorio'
      }
    },
    set(value) {
      // Capitalizar primera letra
      if (value) {
        const formatted = value.trim();
        this.setDataValue('last_name', 
          formatted.charAt(0).toUpperCase() + formatted.slice(1));
      }
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    validate: {
      len: {
        args: [7, 20],
        msg: 'El teléfono debe tener entre 7 y 20 caracteres'
      },
      isValidPhone(value) {
        if (value && !/^[+]?[0-9\s-()]+$/.test(value)) {
          throw new Error('Formato de teléfono inválido');
        }
      }
    }
  },
  // Campo virtual para nombre completo
  name: {
    type: DataTypes.VIRTUAL,
    get() {
      return `${this.first_name} ${this.last_name}`;
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['user', 'admin']],
        msg: 'El rol debe ser user o admin'
      }
    }
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  reset_password_token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['username']
    },
    {
      fields: ['role']
    },
    {
      fields: ['is_active']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeSave: (user) => {
      // Asegurar que el email siempre se guarde en minúsculas
      if (user.email) {
        user.email = user.email.toLowerCase().trim();
      }
    }
  }
});

/**
 * Métodos de instancia
 */

/**
 * Compara una contraseña proporcionada con la contraseña hasheada del usuario
 * @param {string} candidatePassword - La contraseña a comparar
 * @returns {Promise<boolean>} - True si la contraseña coincide, false en caso contrario
 */
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Actualiza la fecha del último inicio de sesión
 * @returns {Promise<User>} - El usuario actualizado
 */
User.prototype.updateLastLogin = async function() {
  this.last_login = new Date();
  return await this.save();
};

/**
 * Genera un token de restablecimiento de contraseña y establece su fecha de expiración
 * @param {number} expiresInHours - Horas hasta la expiración del token
 * @returns {Promise<string>} - El token generado
 */
User.prototype.generateResetToken = async function(expiresInHours = 1) {
  // Generar un token aleatorio
  const token = require('crypto').randomBytes(20).toString('hex');
  
  // Establecer el token y su fecha de expiración
  this.reset_password_token = token;
  this.reset_password_expires = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  
  // Guardar el usuario
  await this.save();
  
  return token;
};

/**
 * Métodos estáticos
 */

/**
 * Busca un usuario por su token de restablecimiento de contraseña
 * @param {string} token - El token de restablecimiento
 * @returns {Promise<User|null>} - El usuario encontrado o null
 */
User.findByResetToken = async function(token) {
  return await this.findOne({
    where: {
      reset_password_token: token,
      reset_password_expires: { [sequelize.Sequelize.Op.gt]: new Date() }
    }
  });
};

module.exports = User;