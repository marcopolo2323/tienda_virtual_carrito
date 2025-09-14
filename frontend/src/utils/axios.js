import axios from 'axios';
import { toast } from 'react-toastify';

// Configurar la URL base de la API (SIN /api al final)
const getApiBaseUrl = () => {
  // En desarrollo, usar localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:5000';
  }
  
  // En producción, usar la URL de Render
  return 'https://tienda-diego-qkm5.onrender.com';
};

// Crear instancia de axios con configuración
const apiClient = axios.create({
  baseURL: getApiBaseUrl() + '/api',  // Agregar /api directamente a la baseURL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Función para hacer peticiones con URL base forzada
const makeRequest = (method, url, data = null, config = {}) => {
  const fullConfig = {
    ...config,
    baseURL: getApiBaseUrl() + '/api',  // Asegurar /api en la URL base
    url: url,
    method: method.toLowerCase()
  };
  
  if (data) {
    fullConfig.data = data;
  }
  
  console.log('🌐 Petición forzada:', method.toUpperCase(), getApiBaseUrl() + '/api' + url);
  return apiClient(fullConfig);
};

// Debug: mostrar la URL base configurada
console.log('🔧 API Client baseURL configurada:', apiClient.defaults.baseURL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    // Asegurar que la URL base esté configurada correctamente
    config.baseURL = getApiBaseUrl() + '/api';
    
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

export default apiClient;