// services/bannerService.js - Servicio para conectar con la axios de banners
import axios from '../utils/axios';

class BannerService {
  
  // Métodos públicos (frontend)
  async getActiveBanners() {
    try {
      const response = await axios.get('/banners/active');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch active banners');
    }
  }

  // Métodos admin
  async getBanners(page = 1, limit = 10, activeFilter = null) {
    try {
      const params = {
        page,
        limit,
        ...(activeFilter !== null && { active: activeFilter })
      };
      
      const response = await axios.get('/admin/banners', { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch banners');
    }
  }

  async createBanner(bannerData) {
    try {
      // Crear FormData para manejar archivo de imagen
      const formData = new FormData();
      
      // Agregar campos de texto
      formData.append('title', bannerData.title);
      formData.append('description', bannerData.description);
      
      if (bannerData.link_url) {
        formData.append('link_url', bannerData.link_url);
      }
      
      if (bannerData.button_text) {
        formData.append('button_text', bannerData.button_text);
      }
      
      formData.append('active', bannerData.active !== undefined ? bannerData.active : true);
      formData.append('display_order', bannerData.display_order || 0);
      
      // Agregar imagen si existe
      if (bannerData.image) {
        formData.append('image', bannerData.image);
      }

      const response = await axios.post('/admin/banners', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create banner');
    }
  }

  async updateBanner(id, bannerData) {
    try {
      const formData = new FormData();
      
      // Agregar campos de texto
      formData.append('title', bannerData.title);
      formData.append('description', bannerData.description);
      
      if (bannerData.link_url) {
        formData.append('link_url', bannerData.link_url);
      }
      
      if (bannerData.button_text) {
        formData.append('button_text', bannerData.button_text);
      }
      
      formData.append('active', bannerData.active !== undefined ? bannerData.active : true);
      formData.append('display_order', bannerData.display_order || 0);
      
      // Solo agregar imagen si se seleccionó una nueva
      if (bannerData.image) {
        formData.append('image', bannerData.image);
      }

      const response = await axios.put(`/admin/banners/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update banner');
    }
  }

  async deleteBanner(id) {
    try {
      const response = await axios.delete(`/admin/banners/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete banner');
    }
  }

  async toggleBannerStatus(id, active) {
    try {
      const response = await axios.put(`/admin/banners/${id}/status`, { active });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update banner status');
    }
  }

  async reorderBanners(orderArray) {
    try {
      const response = await axios.put('/admin/banners/reorder', { order: orderArray });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reorder banners');
    }
  }
}

export default new BannerService();