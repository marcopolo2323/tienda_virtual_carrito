import { create } from 'zustand';
import axios from '../utils/axios';

const useCategoryStore = create((set) => ({
  // Estado
  categories: [],
  loading: false,
  error: null,
  
  // Acciones
  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/api/categories');
      console.log('🔍 CategoryStore - Full response:', response.data);
      console.log('🔍 CategoryStore - Categories:', response.data.categories);
      
      // CORRECCIÓN: Usar response.data.categories en lugar de response.data
      set({
        loading: false,
        categories: response.data.categories || [], // ← Esta es la línea clave
        error: null
      });
      return response.data.categories;
    } catch (err) {
      console.error('❌ CategoryStore error:', err);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Failed to fetch categories';
      
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté ejecutándose.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Endpoint de categorías no encontrado';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta más tarde.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      set({
        loading: false,
        error: errorMessage,
        categories: [] // Limpiar categorías en caso de error
      });
      
      // No hacer throw del error para evitar crashes
      console.warn('⚠️ Categorías no disponibles:', errorMessage);
      return [];
    }
  },
  
  clearCategoryError: () => set({ error: null }),
}));

export default useCategoryStore;