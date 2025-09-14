const express = require('express');
const router = express.Router();
const BannerController = require('../controllers/bannerController');
const { authenticate, isAdmin } = require('../middlewares/auth');
const { uploadBannerImage } = require('../middlewares/uploadBanner');

// ==================== RUTAS PÚBLICAS PARA BANNERS ====================

/**
 * @route   GET /api/banners/active
 * @desc    Obtener banners activos (público)
 * @access  Público
 */
router.get('/active', BannerController.getActiveBanners);

// ==================== RUTAS DE ADMINISTRACIÓN ====================

/**
 * @route   GET /api/admin/banners
 * @desc    Obtener todos los banners (administrador)
 * @access  Administrador
 */
router.get('/', authenticate, isAdmin, BannerController.getBanners);

/**
 * @route   POST /api/admin/banners
 * @desc    Crear nuevo banner
 * @access  Administrador
 */
router.post('/', authenticate, isAdmin, uploadBannerImage, BannerController.createBanner);

/**
 * @route   PUT /api/admin/banners/:id
 * @desc    Actualizar banner
 * @access  Administrador
 */
router.put('/:id', authenticate, isAdmin, uploadBannerImage, BannerController.updateBanner);

/**
 * @route   DELETE /api/admin/banners/:id
 * @desc    Eliminar banner
 * @access  Administrador
 */
router.delete('/:id', authenticate, isAdmin, BannerController.deleteBanner);

// TODO: Implementar toggleBannerStatus y reorderBanners en el controlador
// router.patch('/:id/toggle', authenticateToken, requireAdmin, BannerController.toggleBannerStatus);
// router.put('/reorder', authenticateToken, requireAdmin, BannerController.reorderBanners);

module.exports = router;