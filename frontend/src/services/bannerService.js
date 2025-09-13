import axios from 'axios';

class BannerService {
  // Crear banner
  async createBanner(bannerData) {
    try {
      // Si bannerData ya es FormData, usarlo directamente
      if (bannerData instanceof FormData) {
        const response = await axios.post('/admin/banners', bannerData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      }
      
      // Si no es FormData, construir uno nuevo
      const formData = new FormData();
      formData.append('title', bannerData.title);
      formData.append('description', bannerData.description);
      formData.append('active', bannerData.active);
      formData.append('display_order', bannerData.display_order);
      
      // Campos opcionales
      if (bannerData.link_url) {
        formData.append('link_url', bannerData.link_url);
      }
      
      if (bannerData.button_text) {
        formData.append('button_text', bannerData.button_text);
      }
      
      // Imagen
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
      throw new Error(error.response?.data?.message || 'Error al crear el banner');
    }
  }

  // Obtener banners (admin)
  async getBanners(page = 1, limit = 10) {
    try {
      const response = await axios.get(`/admin/banners?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener los banners');
    }
  }

  // Obtener banners activos (público)
  async getActiveBanners() {
    try {
      const response = await axios.get('/banners/active');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al obtener los banners activos');
    }
  }

  // Actualizar banner
  async updateBanner(id, bannerData) {
    try {
      const formData = new FormData();
      
      // Campos que pueden actualizarse
      if (bannerData.title) formData.append('title', bannerData.title);
      if (bannerData.description) formData.append('description', bannerData.description);
      if (bannerData.link_url) formData.append('link_url', bannerData.link_url);
      if (bannerData.button_text) formData.append('button_text', bannerData.button_text);
      if (bannerData.active !== undefined) formData.append('active', bannerData.active);
      if (bannerData.display_order !== undefined) formData.append('display_order', bannerData.display_order);
      
      // Nueva imagen (opcional)
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
      throw new Error(error.response?.data?.message || 'Error al actualizar el banner');
    }
  }

  // Eliminar banner
  async deleteBanner(id) {
    try {
      const response = await axios.delete(`/admin/banners/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Error al eliminar el banner');
    }
  }
}

const bannerService = new BannerService();
export default bannerService;