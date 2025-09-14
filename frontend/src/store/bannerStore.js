// store/bannerStore.js - Con mejor manejo de errores
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { toast } from 'react-toastify';
import bannerService from '../services/bannerService';

const useBannerStore = create(
  devtools(
    (set, get) => ({
      // Estado
      banners: [],
      activeBanners: [],
      currentBanner: null,
      pagination: {
        current_page: 1,
        total_pages: 0,
        total_count: 0,
        per_page: 10
      },
      loading: {
        banners: false,
        activeBanners: false,
        create: false,
        update: false,
        delete: false,
        reorder: false
      },
      errors: {
        banners: null,
        activeBanners: null,
        create: null,
        update: null,
        delete: null,
        reorder: null
      },

      // Acciones para banners públicos (frontend)
      fetchActiveBanners: async () => {
        set((state) => ({
          loading: { ...state.loading, activeBanners: true },
          errors: { ...state.errors, activeBanners: null }
        }));

        try {
          const response = await bannerService.getActiveBanners();
          set({
            activeBanners: response.data || [],
            loading: { ...get().loading, activeBanners: false }
          });
        } catch (error) {
          console.error('Error obteniendo banners activos:', error);
          set({
            errors: { ...get().errors, activeBanners: error.message },
            loading: { ...get().loading, activeBanners: false }
          });
        }
      },

      // Acciones para administración
      fetchBanners: async (page = 1, limit = 10, activeFilter = null) => {
        set((state) => ({
          loading: { ...state.loading, banners: true },
          errors: { ...state.errors, banners: null }
        }));

        try {
          const response = await bannerService.getBanners(page, limit, activeFilter);
          set({
            banners: response.data || [],
            pagination: response.pagination || get().pagination,
            loading: { ...get().loading, banners: false }
          });
        } catch (error) {
          console.error('Error obteniendo banners:', error);
          set({
            errors: { ...get().errors, banners: error.message },
            loading: { ...get().loading, banners: false }
          });
          toast.error('Failed to fetch banners');
        }
      },

      createBanner: async (bannerData) => {
        set((state) => ({
          loading: { ...state.loading, create: true },
          errors: { ...state.errors, create: null }
        }));

        try {
          console.log('Creating banner with data:', bannerData);

          const response = await bannerService.createBanner(bannerData);
          console.log('✅ Banner created successfully:', response);
          
          // Agregar el nuevo banner al inicio de la lista
          const currentBanners = get().banners;
          set({
            banners: [response.banner, ...currentBanners],
            loading: { ...get().loading, create: false }
          });
          console.log('✅ Banner added to store. Total banners:', get().banners.length);

          toast.success('Banner created successfully!');
          return response.banner;
        } catch (error) {
          console.error('Error creando banner:', error);
          
          // Extraer mensaje de error más detallado
          let errorMessage = 'Error al crear el banner';
          
          if (error.response?.data) {
            if (error.response.data.details) {
              // Si hay detalles de validación de Sequelize
              const validationErrors = error.response.data.details
                .map(err => `${err.field}: ${err.message}`)
                .join(', ');
              errorMessage = `Validation error: ${validationErrors}`;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({
            errors: { ...get().errors, create: errorMessage },
            loading: { ...get().loading, create: false }
          });
          
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      updateBanner: async (id, bannerData) => {
        set((state) => ({
          loading: { ...state.loading, update: true },
          errors: { ...state.errors, update: null }
        }));

        try {
          console.log('Updating banner with data:', {
            id,
            hasImage: bannerData.has('image'),
            title: bannerData.get('title'),
            description: bannerData.get('description'),
            link_url: bannerData.get('link_url'),
            button_text: bannerData.get('button_text'),
            active: bannerData.get('active'),
            display_order: bannerData.get('display_order')
          });

          const response = await bannerService.updateBanner(id, bannerData);
          
          // Actualizar banner en la lista
          const currentBanners = get().banners;
          const updatedBanners = currentBanners.map(banner =>
            banner.id === id ? response.banner : banner
          );
          
          set({
            banners: updatedBanners,
            currentBanner: response.banner,
            loading: { ...get().loading, update: false }
          });

          toast.success('¡Banner actualizado exitosamente!');
          return response.banner;
        } catch (error) {
          console.error('Error actualizando banner:', error);
          
          // Extraer mensaje de error más detallado
          let errorMessage = 'Error al actualizar el banner';
          
          if (error.response?.data) {
            if (error.response.data.details) {
              // Si hay detalles de validación de Sequelize
              const validationErrors = error.response.data.details
                .map(err => `${err.field}: ${err.message}`)
                .join(', ');
              errorMessage = `Validation error: ${validationErrors}`;
            } else if (error.response.data.message) {
              errorMessage = error.response.data.message;
            }
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({
            errors: { ...get().errors, update: errorMessage },
            loading: { ...get().loading, update: false }
          });
          
          toast.error(errorMessage);
          throw new Error(errorMessage);
        }
      },

      deleteBanner: async (id) => {
        set((state) => ({
          loading: { ...state.loading, delete: true },
          errors: { ...state.errors, delete: null }
        }));

        try {
          await bannerService.deleteBanner(id);
          
          // Remover banner de la lista
          const currentBanners = get().banners;
          const filteredBanners = currentBanners.filter(banner => banner.id !== id);
          
          set({
            banners: filteredBanners,
            loading: { ...get().loading, delete: false }
          });

          toast.success('¡Banner eliminado exitosamente!');
        } catch (error) {
          console.error('Error eliminando banner:', error);
          
          let errorMessage = 'Failed to delete banner';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({
            errors: { ...get().errors, delete: errorMessage },
            loading: { ...get().loading, delete: false }
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      toggleBannerStatus: async (id, active) => {
        try {
          const response = await bannerService.toggleBannerStatus(id, active);
          
          // Actualizar banner en la lista
          const currentBanners = get().banners;
          const updatedBanners = currentBanners.map(banner =>
            banner.id === id ? { ...banner, active: response.banner.active } : banner
          );
          
          set({ banners: updatedBanners });
          
          toast.success(`¡Banner ${active ? 'activado' : 'desactivado'} exitosamente!`);
          return response.banner;
        } catch (error) {
          console.error('Error cambiando estado del banner:', error);
          
          let errorMessage = 'Error al actualizar el estado del banner';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          toast.error(errorMessage);
          throw error;
        }
      },

      reorderBanners: async (orderArray) => {
        set((state) => ({
          loading: { ...state.loading, reorder: true },
          errors: { ...state.errors, reorder: null }
        }));

        try {
          await bannerService.reorderBanners(orderArray);
          
          // Actualizar orden local
          const currentBanners = get().banners;
          const reorderedBanners = orderArray.map(item => 
            currentBanners.find(banner => banner.id === item.id)
          ).filter(Boolean);
          
          set({
            banners: reorderedBanners,
            loading: { ...get().loading, reorder: false }
          });

          toast.success('¡Orden de banners actualizado exitosamente!');
        } catch (error) {
          console.error('Error reordenando banners:', error);
          
          let errorMessage = 'Error al reordenar los banners';
          if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          set({
            errors: { ...get().errors, reorder: errorMessage },
            loading: { ...get().loading, reorder: false }
          });
          
          toast.error(errorMessage);
          throw error;
        }
      },

      // Utilidades
      getBannerById: (id) => {
        return get().banners.find(banner => banner.id === id) || null;
      },

      setCurrentBanner: (banner) => {
        set({ currentBanner: banner });
      },

      clearCurrentBanner: () => {
        set({ currentBanner: null });
      },

      clearErrors: () => {
        set({
          errors: {
            banners: null,
            activeBanners: null,
            create: null,
            update: null,
            delete: null,
            reorder: null
          }
        });
      },

      // Reset store
      resetStore: () => {
        set({
          banners: [],
          activeBanners: [],
          currentBanner: null,
          pagination: {
            current_page: 1,
            total_pages: 0,
            total_count: 0,
            per_page: 10
          },
          loading: {
            banners: false,
            activeBanners: false,
            create: false,
            update: false,
            delete: false,
            reorder: false
          },
          errors: {
            banners: null,
            activeBanners: null,
            create: null,
            update: null,
            delete: null,
            reorder: null
          }
        });
      }
    }),
    {
      name: 'banner-store',
      partialize: (state) => ({
        // Solo persistir banners activos para mejorar performance
        activeBanners: state.activeBanners
      })
    }
  )
);

export default useBannerStore;