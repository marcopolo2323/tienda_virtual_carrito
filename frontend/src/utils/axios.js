import axios from 'axios';
import { toast } from 'react-toastify';

// Configurar la URL base de la API
const getBaseURL = () => {
  // En desarrollo, usar localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }
  
  // En producción, usar la variable de entorno o construir la URL
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
  
  if (apiBaseUrl) {
    // Si ya incluye /api, usarla tal como está
    if (apiBaseUrl.includes('/api')) {
      return apiBaseUrl;
    }
    // Si no incluye /api, agregarlo
    return `${apiBaseUrl}/api`;
  }
  
  // Fallback: construir URL basada en el host actual
  const currentHost = window.location.hostname;
  if (currentHost.includes('vercel.app')) {
    // Si estamos en Vercel, usar la URL de Render
    return 'https://tienda-diego-qkm5.onrender.com/api';
  }
  
  // Fallback por defecto
  return 'http://localhost:5000/api';
};

axios.defaults.baseURL = getBaseURL();

// Debug: mostrar la URL base configurada
console.log('🔧 Axios baseURL configurada:', axios.defaults.baseURL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

// Interceptor para agregar el token a las peticiones
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Ha ocurrido un error';
    toast.error(message);
    return Promise.reject(error);
  }
);

export default axios;