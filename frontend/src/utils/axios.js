import axios from 'axios';
import { toast } from 'react-toastify';

// Configurar la URL base de la API
const getApiBaseUrl = () => {
  // En desarrollo, usar localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000/api';
  }
  
  // En producción, usar la URL de Render
  return 'https://tienda-diego-qkm5.onrender.com/api';
};

// Crear instancia de axios con configuración
const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Función para hacer peticiones con URL base forzada
const makeRequest = (method, url, data = null, config = {}) => {
  const fullUrl = url.startsWith('/api/') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`;
  const fullConfig = {
    ...config,
    baseURL: getApiBaseUrl(),
    url: fullUrl,
    method: method.toLowerCase()
  };
  
  if (data) {
    fullConfig.data = data;
  }
  
  console.log('🌐 Petición forzada:', method.toUpperCase(), getApiBaseUrl() + fullUrl);
  return apiClient(fullConfig);
};

// Debug: mostrar la URL base configurada
console.log('🔧 API Client baseURL configurada:', apiClient.defaults.baseURL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

// Interceptor para agregar el token a las peticiones y asegurar URL base
apiClient.interceptors.request.use(
  (config) => {
    // Forzar la URL base
    config.baseURL = getApiBaseUrl();
    
    // Asegurar que la URL incluya /api si no la tiene
    if (config.url && !config.url.startsWith('/api/') && !config.url.startsWith('http')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🌐 Petición:', config.method?.toUpperCase(), config.baseURL + config.url);
    console.log('🌐 URL completa:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Ha ocurrido un error';
    toast.error(message);
    return Promise.reject(error);
  }
);

// Métodos de conveniencia
const api = {
  get: (url, config = {}) => makeRequest('GET', url, null, config),
  post: (url, data, config = {}) => makeRequest('POST', url, data, config),
  put: (url, data, config = {}) => makeRequest('PUT', url, data, config),
  delete: (url, config = {}) => makeRequest('DELETE', url, null, config),
  patch: (url, data, config = {}) => makeRequest('PATCH', url, data, config)
};

export default api;