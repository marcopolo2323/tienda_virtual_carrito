import { create } from 'zustand';
import axios from '../utils/axios';

const useCategoryStore = create((set) => ({
  // Estado
  categories: [],
  loading: false,
  error: null,
  
  // Acciones
  fetchCategories: async () => {
    set({ loading: true });
    try {
      const response = await axios.get('/categories');
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
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to fetch categories'
      });
      throw err;
    }
  },
  
  clearCategoryError: () => set({ error: null }),
}));

export default useCategoryStore;