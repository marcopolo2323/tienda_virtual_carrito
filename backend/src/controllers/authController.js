/**
 * Controlador de autenticación
 * Maneja registro, login, perfil y gestión de contraseñas
 */
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { Op } = require('sequelize');
const crypto = require('crypto');
const { 
  handleSequelizeError, 
  handleAuthError, 
  handleNotFoundError, 
  handleValidationError,
  handleError, 
  sendErrorResponse 
} = require('../utils/errorHandler');

/**
 * Genera un token JWT para autenticación
 * @param {number} id - ID del usuario
 * @returns {string} Token JWT
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  });
};

/**
 * Registro de usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const register = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la solicitud
    const { username, email, password, first_name, last_name, phone } = req.body;

    // Validación básica
    const requiredFields = ['username', 'email', 'password', 'first_name', 'last_name'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Faltan campos requeridos',
        fields: missingFields
      }));
    }

    // Verificar si el usuario ya existe (por email o username)
    const existingUser = await User.findOne({ 
      where: { 
        [Op.or]: [
          { email },
          { username }
        ]
      } 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return sendErrorResponse(res, {
          status: 409,
          message: 'Este correo electrónico ya está registrado'
        });
      }
      if (existingUser.username === username) {
        return sendErrorResponse(res, {
          status: 409,
          message: 'Este nombre de usuario ya está en uso'
        });
      }
    }

    // Crear nuevo usuario
    const user = await User.create({
      username,
      email,
      password,
      first_name,
      last_name,
      phone: phone || null
    });

    // Actualizar último login
    if (user.updateLastLogin) {
      await user.updateLastLogin();
    }

    // Generar token
    const token = generateToken(user.id);

    // Respuesta exitosa
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    // Manejo centralizado de errores
    sendErrorResponse(res, handleSequelizeError(error));
  }
};

/**
 * Login de usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return sendErrorResponse(res, handleValidationError({
        message: 'El correo electrónico y la contraseña son obligatorios',
        fields: !email ? ['email'] : !password ? ['password'] : ['email', 'password']
      }));
    }

    // Verificar si el usuario existe
    const user = await User.findOne({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return sendErrorResponse(res, handleAuthError('Credenciales inválidas'));
    }

    // Verificar si la contraseña es correcta
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendErrorResponse(res, handleAuthError('Credenciales inválidas'));
    }

    // Verificar si el usuario está activo
    if (user.is_active !== undefined && !user.is_active) {
      return sendErrorResponse(res, handleAuthError('Esta cuenta está desactivada'));
    }

    // Actualizar último login
    if (user.updateLastLogin) {
      await user.updateLastLogin();
    }

    // Generar token
    const token = generateToken(user.id);

    // Respuesta exitosa
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    // Manejo centralizado de errores
    sendErrorResponse(res, handleError(error));
  }
};

/**
 * Obtener perfil del usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expires'] }
    });

    if (!user) {
      return sendErrorResponse(res, handleNotFoundError('Usuario no encontrado'));
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error));
  }
};

/**
 * Actualizar perfil del usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { first_name, last_name, phone } = req.body;

    // Validar que al menos un campo para actualizar esté presente
    if (!first_name && !last_name && phone === undefined) {
      return sendErrorResponse(res, handleValidationError({
        message: 'Debe proporcionar al menos un campo para actualizar',
        fields: ['first_name', 'last_name', 'phone']
      }));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return sendErrorResponse(res, handleNotFoundError('Usuario no encontrado'));
    }

    // Actualizar datos
    user.first_name = first_name || user.first_name;
    user.last_name = last_name || user.last_name;
    user.phone = phone !== undefined ? phone : user.phone;
    
    // Si tienes un campo 'name', actualizarlo también
    if (user.name !== undefined) {
      user.name = `${user.first_name} ${user.last_name}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name || `${user.first_name} ${user.last_name}`,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    sendErrorResponse(res, handleSequelizeError(error));
  }
};

/**
 * Cambiar contraseña del usuario
 * @param {Object} req - Objeto de solicitud Express
 * @param {Object} res - Objeto de respuesta Express
 */
const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    // Validación de campos requeridos
    if (!currentPassword || !newPassword) {
      return sendErrorResponse(res, handleValidationError({
        message: 'La contraseña actual y la nueva contraseña son obligatorias',
        fields: !currentPassword ? ['currentPassword'] : !newPassword ? ['newPassword'] : ['currentPassword', 'newPassword']
      }));
    }

    // Validación de longitud mínima para la nueva contraseña
    if (newPassword.length < 6) {
      return sendErrorResponse(res, handleValidationError({
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
        fields: ['newPassword']
      }));
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return sendErrorResponse(res, handleNotFoundError('Usuario no encontrado'));
    }

    // Verificar contraseña actual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return sendErrorResponse(res, handleAuthError('La contraseña actual es incorrecta'));
    }

    // Verificar que la nueva contraseña sea diferente de la actual
    if (currentPassword === newPassword) {
      return sendErrorResponse(res, handleValidationError({
        message: 'La nueva contraseña debe ser diferente de la actual',
        fields: ['newPassword']
      }));
    }

    // Actualizar contraseña
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Contraseña actualizada correctamente'
    });
  } catch (error) {
    sendErrorResponse(res, handleError(error));
  }
};

// Solicitar restablecimiento de contraseña
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generar token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora

    await user.save();

    // Aquí se enviaría un email con el token
    // En un entorno real, se usaría un servicio de email

    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
      resetToken // Solo para desarrollo, en producción no se devolvería
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Restablecer contraseña
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      where: {
        reset_password_token: token,
        reset_password_expires: { [Op.gt]: Date.now() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Actualizar contraseña
    user.password = newPassword;
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};