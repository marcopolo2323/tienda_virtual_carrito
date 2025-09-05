const multer = require('multer');
const path = require('path');
const { uploadProduct } = require('../config/cloudinary'); // Cambiar 'upload' por 'uploadProduct'

// Exporta el upload de Cloudinary para productos
module.exports = uploadProduct;