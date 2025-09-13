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

// Debug: mostrar la URL base configurada
console.log('🔧 API Client baseURL configurada:', apiClient.defaults.baseURL);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
console.log('🔧 REACT_APP_API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

// Interceptor para agregar el token a las peticiones
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log('🌐 Petición:', config.method?.toUpperCase(), config.baseURL + config.url);
    return config;
  },
  (error) => {
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

export default apiClient;