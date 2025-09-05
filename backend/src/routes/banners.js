// routes/banners.js - Rutas usando Controller (Versión limpia y mejorada)
const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken, isAdmin: requireAdmin } = require('../middlewares/auth');
const { uploadBannerImage } = require('../middlewares/uploadBanner');
const BannerController = require('../controllers/bannerController');

// ==================== RUTAS PÚBLICAS ====================

/**
 * @route   GET /api/banners/active
 * @desc    Obtener banners activos para homepage
 * @access  Public
 */
router.get('/active', BannerController.getActiveBanners);

// ==================== RUTAS DE ADMIN ====================
// Estas rutas se registran bajo /api/banners pero requieren autenticación de admin

/**
 * @route   GET /api/banners/admin
 * @desc    Obtener todos los banners con paginación
 * @access  Admin
 */
router.get('/admin', authenticateToken, requireAdmin, BannerController.getBanners);

/**
 * @route   POST /api/banners/admin
 * @desc    Crear nuevo banner
 * @access  Admin
 */
router.post('/admin', 
  authenticateToken, 
  requireAdmin, 
  uploadBannerImage, 
  BannerController.createBanner
);

/**
 * @route   PUT /api/banners/admin/reorder
 * @desc    Reordenar banners (cambiar display_order)
 * @access  Admin
 */
router.put('/admin/reorder', authenticateToken, requireAdmin, BannerController.reorderBanners);

/**
 * @route   GET /api/banners/admin/:id
 * @desc    Obtener banner específico por ID
 * @access  Admin
 */
router.get('/admin/:id', authenticateToken, requireAdmin, BannerController.getBannerById);

/**
 * @route   PUT /api/banners/admin/:id
 * @desc    Actualizar banner existente
 * @access  Admin
 */
router.put('/admin/:id', 
  authenticateToken, 
  requireAdmin, 
  uploadBannerImage, 
  BannerController.updateBanner
);

/**
 * @route   DELETE /api/banners/admin/:id
 * @desc    Eliminar banner
 * @access  Admin
 */ 
router.delete('/admin/:id', authenticateToken, requireAdmin, BannerController.deleteBanner);

/**
 * @route   PATCH /api/banners/admin/:id/toggle
 * @desc    Cambiar estado activo/inactivo del banner
 * @access  Admin
 */
router.patch('/admin/:id/toggle', authenticateToken, requireAdmin, BannerController.toggleBannerStatus);

module.exports = router;