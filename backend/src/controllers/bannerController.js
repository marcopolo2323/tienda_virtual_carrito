// controllers/bannerController.js - Controlador mejorado con mejor manejo de errores
const BannerService = require('../services/bannerService');
const BannerUtils = require('../utils/bannerUtils');
const { deleteImage, getPublicIdFromUrl } = require('../config/cloudinary');

class BannerController {
  /**
   * Obtener banners activos para el frontend público
   * GET /api/banners/active
   */
  static async getActiveBanners(req, res) {
    try {
      const banners = await BannerService.getActiveBanners();
      
      res.json({
        success: true,
        banners: BannerUtils.formatBannersResponse(banners),
        count: banners.length
      });
    } catch (error) {
      console.error('Error fetching active banners:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching banners',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener banners con paginación (admin)
   * GET /api/admin/banners
   */
  static async getBanners(req, res) {
    try {
      const { page = 1, limit = 10, active } = req.query;
      
      const activeFilter = active !== undefined && active !== '' ? active === 'true' : null;
      
      const result = await BannerService.getBannersWithPagination(
        parseInt(page),
        parseInt(limit),
        activeFilter
      );
      
      res.json({
        success: true,
        ...result,
        banners: BannerUtils.formatBannersResponse(result.banners)
      });
    } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching banners',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Crear un nuevo banner
   * POST /api/admin/banners
   */
  static async createBanner(req, res) {
    try {
      console.log('Creating banner - Request body:', req.body);
      console.log('Creating banner - Files:', req.file ? 'Has file' : 'No file');
      
      // Validar que se proporcione una imagen
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Image file is required',
          details: [{ field: 'image', message: 'Image file is required' }]
        });
      }

      // Limpiar y validar datos de entrada
      const bannerData = BannerUtils.sanitizeBannerInput(req.body);
      bannerData.image_url = req.file.path; // URL de Cloudinary
      
      console.log('Sanitized banner data:', bannerData);
      
      // Validar datos
      const validation = BannerUtils.validateBannerData(bannerData);
      if (!validation.isValid) {
        // Limpiar imagen subida si validación falla
        await BannerController._cleanupImage(req.file.path);
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          details: validation.errors.map(error => ({ field: 'general', message: error }))
        });
      }

      console.log('Final banner data before creation:', bannerData);

      // Crear banner
      const banner = await BannerService.createBanner(bannerData);
      
      console.log('Banner created successfully:', banner.id);

      res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        banner: BannerUtils.formatBannerResponse(banner)
      });
    } catch (error) {
      console.error('Error creating banner:', error);
      
      // Limpiar imagen subida en caso de error
      if (req.file) {
        await BannerController._cleanupImage(req.file.path);
      }
      
      return BannerController._handleSequelizeError(error, res, 'Error creating banner');
    }
  }

  /**
   * Actualizar un banner existente
   * PUT /api/admin/banners/:id
   */
  static async updateBanner(req, res) {
    try {
      const { id } = req.params;
      
      console.log('Updating banner - ID:', id);
      console.log('Updating banner - Request body:', req.body);
      console.log('Updating banner - Files:', req.file ? 'Has file' : 'No file');

      // Obtener banner actual para referencia
      const existingBanner = await BannerService.getBannerById(id);
      
      // Limpiar y validar datos de entrada
      const bannerData = BannerUtils.sanitizeBannerInput(req.body);
      
      // Validar datos
      const dataToValidate = { ...bannerData };
      if (req.file) {
        dataToValidate.image_url = req.file.path;
      } else {
        dataToValidate.image_url = existingBanner.image_url;
      }
      
      const validation = BannerUtils.validateBannerData(dataToValidate);
      if (!validation.isValid) {
        if (req.file) {
          await BannerController._cleanupImage(req.file.path);
        }
        
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          details: validation.errors.map(error => ({ field: 'general', message: error }))
        });
      }

      let oldImageUrl = null;

      // Manejar nueva imagen si se subió
      if (req.file) {
        bannerData.image_url = req.file.path;
        oldImageUrl = existingBanner.image_url; // Guardar para limpiar después
      }

      console.log('Final banner data for update:', bannerData);

      // Actualizar banner
      const updatedBanner = await BannerService.updateBanner(id, bannerData);
      
      // Eliminar imagen anterior si se subió una nueva
      if (oldImageUrl && req.file) {
        await BannerController._cleanupImage(oldImageUrl);
      }
      
      console.log('Banner updated successfully:', updatedBanner.id);

      res.json({
        success: true,
        message: 'Banner updated successfully',
        banner: BannerUtils.formatBannerResponse(updatedBanner)
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      
      // Limpiar imagen subida en caso de error
      if (req.file) {
        await BannerController._cleanupImage(req.file.path);
      }
      
      if (error.message === 'Banner not found') {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }
      
      return BannerController._handleSequelizeError(error, res, 'Error updating banner');
    }
  }

  /**
   * Eliminar un banner
   * DELETE /api/admin/banners/:id
   */
  static async deleteBanner(req, res) {
    try {
      const { id } = req.params;
      
      const deletedBanner = await BannerService.deleteBanner(id);
      
      // Eliminar imagen asociada de Cloudinary
      if (deletedBanner.image_url) {
        await BannerController._cleanupImage(deletedBanner.image_url);
      }
      
      res.json({
        success: true,
        message: 'Banner deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      
      if (error.message === 'Banner not found') {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error deleting banner',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Cambiar estado de un banner
   * PATCH /api/admin/banners/:id/toggle
   */
  static async toggleBannerStatus(req, res) {
    try {
      const { id } = req.params;
      const { active } = req.body;
      
      if (typeof active !== 'boolean') {
        return res.status(400).json({
          success: false,
          message: 'Active field must be a boolean'
        });
      }
      
      const banner = await BannerService.toggleBannerStatus(id, active);
      
      res.json({
        success: true,
        message: `Banner ${active ? 'activated' : 'deactivated'} successfully`,
        banner: BannerUtils.formatBannerResponse(banner)
      });
    } catch (error) {
      console.error('Error toggling banner status:', error);
      
      if (error.message === 'Banner not found') {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error updating banner status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Reordenar banners
   * PUT /api/admin/banners/reorder
   */
  static async reorderBanners(req, res) {
    try {
      const { order } = req.body;
      
      if (!Array.isArray(order)) {
        return res.status(400).json({
          success: false,
          message: 'Order must be an array'
        });
      }
      
      if (order.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order array cannot be empty'
        });
      }
      
      // Validar que cada elemento tenga ID
      const invalidItems = order.filter(item => !item.id || isNaN(parseInt(item.id)));
      if (invalidItems.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'All banner items must have a valid ID'
        });
      }
      
      await BannerService.updateDisplayOrder(order);
      
      res.json({
        success: true,
        message: 'Banner order updated successfully'
      });
    } catch (error) {
      console.error('Error reordering banners:', error);
      
      res.status(500).json({
        success: false,
        message: 'Error reordering banners',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Obtener banner por ID
   * GET /api/admin/banners/:id
   */
  static async getBannerById(req, res) {
    try {
      const { id } = req.params;
      
      const banner = await BannerService.getBannerById(id);
      
      res.json({
        success: true,
        banner: BannerUtils.formatBannerResponse(banner)
      });
    } catch (error) {
      console.error('Error fetching banner:', error);
      
      if (error.message === 'Banner not found') {
        return res.status(404).json({
          success: false,
          message: 'Banner not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Error fetching banner',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Limpiar imagen de Cloudinary
   */
  static async _cleanupImage(imageUrl) {
    try {
      if (imageUrl) {
        const publicId = getPublicIdFromUrl(imageUrl);
        if (publicId) {
          await deleteImage(publicId);
          console.log('Image cleaned up successfully:', publicId);
        }
      }
    } catch (cleanupError) {
      console.error('Error cleaning up image:', cleanupError);
      // No lanzar error, solo logear
    }
  }

  /**
   * Manejar errores específicos de Sequelize
   */
  static _handleSequelizeError(error, res, defaultMessage) {
    // Manejo específico de errores de validación de Sequelize
    if (error.name === 'SequelizeValidationError') {
      const details = error.errors.map(err => ({
        field: err.path,
        message: err.message,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        details
      });
    }
    
    // Manejo de errores de unicidad
    if (error.name === 'SequelizeUniqueConstraintError') {
      const details = error.errors.map(err => ({
        field: err.path,
        message: `${err.path} must be unique`,
        value: err.value
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry',
        details
      });
    }
    
    // Error genérico
    return res.status(500).json({
      success: false,
      message: defaultMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

module.exports = BannerController;