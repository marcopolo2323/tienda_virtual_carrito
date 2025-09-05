const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Solo rutas sin parámetros
router.get('/', productController.getAllProducts);
router.get('/featured', productController.getFeaturedProducts);

module.exports = router;