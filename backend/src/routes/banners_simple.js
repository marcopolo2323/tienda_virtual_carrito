// routes/banners_simple.js - Versión simplificada para depuración
const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken, isAdmin: requireAdmin } = require('../middlewares/auth');
const BannerController = require('../controllers/bannerController');

// Ruta pública
router.get('/active', BannerController.getActiveBanners);

// Rutas admin sin parámetros
router.get('/admin', authenticateToken, requireAdmin, BannerController.getBanners);
router.put('/admin/reorder', authenticateToken, requireAdmin, BannerController.reorderBanners);

module.exports = router;