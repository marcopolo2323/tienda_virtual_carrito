const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware de autenticación
const authenticate = async (req, res, next) => {
  try {
    console.log('🔐 Ejecutando middleware authenticate');
    
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.cookies?.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided, authorization denied' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuario
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Token is not valid - user not found' 
      });
    }

    // Verificar si el usuario está activo
    if (user.isActive !== undefined && !user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account is disabled' 
      });
    }

    // Agregar usuario al request
    req.user = user;
    console.log('✅ Usuario autenticado:', user.email);
    next();
  } catch (error) {
    console.error('❌ Error en authenticate:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error in authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware de verificación de admin
const isAdmin = (req, res, next) => {
  try {
    console.log('👑 Ejecutando middleware isAdmin');
    
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not authenticated' 
      });
    }

    // Verificar si el usuario es admin
    if (req.user.role !== 'admin') {
      console.log('❌ Usuario no es admin:', req.user.email, 'role:', req.user.role);
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    console.log('✅ Usuario es admin:', req.user.email);
    next();
  } catch (error) {
    console.error('❌ Error en isAdmin:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error in admin verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware opcional de autenticación (no falla si no hay token)
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.header('x-auth-token') ||
                  req.cookies?.token;

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    req.user = user || null;
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

module.exports = {
  authenticate,
  isAdmin,
  optionalAuth
};