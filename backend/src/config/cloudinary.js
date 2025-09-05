// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configurar almacenamiento de Cloudinary para productos
const productStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tienda-productos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'limit', quality: 'auto:good' },
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `product-${uniqueSuffix}`;
    }
  }
});

// Configurar almacenamiento de Cloudinary para banners
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tienda-banners', // Carpeta específica para banners
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [
      { width: 1200, height: 400, crop: 'fill', quality: 'auto:good' }, // Tamaño optimizado para banners
      { fetch_format: 'auto' }
    ],
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `banner-${uniqueSuffix}`;
    }
  }
});

// Configurar multer para productos
const uploadProduct = multer({
  storage: productStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB límite
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WebP)'), false);
    }
  }
});

// Configurar multer para banners
const uploadBanner = multer({
  storage: bannerStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite para banners (más grande)
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WebP)'), false);
    }
  }
});

// Función para eliminar imagen de Cloudinary
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Imagen eliminada de Cloudinary:', result);
    return result;
  } catch (error) {
    console.error('Error eliminando imagen de Cloudinary:', error);
    throw error;
  }
};

// Función para extraer public_id de la URL de Cloudinary
const getPublicIdFromUrl = (url) => {
  try {
    // URL format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/public-id.ext
    const matches = url.match(/\/v\d+\/(.+)\./);
    return matches ? matches[1] : null;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};

// Función para obtener URL optimizada
const getOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 400,
    height: 300,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, finalOptions);
};

// Función para obtener URL optimizada de banner
const getBannerOptimizedUrl = (publicId, options = {}) => {
  const defaultOptions = {
    width: 1200,
    height: 400,
    crop: 'fill',
    quality: 'auto:good',
    fetch_format: 'auto'
  };
  
  const finalOptions = { ...defaultOptions, ...options };
  
  return cloudinary.url(publicId, finalOptions);
};

module.exports = { 
  cloudinary,
  upload: uploadProduct, // Para productos (compatibilidad)
  uploadProduct,
  uploadBanner, // Para banners
  deleteImage,
  getPublicIdFromUrl,
  getOptimizedUrl,
  getBannerOptimizedUrl
};