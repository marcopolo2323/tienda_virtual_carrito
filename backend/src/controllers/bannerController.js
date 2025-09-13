const { Banner } = require('../models');

class BannerController {
  /**
   * Crear un nuevo banner
   * POST /api/admin/banners
   */
  static async createBanner(req, res) {
    try {
      console.log('🎯 CONTROLLER CALLED');
      console.log('📋 Request body:', req.body);
      console.log('📋 Request file:', req.file);
      
      const { title, description, link_url, button_text, active, display_order } = req.body;
      
      // Validaciones básicas
      if (!title || !description) {
        return res.status(400).json({
          success: false,
          message: 'Título y descripción son requeridos'
        });
      }
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere una imagen'
        });
      }
      
      // Crear banner
      const banner = await Banner.create({
        title: title.trim(),
        description: description.trim(),
        image_url: req.file.url,
        public_id: req.file.public_id,
        link_url: link_url?.trim() || null,
        button_text: button_text?.trim() || 'Ver más',
        active: active === 'true' || active === true,
        display_order: parseInt(display_order) || 0
      });
      
      res.status(201).json({
        success: true,
        message: 'Banner creado exitosamente',
        data: banner
      });
    } catch (error) {
      console.error('Error creating banner:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener todos los banners (admin)
   * GET /api/admin/banners
   */
  static async getBanners(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;
      
      const { count, rows: banners } = await Banner.findAndCountAll({
        order: [['display_order', 'ASC'], ['created_at', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      res.json({
        success: true,
        data: banners,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching banners:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Obtener banners activos (público)
   * GET /api/banners/active
   */
  static async getActiveBanners(req, res) {
    try {
      const banners = await Banner.findAll({
        where: { active: true },
        order: [['display_order', 'ASC']],
        attributes: ['id', 'title', 'description', 'image_url', 'link_url', 'button_text']
      });
      
      res.json({
        success: true,
        data: banners
      });
    } catch (error) {
      console.error('Error fetching active banners:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Actualizar banner
   * PUT /api/admin/banners/:id
   */
  static async updateBanner(req, res) {
    try {
      const { id } = req.params;
      const { title, description, link_url, button_text, active, display_order } = req.body;
      
      const banner = await Banner.findByPk(id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: 'Banner no encontrado'
        });
      }
      
      // Actualizar campos
      banner.title = title?.trim() || banner.title;
      banner.description = description?.trim() || banner.description;
      banner.link_url = link_url?.trim() || banner.link_url;
      banner.button_text = button_text?.trim() || banner.button_text;
      banner.active = active !== undefined ? (active === 'true' || active === true) : banner.active;
      banner.display_order = display_order !== undefined ? parseInt(display_order) : banner.display_order;
      
      // Si hay nueva imagen
      if (req.file) {
        banner.image_url = req.file.url;
        banner.public_id = req.file.public_id;
      }
      
      await banner.save();
      
      res.json({
        success: true,
        message: 'Banner actualizado exitosamente',
        data: banner
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  /**
   * Eliminar banner
   * DELETE /api/admin/banners/:id
   */
  static async deleteBanner(req, res) {
    try {
      const { id } = req.params;
      
      const banner = await Banner.findByPk(id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: 'Banner no encontrado'
        });
      }
      
      await banner.destroy();
      
      res.json({
        success: true,
        message: 'Banner eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error deleting banner:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

module.exports = BannerController;