// utils/bannerUtils.js - Utilidades para manipular banners
class BannerUtils {
  /**
   * Optimizar URL de imagen de Cloudinary
   */
  static getOptimizedImageUrl(imageUrl, width = 1200, height = 400, quality = 'auto:good') {
    if (!imageUrl) return null;
    
    // Si es una URL de Cloudinary, optimizarla
    if (imageUrl.includes('cloudinary.com')) {
      const parts = imageUrl.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/w_${width},h_${height},c_fill,q_${quality},f_auto/${parts[1]}`;
      }
    }
    
    return imageUrl;
  }

  /**
   * Obtener diferentes variantes de imagen para responsive
   */
  static getImageVariants(imageUrl) {
    return {
      mobile: this.getOptimizedImageUrl(imageUrl, 768, 300),
      tablet: this.getOptimizedImageUrl(imageUrl, 1024, 400),
      desktop: this.getOptimizedImageUrl(imageUrl, 1200, 400),
      thumbnail: this.getOptimizedImageUrl(imageUrl, 300, 150)
    };
  }

  /**
   * Validar datos de banner antes de crear/actualizar
   */
  static validateBannerData(data) {
    const errors = [];

    if (!data.title || data.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (data.title && data.title.length > 255) {
      errors.push('Title must be less than 255 characters');
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push('Description is required');
    }

    if (!data.image_url || data.image_url.trim().length === 0) {
      errors.push('Image URL is required');
    }

    if (data.button_text && data.button_text.length > 100) {
      errors.push('Button text must be less than 100 characters');
    }

    if (data.display_order && (isNaN(data.display_order) || data.display_order < 0)) {
      errors.push('Display order must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatear banner para respuesta de API
   */
  static formatBannerResponse(banner) {
    if (!banner) return null;

    return {
      id: banner.id,
      title: banner.title,
      description: banner.description,
      image_url: banner.image_url,
      optimized_image: this.getOptimizedImageUrl(banner.image_url),
      image_variants: this.getImageVariants(banner.image_url),
      link_url: banner.link_url,
      button_text: banner.button_text,
      active: banner.active,
      display_order: banner.display_order,
      created_at: banner.created_at,
      updated_at: banner.updated_at
    };
  }

  /**
   * Formatear múltiples banners para respuesta de API
   */
  static formatBannersResponse(banners) {
    if (!Array.isArray(banners)) return [];
    
    return banners.map(banner => this.formatBannerResponse(banner));
  }

  /**
   * Limpiar datos de entrada
   */
  static sanitizeBannerInput(data) {
    const sanitized = { ...data };

    // Limpiar strings
    if (sanitized.title) {
      sanitized.title = sanitized.title.trim();
    }

    if (sanitized.description) {
      sanitized.description = sanitized.description.trim();
    }

    if (sanitized.button_text) {
      sanitized.button_text = sanitized.button_text.trim();
    }

    // Limpiar URL vacía
    if (sanitized.link_url && sanitized.link_url.trim() === '') {
      sanitized.link_url = null;
    } else if (sanitized.link_url) {
      sanitized.link_url = sanitized.link_url.trim();
    }

    // Convertir tipos
    if (sanitized.active !== undefined) {
      sanitized.active = sanitized.active === 'true' || sanitized.active === true;
    }

    if (sanitized.display_order !== undefined) {
      sanitized.display_order = parseInt(sanitized.display_order) || 0;
    }

    return sanitized;
  }
}

module.exports = BannerUtils;