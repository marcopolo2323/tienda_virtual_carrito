const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, isAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Rutas de productos
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts); // ← AGREGAR ESTA LÍNEA
router.get('/:id', productController.getProductById);

// Rutas protegidas de productos (admin)
router.post('/', authenticate, isAdmin, upload.single('image'), productController.createProduct);
router.put('/:id', authenticate, isAdmin, upload.single('image'), productController.updateProduct);
router.delete('/:id', authenticate, isAdmin, productController.deleteProduct);
 
module.exports = router;