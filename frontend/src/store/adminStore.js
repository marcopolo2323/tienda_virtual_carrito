import { create } from 'zustand';
import axios from '../utils/axios';

const useAdminStore = create((set, get) => ({
  // Loading states
  loading: {
    dashboard: false,
    users: false,
    products: false,
    orders: false,
    reports: false,
    categories: false
  },

  // Error states
  errors: {
    dashboard: null,
    users: null,
    products: null,
    orders: null,
    reports: null,
    categories: null
  },

  // Data
  dashboardData: null,
  users: [],
  products: [],
  orders: [],
  categories: [],
  reports: {
    sales: null,
    products: null,
    categories: null
  },

  // Pagination
  pagination: {
    users: { currentPage: 1, totalPages: 1 },
    products: { currentPage: 1, totalPages: 1 },
    orders: { currentPage: 1, totalPages: 1 }
  },

  // Filters
  filters: {
    users: { search: '', role: '' },
    products: { search: '', category: '' },
    orders: { status: '', search: '' }
  },

  // Actions
  setLoading: (section, isLoading) => set((state) => ({
    loading: { ...state.loading, [section]: isLoading }
  })),

  setError: (section, error) => set((state) => ({
    errors: { ...state.errors, [section]: error }
  })),

  clearError: (section) => set((state) => ({
    errors: { ...state.errors, [section]: null }
  })),

  // Dashboard actions
  fetchDashboardData: async () => {
    const { setLoading, setError } = get();
    
    setLoading('dashboard', true);
    setError('dashboard', null);
    
    try {
      const response = await axios.get('/admin/dashboard');
      set({ dashboardData: response.data });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('dashboard', error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading('dashboard', false);
    }
  },

  // Categories actions
  fetchCategories: async () => {
    const { setLoading, setError } = get();
    
    setLoading('categories', true);
    setError('categories', null);
    
    try {
      const response = await axios.get('/categories');
      const categoriesData = Array.isArray(response.data) ? response.data : response.data.categories || [];
      set({ categories: categoriesData });
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('categories', error.response?.data?.message || 'Failed to load categories');
      set({ categories: [] }); // Mantener array vacío en caso de error
    } finally {
      setLoading('categories', false);
    }
  },

  // Users actions
  fetchUsers: async (page = 1, filters = {}) => {
    const { setLoading, setError } = get();
    
    setLoading('users', true);
    setError('users', null);
    
    try {
      let url = `/admin/users?page=${page}`;
      if (filters.search) url += `&search=${filters.search}`;
      if (filters.role) url += `&role=${filters.role}`;
      
      const response = await axios.get(url);
      
      set({ 
        users: response.data.users || response.data,
        pagination: {
          ...get().pagination,
          users: {
            currentPage: page,
            totalPages: response.data.total_pages || 1
          }
        },
        filters: {
          ...get().filters,
          users: filters
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('users', error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading('users', false);
    }
  },

  updateUser: async (userId, userData) => {
    try {
      await axios.put(`/admin/users/${userId}`, userData);
      
      // Update local state
      set(state => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, ...userData } : user
        )
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  deleteUser: async (userId) => {
    try {
      await axios.delete(`/admin/users/${userId}`);
      
      // Remove from local state
      set(state => ({
        users: state.users.filter(user => user.id !== userId)
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  // Products actions
  fetchProducts: async (page = 1, filters = {}) => {
    const { setLoading, setError } = get();
    
    setLoading('products', true);
    setError('products', null);
    
    try {
      let url = `/admin/products?page=${page}`;
      if (filters.search) url += `&search=${filters.search}`;
      if (filters.category) url += `&category=${filters.category}`;
      
      const response = await axios.get(url);
      
      set({ 
        products: response.data.products || response.data,
        pagination: {
          ...get().pagination,
          products: {
            currentPage: page,
            totalPages: response.data.total_pages || 1
          }
        },
        filters: {
          ...get().filters,
          products: filters
        }
      });
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('products', error.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading('products', false);
    }
  },

  createProduct: async (productData) => {
    try {
      const response = await axios.post('/products', productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Add to local state
      set(state => ({
        products: [response.data, ...state.products]
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  updateProduct: async (productId, productData) => {
    try {
      const response = await axios.put(`/products/${productId}`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Update local state
      set(state => ({
        products: state.products.map(product => 
          product.id === productId ? { ...product, ...response.data } : product
        )
      }));
      
      return response.data;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  deleteProduct: async (productId) => {
    try {
      await axios.delete(`/products/${productId}`);
      
      // Remove from local state
      set(state => ({
        products: state.products.filter(product => product.id !== productId)
      }));
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  // Orders actions
  fetchOrders: async (page = 1, filters = {}) => {
    const { setLoading, setError } = get();
    
    setLoading('orders', true);
    setError('orders', null);
    
    try {
      let url = `/admin/orders?page=${page}`;
      if (filters.status) url += `&status=${filters.status}`;
      if (filters.search) url += `&search=${filters.search}`;
      
      const response = await axios.get(url);
      
      set({ 
        orders: response.data.orders || response.data,
        pagination: {
          ...get().pagination,
          orders: {
            currentPage: page,
            totalPages: response.data.total_pages || 1
          }
        },
        filters: {
          ...get().filters,
          orders: filters
        }
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('orders', error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading('orders', false);
    }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await axios.put(`/admin/orders/${orderId}/status`, { status });
      
      // Update local state
      set(state => ({
        orders: state.orders.map(order => 
          order.id === orderId ? { ...order, status } : order
        )
      }));
      
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Reports actions
  fetchSalesReport: async (filters) => {
    const { setLoading, setError } = get();
    
    setLoading('reports', true);
    setError('reports', null);
    
    try {
      let url = `/admin/reports/sales?start_date=${filters.startDate}&end_date=${filters.endDate}`;
      if (filters.timeRange && filters.timeRange !== 'custom') url += `&time_range=${filters.timeRange}`;
      if (filters.categoryId) url += `&category_id=${filters.categoryId}`;
      
      const response = await axios.get(url);
      
      set(state => ({
        reports: {
          ...state.reports,
          sales: response.data
        }
      }));
    } catch (error) {
      console.error('Error fetching sales report:', error);
      setError('reports', error.response?.data?.message || 'Failed to load sales report');
    } finally {
      setLoading('reports', false);
    }
  },

  fetchProductsReport: async (filters) => {
    const { setLoading, setError } = get();
    
    setLoading('reports', true);
    setError('reports', null);
    
    try {
      let url = `/admin/reports/products?start_date=${filters.startDate}&end_date=${filters.endDate}`;
      if (filters.categoryId) url += `&category_id=${filters.categoryId}`;
      
      const response = await axios.get(url);
      
      set(state => ({
        reports: {
          ...state.reports,
          products: response.data
        }
      }));
    } catch (error) {
      console.error('Error fetching products report:', error);
      setError('reports', error.response?.data?.message || 'Failed to load products report');
    } finally {
      setLoading('reports', false);
    }
  },

  fetchCategoriesReport: async (filters) => {
    const { setLoading, setError } = get();
    
    setLoading('reports', true);
    setError('reports', null);
    
    try {
      const url = `/admin/reports/categories?start_date=${filters.startDate}&end_date=${filters.endDate}`;
      
      const response = await axios.get(url);
      
      set(state => ({
        reports: {
          ...state.reports,
          categories: response.data
        }
      }));
    } catch (error) {
      console.error('Error fetching categories report:', error);
      setError('reports', error.response?.data?.message || 'Failed to load categories report');
    } finally {
      setLoading('reports', false);
    }
  },

  // Reset functions
  resetReports: () => set(state => ({
    reports: { sales: null, products: null, categories: null }
  })),

  clearAllErrors: () => set(state => ({
    errors: {
      dashboard: null,
      users: null,
      products: null,
      orders: null,
      reports: null,
      categories: null
    }
  }))
}));

export default useAdminStore;