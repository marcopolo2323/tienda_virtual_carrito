/**
 * Security Middleware
 * Mejoras de seguridad para proteger la tienda y datos de clientes
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const validator = require('validator');

// Rate limiting para prevenir ataques
const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Límites específicos por endpoint
const authLimiter = createRateLimit(15 * 60 * 1000, 5, 'Demasiados intentos de login, intenta de nuevo en 15 minutos');
const apiLimiter = createRateLimit(15 * 60 * 1000, 100, 'Demasiadas peticiones, intenta de nuevo más tarde');
const strictLimiter = createRateLimit(15 * 60 * 1000, 10, 'Demasiadas peticiones, intenta de nuevo más tarde');

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://www.google-analytics.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://via.placeholder.com"],
      connectSrc: ["'self'", "https://www.google-analytics.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CORS_ORIGIN,
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'https://tiendadiego.vercel.app',
      'https://tienda-diego.vercel.app',
      'https://tu-dominio.com'
    ];
    
    console.log('🔒 CORS check - Origin:', origin);
    console.log('🔒 CORS check - Allowed origins:', allowedOrigins);
    
    if (!origin || allowedOrigins.includes(origin)) {
      console.log('✅ CORS permitido para:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS denegado para:', origin);
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Input sanitization
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = validator.escape(obj[key].trim());
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  
  next();
};

// SQL Injection protection
const sqlInjectionProtection = (req, res, next) => {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i
  ];

  const checkForSQLInjection = (input) => {
    return sqlInjectionPatterns.some(pattern => pattern.test(input));
  };

  const checkObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        if (checkForSQLInjection(obj[key])) {
          return res.status(400).json({ error: 'Entrada no válida detectada' });
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = checkObject(obj[key]);
        if (result) return result;
      }
    }
    return null;
  };

  if (req.body) {
    const result = checkObject(req.body);
    if (result) return result;
  }
  
  if (req.query) {
    const result = checkObject(req.query);
    if (result) return result;
  }
  
  next();
};

// XSS Protection
const xssProtection = (req, res, next) => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /<link[^>]*>.*?<\/link>/gi,
    /<meta[^>]*>.*?<\/meta>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /onload\s*=/gi,
    /onerror\s*=/gi,
    /onclick\s*=/gi
  ];

  const checkForXSS = (input) => {
    return xssPatterns.some(pattern => pattern.test(input));
  };

  const checkObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        if (checkForXSS(obj[key])) {
          return res.status(400).json({ error: 'Contenido no permitido detectado' });
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = checkObject(obj[key]);
        if (result) return result;
      }
    }
    return null;
  };

  if (req.body) {
    const result = checkObject(req.body);
    if (result) return result;
  }
  
  next();
};

// File upload security
const fileUploadSecurity = (req, res, next) => {
  if (req.file) {
    // Check file type
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif'
    ];
    
    if (!allowedMimes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Tipo de archivo no permitido' });
    }
    
    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: 'Archivo demasiado grande' });
    }
    
    // Check for malicious content
    const fileBuffer = req.file.buffer;
    const fileString = fileBuffer.toString('binary');
    
    if (fileString.includes('<script') || fileString.includes('javascript:')) {
      return res.status(400).json({ error: 'Archivo contiene contenido malicioso' });
    }
  }
  
  next();
};

// Request logging for security monitoring
const securityLogger = (req, res, next) => {
  const suspiciousPatterns = [
    /\.\./,  // Directory traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /eval\(/i,  // Code injection
    /javascript:/i  // XSS attempts
  ];

  const logData = {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    suspicious: false
  };

  // Check for suspicious activity
  const requestString = JSON.stringify(req.body) + JSON.stringify(req.query) + req.originalUrl;
  if (suspiciousPatterns.some(pattern => pattern.test(requestString))) {
    logData.suspicious = true;
    console.warn('🚨 Suspicious request detected:', logData);
  }

  // Log all requests for monitoring
  console.log('📝 Request logged:', logData);
  
  next();
};

// API Key validation
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key requerida' });
  }
  
  if (apiKey !== process.env.API_KEY) {
    return res.status(403).json({ error: 'API key inválida' });
  }
  
  next();
};

// Brute force protection
const bruteForceProtection = (req, res, next) => {
  const ip = req.ip;
  const attempts = req.session?.loginAttempts || 0;
  const lastAttempt = req.session?.lastLoginAttempt || 0;
  
  // Reset attempts after 15 minutes
  if (Date.now() - lastAttempt > 15 * 60 * 1000) {
    req.session.loginAttempts = 0;
  }
  
  if (attempts >= 5) {
    return res.status(429).json({ 
      error: 'Demasiados intentos de login. Intenta de nuevo en 15 minutos.' 
    });
  }
  
  next();
};

// Session security
const sessionSecurity = (req, res, next) => {
  if (req.session) {
    // Regenerate session ID periodically
    if (!req.session.lastRegen || Date.now() - req.session.lastRegen > 30 * 60 * 1000) {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
        } else {
          req.session.lastRegen = Date.now();
        }
      });
    }
  }
  
  next();
};

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter,
  securityHeaders,
  cors: cors(corsOptions),
  sanitizeInput,
  sqlInjectionProtection,
  xssProtection,
  fileUploadSecurity,
  securityLogger,
  validateApiKey,
  bruteForceProtection,
  sessionSecurity
};
