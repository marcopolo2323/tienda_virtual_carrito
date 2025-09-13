const multer = require('multer');
const { cloudinary } = require('../config/cloudinary');

// Configuración de multer con almacenamiento en memoria
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP, AVIF)'), false);
    }
  }
});

// Middleware para subir imagen de banner
const uploadBannerImage = (req, res, next) => {
  console.log('🔄 UPLOAD MIDDLEWARE CALLED');
  console.log('📋 Request method:', req.method);
  console.log('📋 Request URL:', req.url);
  
  const uploadSingle = upload.single('image');
  
  uploadSingle(req, res, async (err) => {
    console.log('📁 Upload callback executed');
    console.log('📁 Error:', err);
    console.log('📁 File:', req.file);
    console.log('📁 Body:', req.body);
    
    if (err) {
      console.error('❌ Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    
    // Solo requerir imagen para creación, no para actualización
    if (!req.file && req.method === 'POST') {
      console.error('❌ No file received for creation');
      return res.status(400).json({
        success: false,
        message: 'Se requiere una imagen'
      });
    }
    
    // Solo subir a Cloudinary si hay un archivo
    if (req.file) {
      try {
        // Subir a Cloudinary
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'tienda-banners',
              transformation: [
                { width: 1200, height: 400, crop: 'fill', quality: 'auto:good' },
                { fetch_format: 'auto' }
              ]
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          
          uploadStream.end(req.file.buffer);
        });
        
        // Agregar información de Cloudinary al objeto file
        req.file.url = result.secure_url;
        req.file.public_id = result.public_id;
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return res.status(500).json({
          success: false,
          message: 'Error al subir la imagen'
        });
      }
    }
    
    next();
  });
};

module.exports = { uploadBannerImage };
