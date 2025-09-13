const express = require('express');
const router = express.Router();
const BannerController = require('../controllers/bannerController');

// ==================== RUTAS PÚBLICAS PARA BANNERS ====================

/**
 * @route   GET /api/banners/active
 * @desc    Obtener banners activos (público)
 * @access  Public
 */
router.get('/active', BannerController.getActiveBanners);

module.exports = router;