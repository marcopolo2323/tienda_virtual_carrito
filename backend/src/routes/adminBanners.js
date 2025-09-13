const express = require('express');
const router = express.Router();
const { authenticate: authenticateToken, isAdmin: requireAdmin } = require('../middlewares/auth');
const { uploadBannerImage } = require('../middlewares/uploadBanner');
const BannerController = require('../controllers/bannerController');

// ==================== RUTAS DE ADMIN PARA BANNERS ====================

/**
 * @route   POST /api/admin/banners
 * @desc    Crear nuevo banner
 * @access  Admin
 */
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  uploadBannerImage, 
  BannerController.createBanner
);

/**
 * @route   GET /api/admin/banners
 * @desc    Obtener todos los banners (admin)
 * @access  Admin
 */
router.get('/', 
  authenticateToken, 
  requireAdmin, 
  BannerController.getBanners
);

/**
 * @route   PUT /api/admin/banners/:id
 * @desc    Actualizar banner
 * @access  Admin
 */
router.put('/:id', 
  authenticateToken, 
  requireAdmin, 
  uploadBannerImage, 
  BannerController.updateBanner
);

/**
 * @route   DELETE /api/admin/banners/:id
 * @desc    Eliminar banner
 * @access  Admin
 */
router.delete('/:id', 
  authenticateToken, 
  requireAdmin, 
  BannerController.deleteBanner
);

module.exports = router;