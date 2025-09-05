// middleware/uploadBanner.js - Middleware específico para banners con Cloudinary
const { uploadBanner } = require('../config/cloudinary');

// Middleware para manejo de errores de multer específicos para banners
const handleBannerUploadError = (error, req, res, next) => {
  console.error('Banner upload error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large',
      details: [{ field: 'image', message: 'File size must be less than 10MB' }]
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Too many files',
      details: [{ field: 'image', message: 'Only one file is allowed' }]
    });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Unexpected field',
      details: [{ field: 'image', message: 'Field name should be "image"' }]
    });
  }
  
  // Error de tipo de archivo
  if (error.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type',
      details: [{ field: 'image', message: 'Only JPG, PNG, GIF and WebP files are allowed' }]
    });
  }
  
  // Error genérico
  return res.status(400).json({
    success: false,
    message: 'File upload error',
    details: [{ field: 'image', message: error.message || 'Unknown upload error' }]
  });
};

// Middleware específico para subir imagen de banner
const uploadBannerImage = (req, res, next) => {
  console.log('Banner upload middleware called');
  console.log('Request body before upload:', req.body);
  console.log('Request files:', req.files);
  
  const uploadSingle = uploadBanner.single('image');
  
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Banner upload error:', err);
      return handleBannerUploadError(err, req, res, next);
    }
    
    console.log('Banner file uploaded successfully');
    console.log('Uploaded file:', req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      filename: req.file.filename,
      path: req.file.path
    } : 'No file');
    console.log('Request body after upload:', req.body);
    
    next();
  });
};

module.exports = {
  uploadBannerImage,
  handleBannerUploadError
};