// services/bannerService.js - Lógica de negocio
const Banner = require('../models/Banner');
const { sequelize } = require('../config/database');

class BannerService {
  /**
   * Obtener banners activos para el frontend público
   */
  static async getActiveBanners() {
    return await Banner.findAll({
      where: { active: true },
      order: [['display_order', 'ASC'], ['created_at', 'ASC']],
      attributes: ['id', 'title', 'description', 'image_url', 'link_url', 'button_text', 'display_order']
    });
  }

  /**
   * Obtener banners con paginación (admin)
   */
  static async getBannersWithPagination(page = 1, limit = 10, activeFilter = null) {
    const offset = (page - 1) * limit;
    const whereClause = {};
    
    if (activeFilter !== null) {
      whereClause.active = activeFilter;
    }
    
    const { count, rows } = await Banner.findAndCountAll({
      where: whereClause,
      order: [['display_order', 'ASC'], ['created_at', 'DESC']],
      limit,
      offset
    });
    
    return {
      banners: rows,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(count / limit),
        total_count: count,
        per_page: limit
      }
    };
  }

  /**
   * Crear un nuevo banner
   */
  static async createBanner(bannerData) {
    // Limpiar URL vacía
    if (bannerData.link_url && bannerData.link_url.trim() === '') {
      bannerData.link_url = null;
    }

    return await Banner.create(bannerData);
  }

  /**
   * Actualizar un banner
   */
  static async updateBanner(id, bannerData) {
    // Limpiar URL vacía
    if (bannerData.link_url && bannerData.link_url.trim() === '') {
      bannerData.link_url = null;
    }

    const [affectedRows] = await Banner.update(bannerData, {
      where: { id },
      returning: true
    });

    if (affectedRows === 0) {
      throw new Error('Banner not found');
    }

    return await Banner.findByPk(id);
  }

  /**
   * Eliminar un banner
   */
  static async deleteBanner(id) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw new Error('Banner not found');
    }

    await banner.destroy();
    return banner;
  }

  /**
   * Cambiar estado de un banner
   */
  static async toggleBannerStatus(id, active) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw new Error('Banner not found');
    }

    banner.active = active;
    await banner.save();
    
    return banner;
  }

  /**
   * Actualizar orden de display de banners
   */
  static async updateDisplayOrder(orderArray) {
    const transaction = await sequelize.transaction();
    
    try {
      const updatePromises = orderArray.map((item, index) => {
        return Banner.update(
          { display_order: index },
          { 
            where: { id: item.id },
            transaction 
          }
        );
      });
      
      await Promise.all(updatePromises);
      await transaction.commit();
      
      return { success: true };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Obtener un banner por ID
   */
  static async getBannerById(id) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw new Error('Banner not found');
    }
    return banner;
  }
}

module.exports = BannerService;