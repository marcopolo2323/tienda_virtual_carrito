import { create } from 'zustand';
import axios from '../utils/axios';

const useProductStore = create((set) => ({
  // Estado
  products: [],
  product: null,
  featuredProducts: [],
  loading: false,
  error: null,
  totalPages: 0,
  currentPage: 1,
  
  // Helper function para normalizar URLs de imágenes
  normalizeImageUrl: (imageUrl) => {
    if (!imageUrl) return null;
    
    // Si ya es una URL completa, devolverla tal como está
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Si parece ser un public_id de Cloudinary, construir la URL
    if (imageUrl.includes('tienda-productos/') || imageUrl.startsWith('product-')) {
      const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
      if (cloudName) {
        return `https://res.cloudinary.com/${cloudName}/image/upload/${imageUrl}`;
      }
    }
    
    // Fallback para imágenes locales
    const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
    return `${baseUrl}/src/uploads/${imageUrl}`;
  },
  
  // Helper function para normalizar un producto
  normalizeProduct: (product) => {
    if (!product) return null;
    
    return {
      ...product,
      // Normalizar la URL de la imagen
      image_url: useProductStore.getState().normalizeImageUrl(product.image_url),
      // Asegurar que price sea un número
      price: parseFloat(product.price || 0),
      // Asegurar que stock sea un número
      stock: parseInt(product.stock || 0),
      // Asegurar que discount_percent sea un número
      discount_percent: parseFloat(product.discount_percent || 0)
    };
  },
  
  // Helper function para normalizar array de productos
  normalizeProducts: (products) => {
    if (!Array.isArray(products)) return [];
    return products.map(product => useProductStore.getState().normalizeProduct(product));
  },
  
  // Acciones
  fetchProducts: async ({ page = 1, limit = 10, category = null, search = '', sort = '' }) => {
    set({ loading: true });
    try {
      let url = `/products?page=${page}&limit=${limit}`;
      if (category) url += `&category=${category}`;
      if (search) url += `&search=${search}`;
      if (sort) url += `&sort=${sort}`;
      
      const response = await axios.get(url);
      
      // Validar que la respuesta contenga un array de productos
      const rawProducts = Array.isArray(response.data.products) ? response.data.products : [];
      const normalizedProducts = useProductStore.getState().normalizeProducts(rawProducts);
      
      console.log('Products fetched:', {
        raw: rawProducts.length,
        normalized: normalizedProducts.length,
        firstProduct: normalizedProducts[0]
      });
      
      set({
        loading: false,
        products: normalizedProducts,
        totalPages: response.data.totalPages || 0,
        currentPage: response.data.currentPage || 1,
        error: null
      });
      return response.data;
    } catch (err) {
      console.error('Error fetching products:', err);
      set({
        loading: false,
        products: [],
        error: err.response?.data?.message || 'Failed to fetch products'
      });
      throw err;
    }
  },
  
  fetchProductById: async (productId) => {
    set({ loading: true });
    try {
      const response = await axios.get(`/products/${productId}`);
      const normalizedProduct = useProductStore.getState().normalizeProduct(response.data);
      
      console.log('Product fetched:', {
        id: productId,
        raw: response.data,
        normalized: normalizedProduct
      });
      
      set({
        loading: false,
        product: normalizedProduct,
        error: null
      });
      return normalizedProduct;
    } catch (err) {
      console.error('Error fetching product:', err);
      set({
        loading: false,
        product: null,
        error: err.response?.data?.message || 'Failed to fetch product'
      });
      throw err;
    }
  },
  
  fetchFeaturedProducts: async (limit = 4) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`/products/featured?limit=${limit}`);
      
      // Validar la respuesta y asegurar que sea un array
      let rawFeaturedProducts = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          rawFeaturedProducts = response.data;
        } else if (Array.isArray(response.data.products)) {
          rawFeaturedProducts = response.data.products;
        } else if (Array.isArray(response.data.data)) {
          rawFeaturedProducts = response.data.data;
        }
      }
      
      const normalizedFeaturedProducts = useProductStore.getState().normalizeProducts(rawFeaturedProducts);
      
      console.log('Featured products fetched:', {
        raw: rawFeaturedProducts.length,
        normalized: normalizedFeaturedProducts.length,
        firstProduct: normalizedFeaturedProducts[0]
      });
      
      set({
        loading: false,
        featuredProducts: normalizedFeaturedProducts,
        error: null
      });
      return normalizedFeaturedProducts;
    } catch (err) {
      console.error('Error fetching featured products:', err);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Failed to fetch featured products';
      
      if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica que el backend esté ejecutándose.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Productos destacados no encontrados';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Error del servidor. Intenta más tarde.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      set({
        loading: false,
        featuredProducts: [], // Mantener array vacío en caso de error
        error: errorMessage
      });
      
      // No hacer throw del error para evitar crashes
      console.warn('⚠️ Productos destacados no disponibles:', errorMessage);
      return [];
    }
  },
  
  clearProductError: () => set({ error: null }),
  
  clearCurrentProduct: () => set({ product: null }),
  
  // Método adicional para resetear el estado
  resetProductState: () => set({
    products: [],
    product: null,
    featuredProducts: [],
    loading: false,
    error: null,
    totalPages: 0,
    currentPage: 1,
  }),
}));

export default useProductStore;