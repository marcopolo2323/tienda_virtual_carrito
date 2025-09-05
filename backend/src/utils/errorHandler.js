/**
 * Utilidad para manejo centralizado de errores
 * Proporciona funciones para manejar diferentes tipos de errores de forma consistente
 */
const { ValidationError, UniqueConstraintError, DatabaseError } = require('sequelize');

/**
 * Códigos de error HTTP
 */
const HTTP_CODES = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500
};

/**
 * Maneja errores de validación de Sequelize
 * @param {Error} error - Error de Sequelize
 * @returns {Object} Objeto con status y mensaje de error formateado
 */
const handleSequelizeError = (error) => {
  // Error de validación (campos requeridos, longitud, etc)
  if (error instanceof ValidationError) {
    const messages = error.errors.map(err => ({
      field: err.path,
      message: err.message
    }));

    return {
      status: HTTP_CODES.UNPROCESSABLE_ENTITY,
      message: 'Error de validación',
      errors: messages
    };
  }

  // Error de restricción única (email duplicado, etc)
  if (error instanceof UniqueConstraintError) {
    const messages = error.errors.map(err => ({
      field: err.path,
      message: err.message
    }));

    return {
      status: HTTP_CODES.CONFLICT,
      message: 'Error de duplicidad',
      errors: messages
    };
  }

  // Error general de base de datos
  if (error instanceof DatabaseError) {
    return {
      status: HTTP_CODES.INTERNAL_SERVER_ERROR,
      message: 'Error de base de datos',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
    };
  }

  // Error desconocido
  return {
    status: HTTP_CODES.INTERNAL_SERVER_ERROR,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  };
};

/**
 * Maneja errores de autenticación
 * @param {string} message - Mensaje de error
 * @returns {Object} Objeto con status y mensaje de error
 */
const handleAuthError = (message = 'No autorizado') => {
  return {
    status: HTTP_CODES.UNAUTHORIZED,
    message
  };
};

/**
 * Maneja errores de permisos
 * @param {string} message - Mensaje de error
 * @returns {Object} Objeto con status y mensaje de error
 */
const handleForbiddenError = (message = 'Acceso denegado') => {
  return {
    status: HTTP_CODES.FORBIDDEN,
    message
  };
};

/**
 * Maneja errores de recurso no encontrado
 * @param {string} resource - Nombre del recurso no encontrado
 * @returns {Object} Objeto con status y mensaje de error
 */
const handleNotFoundError = (resource = 'Recurso') => {
  return {
    status: HTTP_CODES.NOT_FOUND,
    message: `${resource} no encontrado`
  };
};

/**
 * Maneja errores de validación de datos de entrada
 * @param {Object|Array} errors - Errores de validación
 * @returns {Object} Objeto con status y errores formateados
 */
const handleValidationError = (errors) => {
  return {
    status: HTTP_CODES.BAD_REQUEST,
    message: 'Error de validación',
    errors: Array.isArray(errors) ? errors : [errors]
  };
};

/**
 * Maneja errores generales
 * @param {Error} error - Error a manejar
 * @param {boolean} includeStack - Incluir stack trace en desarrollo
 * @returns {Object} Objeto con status y mensaje de error
 */
const handleError = (error, includeStack = true) => {
  console.error('Error:', error);
  
  return {
    status: HTTP_CODES.INTERNAL_SERVER_ERROR,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' && includeStack ? error.stack : undefined
  };
};

/**
 * Envía una respuesta de error al cliente
 * @param {Object} res - Objeto de respuesta Express
 * @param {Object} errorData - Datos del error (status, message, etc)
 */
const sendErrorResponse = (res, errorData) => {
  const { status, ...data } = errorData;
  return res.status(status).json({
    success: false,
    ...data
  });
};

module.exports = {
  HTTP_CODES,
  handleSequelizeError,
  handleAuthError,
  handleForbiddenError,
  handleNotFoundError,
  handleValidationError,
  handleError,
  sendErrorResponse
};