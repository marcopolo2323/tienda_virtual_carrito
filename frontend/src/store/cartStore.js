import { create } from 'zustand';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const useCartStore = create((set, get) => ({
  // Estado
  items: [],
  total: 0,
  itemCount: 0,
  loading: false,
  error: null, 
  
  // Helper function para verificar autenticación
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },
  
  // Helper function para normalizar un item del carrito
  normalizeCartItem: (item) => {
    // Normalizar estructura de datos (puede venir de diferentes formas)
    const product = item.Product || item.product || {};
    
    return {
      ...item,
      // Asegurar que estos valores sean números
      price: parseFloat(item.price || product.price || 0),
      quantity: parseInt(item.quantity || 0),
      stock: parseInt(item.stock || product.stock || 0),
      // Asegurar que estos campos existan
      product_id: item.product_id || item.productId || product.id,
      name: item.name || product.name || 'Unknown Product',
      image_url: item.image_url || product.image_url || product.imageUrl,
      // Mantener referencia al producto completo si existe
      product: product
    };
  },
  
  // Función para normalizar todos los items
  normalizeCartItems: (items) => {
    if (!Array.isArray(items)) return [];
    return items.map(item => get().normalizeCartItem(item));
  },
  
  // Función para calcular los totales correctamente
  calculateTotals: (items) => {
    if (!Array.isArray(items) || items.length === 0) {
      return { total: 0, itemCount: 0 };
    }
    
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 0);
      return sum + (price * quantity);
    }, 0);
    
    const itemCount = items.reduce((sum, item) => {
      return sum + parseInt(item.quantity || 0);
    }, 0);
    
    return { 
      total: parseFloat(total.toFixed(2)), 
      itemCount 
    };
  },
  
  // Acciones
  fetchCart: async () => {
    // Verificar autenticación antes de hacer la petición
    if (!get().isAuthenticated()) {
      console.log('❌ Usuario no autenticado, no se puede cargar carrito');
      set({
        items: [],
        total: 0,
        itemCount: 0,
        loading: false,
        error: 'Please log in to view your cart'
      });
      return;
    }

    set({ loading: true, error: null });
    console.log('🛒 Iniciando carga del carrito...');
    
    try {
      const response = await axios.get('/cart');
      
      // DEBUG: Log completo de la respuesta
      console.log('📦 Respuesta completa del servidor:', response);
      console.log('📦 Datos de respuesta:', response.data);
      console.log('📦 Status de respuesta:', response.status);
      
      // Intentar diferentes estructuras de respuesta
      let rawItems = [];
      let serverTotal = 0;
      
      if (response.data.data && response.data.data.items) {
        // Estructura: { data: { items: [...], total: X } }
        rawItems = response.data.data.items;
        serverTotal = parseFloat(response.data.data.total || 0);
        console.log('📦 Estructura encontrada: response.data.data.items');
      } else if (response.data.items) {
        // Estructura: { items: [...], total: X }
        rawItems = response.data.items;
        serverTotal = parseFloat(response.data.total || 0);
        console.log('📦 Estructura encontrada: response.data.items');
      } else if (Array.isArray(response.data)) {
        // Estructura: [...items]
        rawItems = response.data;
        console.log('📦 Estructura encontrada: Array directo');
      } else {
        console.log('⚠️ Estructura de respuesta no reconocida');
        rawItems = [];
      }
      
      console.log('📦 Items crudos extraídos:', rawItems);
      console.log('📦 Total del servidor:', serverTotal);
      
      // Normalizar items
      const normalizedItems = get().normalizeCartItems(rawItems);
      console.log('📦 Items normalizados:', normalizedItems);
      
      // Calcular totales localmente
      const { total, itemCount } = get().calculateTotals(normalizedItems);
      
      console.log('🧮 Cálculos locales - Total:', total, 'Items:', itemCount);
      
      set({
        items: normalizedItems,
        total: serverTotal || total, // Usar total del servidor si está disponible
        itemCount: itemCount,
        loading: false,
        error: null
      });
      
      console.log('✅ Cart loaded successfully:', { 
        itemsLength: normalizedItems.length, 
        total: serverTotal || total, 
        itemCount,
        firstItem: normalizedItems[0] || 'No items'
      });
      
    } catch (err) {
      console.error('❌ Error fetching cart:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      // Si es error de autenticación, limpiar el carrito
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('❌ Error de autenticación, limpiando token');
        localStorage.removeItem('token'); // Limpiar token inválido
        set({
          items: [],
          total: 0,
          itemCount: 0,
          loading: false,
          error: 'Please log in to view your cart'
        });
      } else {
        set({
          loading: false,
          error: err.response?.data?.message || 'Failed to load your cart'
        });
      }
    }
  },
  
  addToCart: async (productId, quantity = 1) => {
    console.log('🛒 Intentando agregar al carrito:', { productId, quantity });
    
    if (!get().isAuthenticated()) {
      console.log('❌ Usuario no autenticado');
      toast.error('Please log in to add items to cart');
      return false;
    }

    set({ loading: true, error: null });
    console.log('🔄 Enviando request a /cart/add...');
    
    try {
      const requestData = { productId, quantity };
      console.log('📤 Datos enviados:', requestData);
      
      const response = await axios.post('/cart/add', requestData);
      
      console.log('📦 Respuesta de addToCart:', response);
      console.log('📦 Status:', response.status);
      console.log('📦 Data:', response.data);
      
      // Verificar si la respuesta contiene datos del carrito actualizado
      if (response.data.data?.items) {
        console.log('✅ Respuesta contiene carrito actualizado');
        const normalizedItems = get().normalizeCartItems(response.data.data.items);
        const { total, itemCount } = get().calculateTotals(normalizedItems);
        set({
          items: normalizedItems,
          total: total,
          itemCount: itemCount,
          loading: false,
          error: null
        });
      } else {
        console.log('🔄 Respuesta no contiene carrito, recargando...');
        // Si no viene el carrito actualizado, obtenerlo
        await get().fetchCart();
      }
      
      toast.success('Item added to cart!');
      console.log('✅ Producto agregado exitosamente');
      return true;
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('❌ Error de autenticación en addToCart');
        toast.error('Please log in to add items to cart');
        localStorage.removeItem('token'); // Limpiar token inválido
      } else if (err.response?.status === 400) {
        console.log('❌ Error de request en addToCart');
        toast.error(err.response?.data?.message || 'Product not available');
      } else {
        console.log('❌ Error genérico en addToCart');
        toast.error(err.response?.data?.message || 'Failed to add item to cart');
      }
      
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to add item to cart'
      });
      return false;
    }
  },
  
  updateCartItem: async (productId, quantity) => {
    if (!get().isAuthenticated()) {
      toast.error('Please log in to update cart');
      return;
    }

    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }
    
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`/cart/update`, { productId, quantity });
      
      // Verificar si la respuesta contiene datos del carrito actualizado
      if (response.data.data?.items) {
        const normalizedItems = get().normalizeCartItems(response.data.data.items);
        const { total, itemCount } = get().calculateTotals(normalizedItems);
        set({
          items: normalizedItems,
          total: total,
          itemCount: itemCount,
          loading: false,
          error: null
        });
      } else {
        // Si no viene el carrito actualizado, obtenerlo
        await get().fetchCart();
      }
      
      toast.success('Cart updated!');
    } catch (err) {
      console.error('Error updating cart:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Please log in to update cart');
        localStorage.removeItem('token'); // Limpiar token inválido
      } else {
        toast.error(err.response?.data?.message || 'Failed to update cart');
      }
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to update cart'
      });
    }
  },
  
  removeFromCart: async (productId) => {
    if (!get().isAuthenticated()) {
      toast.error('Please log in to modify cart');
      return;
    }

    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`/cart/remove/${productId}`);
      
      // Verificar si la respuesta contiene datos del carrito actualizado
      if (response.data.data?.items) {
        const normalizedItems = get().normalizeCartItems(response.data.data.items);
        const { total, itemCount } = get().calculateTotals(normalizedItems);
        set({
          items: normalizedItems,
          total: total,
          itemCount: itemCount,
          loading: false,
          error: null
        });
      } else {
        // Si no viene el carrito actualizado, obtenerlo
        await get().fetchCart();
      }
      
      toast.success('Item removed from cart!');
    } catch (err) {
      console.error('Error removing from cart:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Please log in to modify cart');
        localStorage.removeItem('token'); // Limpiar token inválido
      } else {
        toast.error(err.response?.data?.message || 'Failed to remove item from cart');
      }
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to remove item from cart'
      });
    }
  },
  
  clearCart: async () => {
    if (!get().isAuthenticated()) {
      toast.error('Please log in to clear cart');
      return;
    }

    set({ loading: true, error: null });
    try {
      await axios.delete('/cart');
      toast.success('Cart cleared!');
      set({
        items: [],
        total: 0,
        itemCount: 0,
        loading: false,
        error: null
      });
    } catch (err) {
      console.error('Error clearing cart:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Please log in to clear cart');
        localStorage.removeItem('token'); // Limpiar token inválido
      } else {
        toast.error(err.response?.data?.message || 'Failed to clear cart');
      }
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to clear cart'
      });
    }
  },

  // Método para limpiar el carrito cuando el usuario se desconecta
  clearCartOnLogout: () => {
    console.log('Clearing cart on logout');
    set({
      items: [],
      total: 0,
      itemCount: 0,
      loading: false,
      error: null
    });
  },

  // Método para refrescar el carrito (útil después del login)
  refreshCart: async () => {
    if (get().isAuthenticated()) {
      console.log('Refreshing cart after authentication');
      await get().fetchCart();
    }
  },
}));

export default useCartStore;