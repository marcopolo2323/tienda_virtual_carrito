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

  // Helper function para cargar carrito desde localStorage
  loadLocalCart: () => {
    try {
      const localCart = localStorage.getItem('localCart');
      if (localCart) {
        const parsedCart = JSON.parse(localCart);
        const { total, itemCount } = get().calculateTotals(parsedCart);
        set({
          items: parsedCart,
          total,
          itemCount,
          loading: false,
          error: null
        });
        console.log('🛒 Carrito local cargado:', { items: parsedCart.length, total, itemCount });
        return true;
      }
    } catch (error) {
      console.error('Error loading local cart:', error);
    }
    return false;
  },

  // Helper function para guardar carrito en localStorage
  saveLocalCart: (items) => {
    try {
      localStorage.setItem('localCart', JSON.stringify(items));
      console.log('💾 Carrito guardado localmente:', items.length, 'items');
    } catch (error) {
      console.error('Error saving local cart:', error);
    }
  },

  // Helper function para sincronizar carrito local con servidor
  syncLocalCartWithServer: async () => {
    if (!get().isAuthenticated()) return false;

    try {
      const localCart = localStorage.getItem('localCart');
      if (!localCart) return true;

      const localItems = JSON.parse(localCart);
      console.log('🔄 Sincronizando carrito local con servidor:', localItems.length, 'items');

      // Obtener carrito del servidor
      await get().fetchCart();
      const serverItems = get().items;

      // Si el carrito local tiene items y el servidor está vacío, sincronizar
      if (localItems.length > 0 && serverItems.length === 0) {
        console.log('📤 Enviando items locales al servidor...');
        for (const item of localItems) {
          await get().addToCart(item.product_id, item.quantity);
        }
        // Limpiar carrito local después de sincronizar
        localStorage.removeItem('localCart');
        console.log('✅ Carrito local sincronizado con servidor');
      } else if (serverItems.length > 0) {
        // Si el servidor tiene items, usar el del servidor y limpiar el local
        localStorage.removeItem('localCart');
        console.log('📥 Usando carrito del servidor, limpiando local');
      }

      return true;
    } catch (error) {
      console.error('Error syncing local cart:', error);
      return false;
    }
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
        error: 'Por favor inicia sesión para ver tu carrito'
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
          error: 'Por favor inicia sesión para ver tu carrito'
        });
      } else {
        set({
          loading: false,
          error: err.response?.data?.message || 'Failed to load your cart'
        });
      }
    }
  },
  
  addToCart: async (productId, quantity = 1, productData = null) => {
    console.log('🛒 Intentando agregar al carrito:', { productId, quantity });
    
    set({ loading: true, error: null });

    // Si el usuario no está autenticado, manejar localmente
    if (!get().isAuthenticated()) {
      console.log('👤 Usuario no autenticado, guardando localmente');
      
      try {
        // Obtener datos del producto si no se proporcionan
        let product = productData;
        if (!product) {
          const response = await axios.get(`/products/${productId}`);
          product = response.data.product || response.data;
        }

        if (!product) {
          toast.error('Producto no encontrado');
          set({ loading: false, error: 'Product not found' });
          return false;
        }

        // Verificar stock
        if (product.stock < quantity) {
          toast.error(`Solo hay ${product.stock} unidades disponibles`);
          set({ loading: false, error: 'Insufficient stock' });
          return false;
        }

        // Obtener carrito actual
        const currentItems = [...get().items];
        
        // Buscar si el producto ya existe en el carrito
        const existingItemIndex = currentItems.findIndex(item => 
          item.product_id === productId || item.id === productId
        );

        if (existingItemIndex >= 0) {
          // Actualizar cantidad si ya existe
          const newQuantity = currentItems[existingItemIndex].quantity + quantity;
          if (newQuantity > product.stock) {
            toast.error(`No puedes agregar más de ${product.stock} unidades`);
            set({ loading: false, error: 'Exceeds available stock' });
            return false;
          }
          currentItems[existingItemIndex].quantity = newQuantity;
        } else {
          // Agregar nuevo item
          const newItem = {
            id: `local_${Date.now()}`,
            product_id: productId,
            quantity: quantity,
            price: parseFloat(product.price),
            name: product.name,
            image_url: product.image_url,
            stock: product.stock,
            product: product
          };
          currentItems.push(newItem);
        }

        // Calcular totales
        const { total, itemCount } = get().calculateTotals(currentItems);
        
        // Actualizar estado
        set({
          items: currentItems,
          total,
          itemCount,
          loading: false,
          error: null
        });

        // Guardar en localStorage
        get().saveLocalCart(currentItems);
        
        toast.success('Producto agregado al carrito!');
        console.log('✅ Producto agregado localmente');
        return true;
      } catch (err) {
        console.error('❌ Error adding to local cart:', err);
        toast.error('Error al agregar producto al carrito');
        set({
          loading: false,
          error: err.message || 'Failed to add item to cart'
        });
        return false;
      }
    }

    // Usuario autenticado - manejar en servidor
    console.log('🔄 Enviando request a /cart/add...');
    
    try {
      const requestData = { productId, quantity };
      console.log('📤 Datos enviados:', requestData);
      
      const response = await get().retryOperation(async () => {
        return await axios.post('/cart/add', requestData);
      });
      
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
      
      toast.success('¡Producto agregado al carrito!');
      console.log('✅ Producto agregado exitosamente');
      return true;
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      
      // Manejar errores de conexión
      if (get().handleConnectionError(err)) {
        set({ loading: false, error: 'Connection error' });
        return false;
      }
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        console.log('❌ Error de autenticación en addToCart');
        toast.error('Por favor inicia sesión para agregar productos al carrito');
        localStorage.removeItem('token'); // Limpiar token inválido
      } else if (err.response?.status === 400) {
        console.log('❌ Error de request en addToCart');
        toast.error(err.response?.data?.message || 'Producto no disponible');
      } else {
        console.log('❌ Error genérico en addToCart');
        toast.error(err.response?.data?.message || 'Error al agregar producto al carrito');
      }
      
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to add item to cart'
      });
      return false;
    }
  },
  
  updateCartItem: async (productId, quantity) => {
    if (quantity < 1) {
      toast.error('La cantidad debe ser al menos 1');
      return;
    }
    
    set({ loading: true, error: null });

    // Si el usuario no está autenticado, manejar localmente
    if (!get().isAuthenticated()) {
      try {
        const currentItems = [...get().items];
        const itemIndex = currentItems.findIndex(item => 
          item.product_id === productId || item.id === productId
        );

        if (itemIndex === -1) {
          toast.error('Producto no encontrado en el carrito');
          set({ loading: false, error: 'Item not found in cart' });
          return;
        }

        // Verificar stock
        if (quantity > currentItems[itemIndex].stock) {
          toast.error(`Solo hay ${currentItems[itemIndex].stock} unidades disponibles`);
          set({ loading: false, error: 'Insufficient stock' });
          return;
        }

        // Actualizar cantidad
        currentItems[itemIndex].quantity = quantity;

        // Calcular totales
        const { total, itemCount } = get().calculateTotals(currentItems);
        
        // Actualizar estado
        set({
          items: currentItems,
          total,
          itemCount,
          loading: false,
          error: null
        });

        // Guardar en localStorage
        get().saveLocalCart(currentItems);
        
        toast.success('Carrito actualizado!');
        console.log('✅ Carrito actualizado localmente');
        return;
      } catch (err) {
        console.error('Error updating local cart:', err);
        toast.error('Error al actualizar el carrito');
        set({
          loading: false,
          error: err.message || 'Failed to update cart'
        });
        return;
      }
    }

    // Usuario autenticado - manejar en servidor
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
        toast.error('Por favor inicia sesión para actualizar el carrito');
        localStorage.removeItem('token'); // Limpiar token inválido
      } else {
        toast.error(err.response?.data?.message || 'Error al actualizar el carrito');
      }
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to update cart'
      });
    }
  },
  
  removeFromCart: async (productId) => {
    set({ loading: true, error: null });

    // Si el usuario no está autenticado, manejar localmente
    if (!get().isAuthenticated()) {
      try {
        const currentItems = [...get().items];
        const itemIndex = currentItems.findIndex(item => 
          item.product_id === productId || item.id === productId
        );

        if (itemIndex === -1) {
          toast.error('Producto no encontrado en el carrito');
          set({ loading: false, error: 'Item not found in cart' });
          return;
        }

        // Remover item
        currentItems.splice(itemIndex, 1);

        // Calcular totales
        const { total, itemCount } = get().calculateTotals(currentItems);
        
        // Actualizar estado
        set({
          items: currentItems,
          total,
          itemCount,
          loading: false,
          error: null
        });

        // Guardar en localStorage
        get().saveLocalCart(currentItems);
        
        toast.success('Producto eliminado del carrito!');
        console.log('✅ Producto eliminado localmente');
        return;
      } catch (err) {
        console.error('Error removing from local cart:', err);
        toast.error('Error al eliminar producto del carrito');
        set({
          loading: false,
          error: err.message || 'Failed to remove item from cart'
        });
        return;
      }
    }

    // Usuario autenticado - manejar en servidor
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
      
      toast.success('¡Producto eliminado del carrito!');
    } catch (err) {
      console.error('Error removing from cart:', err);
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Por favor inicia sesión para modificar el carrito');
        localStorage.removeItem('token'); // Limpiar token inválido
      } else {
        toast.error(err.response?.data?.message || 'Error al eliminar producto del carrito');
      }
      set({
        loading: false,
        error: err.response?.data?.message || 'Failed to remove item from cart'
      });
    }
  },
  
  clearCart: async () => {
    set({ loading: true, error: null });

    // Si el usuario no está autenticado, limpiar localmente
    if (!get().isAuthenticated()) {
      try {
        set({
          items: [],
          total: 0,
          itemCount: 0,
          loading: false,
          error: null
        });

        // Limpiar localStorage
        localStorage.removeItem('localCart');
        
        toast.success('Carrito vaciado!');
        console.log('✅ Carrito limpiado localmente');
        return;
      } catch (err) {
        console.error('Error clearing local cart:', err);
        toast.error('Error al vaciar el carrito');
        set({
          loading: false,
          error: err.message || 'Failed to clear cart'
        });
        return;
      }
    }

    // Usuario autenticado - limpiar en servidor
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
        toast.error('Por favor inicia sesión para vaciar el carrito');
        localStorage.removeItem('token'); // Limpiar token inválido
      } else {
        toast.error(err.response?.data?.message || 'Error al vaciar el carrito');
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

  // Función de inicialización automática del carrito
  initializeCart: async () => {
    // Inicializando carrito
    
    if (get().isAuthenticated()) {
      // Usuario autenticado - sincronizar carrito local con servidor
      // Usuario autenticado, sincronizando carrito
      await get().syncLocalCartWithServer();
    } else {
      // Usuario no autenticado - cargar carrito local
      // Usuario no autenticado, cargando carrito local
      const loaded = get().loadLocalCart();
      if (!loaded) {
        // No hay carrito local, inicializando vacío
        set({
          items: [],
          total: 0,
          itemCount: 0,
          loading: false,
          error: null
        });
      }
    }
  },

  // Función para verificar y actualizar stock en tiempo real
  validateStock: async () => {
    if (get().items.length === 0) return;

    try {
      const itemsToValidate = get().items.map(item => item.product_id);
      const response = await axios.post('/products/validate-stock', { productIds: itemsToValidate });
      
      if (response.data && response.data.products) {
        const stockData = response.data.products;
        let hasChanges = false;
        const updatedItems = get().items.map(item => {
          const stockInfo = stockData.find(p => p.id === item.product_id);
          if (stockInfo && stockInfo.stock !== item.stock) {
            hasChanges = true;
            return { ...item, stock: stockInfo.stock };
          }
          return item;
        });

        if (hasChanges) {
          const { total, itemCount } = get().calculateTotals(updatedItems);
          set({
            items: updatedItems,
            total,
            itemCount
          });
          
          // Guardar cambios si no está autenticado
          if (!get().isAuthenticated()) {
            get().saveLocalCart(updatedItems);
          }
          
          toast.info('Stock actualizado - revisa tu carrito');
        }
      }
    } catch (error) {
      console.error('Error validating stock:', error);
      // No mostrar error al usuario para validación de stock silenciosa
    }
  },

  // Función para recuperar automáticamente de errores de red
  retryOperation: async (operation, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.log(`Intento ${attempt} falló:`, error.message);
        
        if (attempt < maxRetries) {
          // Esperar antes del siguiente intento (backoff exponencial)
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  },

  // Función para manejar errores de conexión
  handleConnectionError: (error) => {
    if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
      toast.error('Error de conexión. Verificando conectividad...');
      
      // Intentar reconectar después de 5 segundos
      setTimeout(() => {
        if (navigator.onLine) {
          toast.info('Conexión restaurada. Sincronizando carrito...');
          get().initializeCart();
        } else {
          toast.warning('Sin conexión a internet. Los cambios se guardarán localmente.');
        }
      }, 5000);
      
      return true;
    }
    return false;
  },

  // Función para sincronizar carrito cuando se recupera la conexión
  syncOnReconnect: () => {
    const handleOnline = () => {
      console.log('Conexión restaurada, sincronizando carrito...');
      if (get().isAuthenticated()) {
        get().syncLocalCartWithServer();
      }
    };

    window.addEventListener('online', handleOnline);
    
    // Cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  },
}));

export default useCartStore;