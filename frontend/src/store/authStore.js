import { create } from 'zustand';
import axios from '../utils/axios';
import { toast } from 'react-toastify';

const useAuthStore = create((set, get) => ({
  currentUser: null, 
  loading: false,
  error: null,
  isAuthenticated: false,
  token: null,

  clearError: () => set({ error: null }),

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({ token, isAuthenticated: false, loading: true }); // loading true mientras verificamos
      const user = await get().checkUserLoggedIn();
      
      // Después de verificar la autenticación, inicializar el carrito
      if (user) {
        const cartStore = require('./cartStore').default.getState();
        await cartStore.initializeCart();
      }
      
      return user;
    } else {
      set({ currentUser: null, isAuthenticated: false, token: null, loading: false });
      return null;
    }
  },

  checkUserLoggedIn: async () => {
    set({ loading: true });
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        set({ currentUser: null, isAuthenticated: false, token: null, loading: false });
        return null;
      }

      const response = await axios.get('/auth/profile');
      console.log('🔍 AuthStore - Profile response:', response.data);
      set({ 
        currentUser: response.data.user, 
        isAuthenticated: true, 
        token: token,
        loading: false,
        error: null 
      });
      
      // Después de confirmar la autenticación, inicializar el carrito
      const cartStore = require('./cartStore').default.getState();
      await cartStore.initializeCart();
      
      return response.data.user;
    } catch (err) {
      console.error('Auth check failed:', err);
      localStorage.removeItem('token');
      set({ 
        currentUser: null, 
        isAuthenticated: false,
        token: null, 
        loading: false, 
        error: err.response?.data?.message || 'Error checking authentication' 
      });
      
      // Limpiar carrito si falla la autenticación
      const cartStore = require('./cartStore').default.getState();
      cartStore.clearCartOnLogout();
      
      return null;
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const response = await axios.post('/auth/register', userData);
      toast.success('Registration successful! Please log in.');
      set({ loading: false, error: null });
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Registration failed' 
      });
      return null;
    }
  },

  login: async ({ email, password }) => {
    set({ loading: true });
    try {
      const response = await axios.post('/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      
      // Fetch user profile after login
      const profileResponse = await axios.get('/auth/profile');
      console.log('🔍 AuthStore - Login profile response:', profileResponse.data);
      set({ 
        currentUser: profileResponse.data.user, 
        isAuthenticated: true, 
        token: response.data.token,
        loading: false,
        error: null
      });
      
      // IMPORTANTE: Inicializar el carrito inmediatamente después del login exitoso
      const cartStore = require('./cartStore').default.getState();
      await cartStore.initializeCart();
      
      toast.success('Login successful!');
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Login failed' 
      });
      return null;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      localStorage.removeItem('token');

      // Limpiar el carrito al desconectar
      const cartStore = require('./cartStore').default.getState();
      cartStore.clearCartOnLogout();

      toast.info('You have been logged out');
      set({ 
        currentUser: null, 
        isAuthenticated: false,
        token: null, 
        loading: false,
        error: null
      });
      return true;
    } catch (err) {
      console.error('Error during logout:', err);
      localStorage.removeItem('token');
      
      // Asegurar que el carrito se limpie incluso si hay error
      const cartStore = require('./cartStore').default.getState();
      cartStore.clearCartOnLogout();
      
      set({ 
        currentUser: null, 
        isAuthenticated: false, 
        token: null,
        loading: false,
        error: null
      });
      return false;
    }
  },

  // MÉTODO PARA ACTUALIZAR SOLO DATOS DE PERFIL (sin contraseña)
  updateProfile: async (userData) => {
    set({ loading: true });
    try {
      // Filtrar datos de contraseña para evitar conflictos
      const { current_password, new_password, ...profileData } = userData;
      
      const response = await axios.put('/auth/profile', profileData);
      toast.success('Profile updated successfully!');
      set({ 
        currentUser: response.data.user, 
        loading: false,
        error: null
      });
      return response.data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
      set({ 
        loading: false, 
        error: err.response?.data?.message || 'Failed to update profile' 
      });
      throw err; // Re-throw para que el componente pueda manejarlo
    }
  },

  // NUEVO MÉTODO ESPECÍFICO PARA CAMBIO DE CONTRASEÑA
  changePassword: async (passwordData) => {
    set({ loading: true });
    try {
      // Convertir de snake_case a camelCase para que coincida con el backend
      const backendData = {
        currentPassword: passwordData.current_password,
        newPassword: passwordData.new_password
      };
      
      console.log('Sending password change data:', backendData);
      const response = await axios.put('/auth/change-password', backendData);
      toast.success('Password changed successfully! Please log in again.');
      set({ 
        loading: false,
        error: null
      });
      
      // Opcional: Logout automático después del cambio de contraseña por seguridad
      setTimeout(async () => {
        await get().logout();
      }, 2000);
      
      return response.data;
    } catch (err) {
      let errorMessage = 'Failed to change password';
      
      // Manejar errores específicos
      if (err.response?.status === 400) {
        errorMessage = err.response.data?.message || 'Current password is incorrect';
      } else if (err.response?.status === 422) {
        errorMessage = 'Invalid password format';
      }
      
      toast.error(errorMessage);
      set({ 
        loading: false, 
        error: errorMessage 
      });
      throw err; // Re-throw para que el componente pueda manejarlo
    }
  },
  
}));

export default useAuthStore;